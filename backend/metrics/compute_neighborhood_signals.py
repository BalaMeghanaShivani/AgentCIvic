
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

import os
import sys
from pathlib import Path

# Add backend directory to path to allow importing config
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from config.paths import PROCESSED_DIR

# --- Configuration ---
HISTORICAL_FILE = PROCESSED_DIR / "historical"
LIVE_FILE = PROCESSED_DIR / "live_stream"
OUTPUT_FILE = PROCESSED_DIR / "neighborhood_signals.json"

# --- LA Column References ---
neighborhood_col = 'neighborhood'   # derived: NCName with CD fallback
district_col = 'CD'                 # LA council district (1-15)
source_col = 'RequestSource'        # LA request source column


def compute_la_bonus_signals(df):
    """
    Compute LA-specific bonus signals per neighborhood:
      - anon_rate:           % of requests filed anonymously (Anonymous == 'Y')
      - phone_rate:          % of requests filed via 'Phone' RequestSource
      - avg_resolution_lag:  mean days between ServiceDate and ClosedDate
    """
    results = []

    for neighborhood, group in df.groupby(neighborhood_col):
        n_total = len(group)
        if n_total == 0:
            continue

        # 1. Anonymous filing rate
        anon_count = (group['Anonymous'] == 'Y').sum() if 'Anonymous' in group.columns else 0
        anon_rate = anon_count / n_total

        # 2. Phone filing rate
        phone_count = (group[source_col] == 'Phone').sum() if source_col in group.columns else 0
        phone_rate = phone_count / n_total

        # 3. Average resolution lag (ServiceDate → ClosedDate)
        avg_lag = np.nan
        if 'ServiceDate' in group.columns and 'ClosedDate' in group.columns:
            svc = pd.to_datetime(group['ServiceDate'], errors='coerce')
            cld = pd.to_datetime(group['ClosedDate'], errors='coerce')
            lag_days = (cld - svc).dt.days
            avg_lag = lag_days.mean()

        results.append({
            neighborhood_col: neighborhood,
            'anon_rate': round(anon_rate, 4),
            'phone_rate': round(phone_rate, 4),
            'avg_resolution_lag': round(avg_lag, 2) if pd.notna(avg_lag) else None,
        })

    return pd.DataFrame(results)


