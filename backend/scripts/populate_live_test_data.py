import pandas as pd
import numpy as np
import os
from pathlib import Path
from datetime import datetime, timedelta
import random

# Configuration
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BACKEND_DIR / "data" / "processed"
LIVE_DIR = PROCESSED_DIR / "live_stream"
HISTORICAL_FILE = PROCESSED_DIR / "historical" / "la_311_data.parquet"
OUTPUT_FILE = LIVE_DIR / "test_open_incidents.parquet"

def main():
    print("🚀 Populating live test data with OPEN incidents...")
    
    if not LIVE_DIR.exists():
        LIVE_DIR.mkdir(parents=True, exist_ok=True)
        
    # Load some historical data to get valid neighborhoods and service types
    try:
        hist_df = pd.read_parquet(HISTORICAL_FILE)
        print(f"✅ Loaded historical data: {len(hist_df)} records")
    except Exception as e:
        print(f"❌ Error loading historical data: {e}")
        return

    # Sample some records to create open incidents
    sample_df = hist_df.sample(n=50).copy()
    
    # Update fields to make them "Open" and "Live"
    now = datetime.now()
    
    sample_df['status'] = 'open'
    # Set some as "aging" (more than 14 days old)
    sample_df.iloc[:20, sample_df.columns.get_loc('createddate')] = (now - timedelta(days=20)).isoformat()
    # Set some as "new"
    sample_df.iloc[20:, sample_df.columns.get_loc('createddate')] = (now - timedelta(days=2)).isoformat()
    
    # Ensure they have the correct columns for signals
    # ncname is used for neighborhood
    if 'ncname' not in sample_df.columns:
        sample_df['ncname'] = sample_df['neighborhood'] if 'neighborhood' in sample_df.columns else 'Unknown'
    
    # Map to categories in LA_CATEGORY_MAP
    # "Report Water Waste" -> "Environment"
    # "Illegal Dumping Pickup" -> "Sanitation"
    request_types = ["Report Water Waste", "Illegal Dumping Pickup", "Graffiti Removal", "Homeless Encampment"]
    sample_df['requesttype'] = [random.choice(request_types) for _ in range(len(sample_df))]
    
    # Save to parquet
    sample_df.to_parquet(OUTPUT_FILE, index=False)
    print(f"✅ Saved {len(sample_df)} open incidents to {OUTPUT_FILE}")
    
    print("\n💡 Now run the refresh endpoint or compute_neighborhood_signals.py to see the results.")

if __name__ == "__main__":
    main()
