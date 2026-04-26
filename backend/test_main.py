import pandas as pd
f = "/Users/balashivanisp/PycharmProjects/AgentCIvic/backend/data/processed/live_stream/batch_la_simulated.parquet"
df = pd.read_parquet(f)
data = df.to_dict(orient='records')
import numpy as np
for k, v in data[0].items():
    if isinstance(v, np.ndarray):
        print("NDARRAY:", k)
    elif isinstance(v, dict):
        for k2, v2 in v.items():
             if isinstance(v2, np.ndarray):
                 print("NDARRAY in dict:", k, k2)