def main():
    # 1. Load Data
    try:
        hist_df = pd.read_parquet(HISTORICAL_FILE)
        live_df = pd.read_parquet(LIVE_FILE)
    except FileNotFoundError as e:
        print(f"Error loading files: {e}")
        return
    except Exception as e:
        # Handle cases like empty files (ArrowInvalid)
        print(f"Error reading parquet files: {e}")
        # If files are empty/invalid, we can't do much.
        return

    # Ensure required columns exist is a good practice, but we trust the input per instructions.
    
    # --- Pre-processing ---
    # Derive neighborhood column for both dataframes
    LA_CATEGORY_MAP = {
        "Pothole Repair":                "Infrastructure",
        "Sidewalk Repair":               "Infrastructure",
        "Illegal Dumping Pickup":        "Sanitation",
        "Dead Animal Removal":           "Sanitation",
        "Electronic Waste":              "Sanitation",
        "Graffiti Removal":              "Graffiti",
        "Tree Inspection":               "GreenSpace",
        "Tree Trimming":                 "GreenSpace",
        "Tree Emergency (LA Sanitation)":"GreenSpace",
        "Homeless Encampment":           "SocialServices",
        "Report Water Waste":            "Environment",
    }
    
    for df in [hist_df, live_df]:
        if 'ncname' in df.columns and 'cd' in df.columns:
            df['neighborhood'] = df['ncname'].fillna('CD-' + df['cd'].astype(str))
        elif 'neighborhood' not in df.columns:
            df['neighborhood'] = 'Unknown'
            
        if 'requesttype' in df.columns:
            df['service_type'] = df['requesttype'].apply(lambda x: LA_CATEGORY_MAP.get(x, "Other"))

    # Ensure datetimes (LA column names)
    if 'createddate' in live_df.columns:
        live_df['createddate'] = pd.to_datetime(live_df['createddate'])
    
    if 'createddate' in hist_df.columns:
        hist_df['createddate'] = pd.to_datetime(hist_df['createddate'])

    # 2. Compute Signals
    
    # Base DataFrame of all relevant pairs
    keys = ['service_type', neighborhood_col]
    all_pairs = pd.concat([
        hist_df[keys], 
        live_df[keys]
    ]).drop_duplicates()
    
    # --- Signal 1: Backlog Pressure (Live Only) ---
    # backlog_pressure = open_live_incidents / (avg_daily_historical_closures + epsilon)
    
    # Live Open Incidents
    if not live_df.empty:
        live_open = live_df[live_df['status'] == 'open']
        open_counts = live_open.groupby(keys).size().reset_index(name='open_incidents')
    else:
        live_open = pd.DataFrame(columns=live_df.columns)
        open_counts = pd.DataFrame(columns=['service_type', neighborhood_col, 'open_incidents'])

    # Historical Daily Closures
    hist_closed = hist_df[hist_df['status'] == 'closed']
    
    if not hist_closed.empty and 'createddate' in hist_closed.columns:
        date_min = hist_closed['createddate'].min()
        date_max = hist_closed['createddate'].max()
        
        # Calculate span in days, prevent zero
        diff = (date_max - date_min)
        days_span = diff.days + (diff.seconds / 86400.0)
        if days_span < 1.0:
            days_span = 1.0
    else:
        days_span = 30.0 # Default if no history
    
    closure_counts = hist_closed.groupby(keys).size().reset_index(name='total_closures')
    closure_counts['avg_daily_closures'] = closure_counts['total_closures'] / days_span
    
    # --- Signal 2: Aging Tail 14d (Live Only) ---
    # (# live open > 14d) / (total live open)
    now = datetime.now()
    cutoff_date = now - timedelta(days=14)
    
    if not live_open.empty:
        aging_incidents = live_open[live_open['createddate'] < cutoff_date]
        aging_counts = aging_incidents.groupby(keys).size().reset_index(name='aging_count')
    else:
        aging_counts = pd.DataFrame(columns=['service_type', neighborhood_col, 'aging_count'])
    
    # --- Signal 3: Duplicate Rate (Historical Only) ---
    # is_duplicate = true / total historical
    # Live data is NOT used here.
    hist_total_counts = hist_df.groupby(keys).size().reset_index(name='hist_total')
    
    if 'is_duplicate' in hist_df.columns:
        duplicates = hist_df[hist_df['is_duplicate'] == True]
    else:
        duplicates = pd.DataFrame(columns=hist_df.columns)
    dup_counts = duplicates.groupby(keys).size().reset_index(name='dup_count')
    
    # --- Signal 4: Mislabel Rate (Historical Only) ---
    # confidence < 0.7 / total historical
    if 'service_type_confidence' in hist_df.columns:
        mislabels = hist_df[hist_df['service_type_confidence'] < 0.7]
    else:
        mislabels = pd.DataFrame(columns=hist_df.columns)
    mislabel_counts = mislabels.groupby(keys).size().reset_index(name='mislabel_count')
    
    # --- Signal 5: Agency Fragmentation (Historical Only) ---
    # 1 - (max_agency_share / total historical)
    frag_data = []
    
    # Fallback to 'owner' if 'agency' is not present
    agency_col_name = 'agency' if 'agency' in hist_df.columns else 'owner' if 'owner' in hist_df.columns else None
    
    if agency_col_name and not hist_df.empty:
        hist_agency = hist_df.dropna(subset=[agency_col_name])
        
        for (st, n), group in hist_agency.groupby(keys):
            total = len(group)
            if total == 0:
                frag_data.append([st, n, None])
                continue
                
            max_share_count = group[agency_col_name].value_counts().max()
            fragmentation = 1 - (max_share_count / total)
            frag_data.append([st, n, fragmentation])
            
    frag_df = pd.DataFrame(frag_data, columns=['service_type', neighborhood_col, 'agency_fragmentation'])
    
    # --- Merging Everything ---
    
    # Start with all pairs
    merged = all_pairs.copy()
    
    # Merge Backlog info (Live)
    merged = pd.merge(merged, open_counts, on=keys, how='left')
    merged = pd.merge(merged, closure_counts[['service_type', neighborhood_col, 'avg_daily_closures']], on=keys, how='left')
    
    merged['open_incidents'] = merged['open_incidents'].fillna(0)
    merged['avg_daily_closures'] = merged['avg_daily_closures'].fillna(0)
    
    epsilon = 0.01
    merged['backlog_pressure'] = merged['open_incidents'] / (merged['avg_daily_closures'] + epsilon)
    
    # Merge Aging info (Live)
    merged = pd.merge(merged, aging_counts, on=keys, how='left')
    merged['aging_count'] = merged['aging_count'].fillna(0)
    
    merged['aging_tail_14d'] = merged.apply(
        lambda x: x['aging_count'] / x['open_incidents'] if x['open_incidents'] > 0 else 0.0, 
        axis=1
    )
    
    # Merge Historical Totals (Historical)
    merged = pd.merge(merged, hist_total_counts, on=keys, how='left')
    merged['hist_total'] = merged['hist_total'].fillna(0)
    
    # Merge Duplicate info (Historical)
    merged = pd.merge(merged, dup_counts, on=keys, how='left')
    merged['dup_count'] = merged['dup_count'].fillna(0)
    
    merged['duplicate_rate'] = merged.apply(
        lambda x: x['dup_count'] / x['hist_total'] if x['hist_total'] > 0 else 0.0,
        axis=1
    )
    
    # Merge Mislabel info (Historical)
    merged = pd.merge(merged, mislabel_counts, on=keys, how='left')
    merged['mislabel_count'] = merged['mislabel_count'].fillna(0)
    
    merged['mislabel_rate'] = merged.apply(
        lambda x: x['mislabel_count'] / x['hist_total'] if x['hist_total'] > 0 else 0.0,
        axis=1
    )
    
    # Merge Fragmentation (Historical)
    if not frag_df.empty:
        merged = pd.merge(merged, frag_df, on=keys, how='left')
    else:
        merged['agency_fragmentation'] = None

    # --- LA Bonus Signals ---
    # Compute LA-specific signals from the combined dataset
    combined_df = pd.concat([hist_df, live_df], ignore_index=True)
    la_bonus = compute_la_bonus_signals(combined_df)

    if not la_bonus.empty:
        merged = pd.merge(merged, la_bonus, on=neighborhood_col, how='left')

    # --- Final Cleanup ---
    # Select columns
    final_cols = [
        'service_type', neighborhood_col, 
        'backlog_pressure', 'aging_tail_14d', 
        'duplicate_rate', 'mislabel_rate', 
        'agency_fragmentation',
        'anon_rate', 'phone_rate', 'avg_resolution_lag',
    ]

    # Only keep columns that actually exist (in case LA bonus columns are missing)
    final_cols = [c for c in final_cols if c in merged.columns]
    
    # Round floats for cleanliness (optional)
    final_df = merged[final_cols].round(4)
    
    # Output
    records = final_df.to_dict(orient='records')
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(records, f, indent=2)
        
    print(f"Processed {len(final_df)} neighborhood-service pairs.")
    print(f"Signals saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
