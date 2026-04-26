
# agentcivic/intake/process_live.py

import sys
import os
import time
import datetime
import pandas as pd
import json
import glob

# Add backend to sys.path to ensure we can import config and other modules
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from intake.processor import process_batch
from config.paths import QUEUE_DIR, PROCESSED_DIR

POLL_INTERVAL_SECONDS = 60 * 5

def main():
    print("Starting Live Data Ingestion Daemon (Queue Mode)...")
    print("Press Ctrl+C to stop.")
    
    queue_path = str(QUEUE_DIR)
    output_path = str(PROCESSED_DIR / "live_stream")
    
    # Ensure output directory exists (queue directory should be created by API)
    if not os.path.exists(output_path):
        os.makedirs(output_path, exist_ok=True)
        
    print(f"Monitoring Queue: {queue_path}")
    print(f"Output Directory: {output_path}")

    try:
        while True:
            # 1. Scan for JSON files in queue
            if not os.path.exists(queue_path):
                time.sleep(POLL_INTERVAL_SECONDS)
                continue
                
            json_files = glob.glob(os.path.join(queue_path, "*.json"))
            
            if json_files:
                print(f"[{datetime.datetime.now().time()}] Found {len(json_files)} new tickets in queue.")
                
                batch_data = []
                processed_files = []
                
                # 2. Read all files
                for json_file in json_files:
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            # Handle both list of dicts and single dict
                            if isinstance(data, list):
                                batch_data.extend(data)
                            elif isinstance(data, dict):
                                batch_data.append(data)
                            processed_files.append(json_file)
                    except Exception as e:
                        print(f"Error reading {json_file}: {e}")
                
                if batch_data:
                    # 3. Process Batch
                    try:
                        df_batch = process_batch(batch_data)
                        
                        # 4. Save to unique Parquet file
                        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                        filename = f"batch_{timestamp}.parquet"
                        output_file = os.path.join(output_path, filename)
                        
                        df_batch.to_parquet(output_file, index=False)
                        print(f"Saved batch to {output_file}")
                        
                        # 5. Delete processed files only if processing succeeded
                        for f in processed_files:
                            try:
                                os.remove(f)
                            except OSError as e:
                                print(f"Error deleting {f}: {e}")
                                
                    except Exception as e:
                        print(f"Error processing batch: {e}")
                else:
                    # Valid files were found but contained no data? Clean them up.
                    for f in processed_files:
                        try:
                            os.remove(f)
                        except OSError:
                            pass

            time.sleep(POLL_INTERVAL_SECONDS)
            
    except KeyboardInterrupt:
        print("\nStopping Live Ingestion.")

if __name__ == "__main__":
    main()
