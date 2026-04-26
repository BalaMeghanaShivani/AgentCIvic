import os
import sys
import pandas as pd
import requests
import shutil
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from env_config import la_311_url, la_311_soda_params
from config.paths import PROCESSED_DIR

def main():
    print("Fetching LA 311 Data...")
    url = la_311_url()
    params = la_311_soda_params() # default 180 days
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    if not data:
        print("No data found.")
        return
        
    df = pd.DataFrame(data)
    print(f"Downloaded {len(df)} records. Columns: {df.columns.tolist()}")
    
    # Save to historical
    hist_dir = PROCESSED_DIR / "historical"
    # Remove old SF data if present
    if hist_dir.exists():
        shutil.rmtree(hist_dir)
    hist_dir.mkdir(parents=True, exist_ok=True)
    
    out_file = hist_dir / "la_311_data.parquet"
    df.to_parquet(out_file)
    print(f"Saved LA historical data to {out_file}")

    # Also clear live stream since it has old SF schema
    live_dir = PROCESSED_DIR / "live_stream"
    if live_dir.exists():
        shutil.rmtree(live_dir)
    live_dir.mkdir(parents=True, exist_ok=True)
    
    # Save a small batch as a "live" batch so the live feed has something
    live_out = live_dir / "batch_la_simulated.parquet"
    df.head(50).to_parquet(live_out)
    print(f"Saved simulated LA live data to {live_out}")

if __name__ == "__main__":
    main()
