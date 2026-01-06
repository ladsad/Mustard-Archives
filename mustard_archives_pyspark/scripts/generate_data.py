"""
Mustard Archives PySpark Analytics
===================================
Synthetic data generation for analytics pipeline testing.

Generates user session data with configurable row count.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

print("=" * 60)
print("STEP 1: Generate Synthetic Session Data")
print("=" * 60)

# Configuration: tune these for your machine's memory
# Default: 10M rows for 8GB RAM machines
NUM_ROWS = 10_000_000  # Adjusted for 8GB RAM
NUM_USERS = 25_000
NUM_SESSIONS = 2_000_000

np.random.seed(42)
random.seed(42)

print(f"\nGenerating {NUM_ROWS:,} rows of synthetic data...")
print(f"Estimated file size: ~{(NUM_ROWS * 100) / (1024**3):.2f} GB")

# Generate data in chunks to manage memory
chunk_size = 5_000_000
total_chunks = NUM_ROWS // chunk_size

# Ensure data directory exists
os.makedirs('data', exist_ok=True)
csv_path = 'data/synthetic_sessions.csv'

# Generate and write data in chunks
first_chunk = True
for chunk_num in range(total_chunks):
    print(f"\n  Processing chunk {chunk_num + 1}/{total_chunks}...")
    
    chunk_rows = chunk_size
    
    # Generate dates
    dates = [datetime(2024, 1, 1) + timedelta(days=random.randint(0, 365)) 
             for _ in range(chunk_rows)]
    
    # Generate other columns
    user_ids = np.random.choice(NUM_USERS, chunk_rows)
    session_ids = np.random.choice(NUM_SESSIONS, chunk_rows)
    event_types = np.random.choice(
        ['page_view', 'click', 'add_to_cart', 'purchase'], 
        chunk_rows, 
        p=[0.6, 0.25, 0.1, 0.05]
    )
    values = np.random.exponential(50, chunk_rows)
    
    # Create DataFrame
    df_chunk = pd.DataFrame({
        'user_id': user_ids,
        'session_id': session_ids,
        'event_type': event_types,
        'timestamp': dates,
        'value': values
    })
    
    # Write to CSV (append mode after first chunk)
    if first_chunk:
        df_chunk.to_csv(csv_path, index=False, mode='w')
        first_chunk = False
    else:
        df_chunk.to_csv(csv_path, index=False, mode='a', header=False)
    
    # Clear memory
    del df_chunk, dates, user_ids, session_ids, event_types, values

print(f"\n{'=' * 60}")
print("Dataset Generation Complete")
print("=" * 60)

# Get file size
file_size = os.path.getsize(csv_path) / (1024**3)
print(f"\n  File saved: {csv_path}")
print(f"  File size: {file_size:.2f} GB")
print(f"  Total rows: {NUM_ROWS:,}")
print(f"  Unique users: ~{NUM_USERS:,}")
print(f"  Unique sessions: ~{NUM_SESSIONS:,}")

# Preview first few rows
print(f"\nFirst 5 rows:")
preview = pd.read_csv(csv_path, nrows=5)
print(preview)
