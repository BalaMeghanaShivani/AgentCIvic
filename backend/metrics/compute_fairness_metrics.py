import json
import numpy as np
import pandas as pd

import sys
from pathlib import Path

# Add project root (parent of backend) to path
# sys.path.append(str(Path(__file__).resolve().parents[2]))

# Add backend directory to path to allow importing config
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Add backend to path and import centralized configuration
from config.paths import PROCESSED_DIR

# --- Configuration ---
INPUT_FILE = PROCESSED_DIR / "historical"
OUTPUT_FILE = PROCESSED_DIR / "fairness_metrics.json"

# --- LA Category Mapping ---
# Maps LA MyLA311 RequestType values to broader service categories
LA_CATEGORY_MAP = {
    "Pothole Repair":                "Infrastructure",
    "Sidewalk Repair":               "Infrastructure",
    "Street Resurfacing":            "Infrastructure",
    "Street Light Out/Damaged":      "Infrastructure",
    "Alley Cleaning":                "Infrastructure",
    "Bulky Items":                   "Sanitation",
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

def get_category(request_type: str) -> str:
    """Map an LA MyLA311 RequestType to a broader category."""
    return LA_CATEGORY_MAP.get(request_type, "Other")

def main():
    # 1. Load data and derive response_time_hours
    try:
        df = pd.read_parquet(INPUT_FILE)
    except FileNotFoundError:
        print(f"Error: Input file {INPUT_FILE} not found.")
        return

    # --- Derive LA-specific columns ---
    # Neighborhood: use ncname if available, otherwise fall back to "CD-<district>"
    df['neighborhood'] = df['ncname'].fillna('CD-' + df['cd'].astype(str))
    
    # Category: map requesttype to broader category via LA_CATEGORY_MAP
    df['category'] = df['requesttype'].apply(get_category)
    
    # Parse dates
    df['createddate'] = pd.to_datetime(df['createddate'])
    df['closeddate'] = pd.to_datetime(df['closeddate'])
    
    # Filter closed incidents with valid closeddate
    closed_df = df[
        (df['closeddate'].notna())
    ].copy()

    # Calculate response time in hours
    # (closeddate - createddate).total_seconds() / 3600
    df['response_time_hours'] = (df['closeddate'] - df['createddate']).dt.total_seconds() / 3600.0

    # Drop invalid response times (<= 0 or NaN)
    df = df[df['response_time_hours'] > 0]

    if df.empty:
        print("No valid response times found after filtering.")
        return

    # 2. Compute neighborhood-level metrics (N, median, p90)
    # Group by category, neighborhood (derived columns)
    
    # helper for p90
    def p90(x):
        return x.quantile(0.9)

    neighborhood_stats = df.groupby(['category', 'neighborhood'])['response_time_hours'].agg(
        N='count',
        p50_hr='median',
        p90_hr=p90
    ).reset_index()

    # 3. Compute city-wide baselines (p90) per category
    city_stats = df.groupby('category')['response_time_hours'].agg(
        city_p90_hr=p90
    ).reset_index()

    # 4. Join and Compute Ratio
    merged = pd.merge(neighborhood_stats, city_stats, on='category', how='left')

    # Avoid division by zero
    merged['ratio_p90'] = merged.apply(
        lambda row: row['p90_hr'] / row['city_p90_hr'] if row['city_p90_hr'] > 0 else 0.0, 
        axis=1
    )

    # 5. Rank and Worst-K Flag
    # Sort by category (asc) and ratio_p90 (desc)
    merged.sort_values(by=['category', 'ratio_p90'], ascending=[True, False], inplace=True)

    # Assign rank within each category
    merged['rank'] = merged.groupby('category').cumcount() + 1
    
    # Worst K flag (True if rank <= 3)
    merged['worst_k_flag'] = merged['rank'] <= 3

    # 6. Output to JSON
    # Replace NaN with None for JSON compatibility
    merged = merged.replace({np.nan: None})
    # Rename category to service_type to match downstream schema
    merged.rename(columns={'category': 'service_type'}, inplace=True)
    
    # Convert to list of dicts
    records = merged.to_dict(orient='records')
    
    # Write to file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(records, f, indent=2)

    # 7. Summary
    unique_categories = merged['service_type'].nunique()
    total_neighborhoods = len(merged)
    print(f"Processed {unique_categories} categories across {total_neighborhoods} neighborhood-category pairs.")
    print(f"Metrics saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
