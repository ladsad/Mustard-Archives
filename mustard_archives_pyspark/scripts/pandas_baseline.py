"""
Mustard Archives PySpark Analytics
===================================
Pandas baseline for performance comparison.

Implements three core transformations:
1. Sessionization - aggregate events by session
2. Funnel Analysis - track user journey
3. Cohort Analysis - group by signup month
"""
import pandas as pd
import numpy as np
import time
import json
import os

print("=" * 60)
print("PANDAS BASELINE: Three Core Transformations")
print("=" * 60)

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Load data
print("\n[1/4] Loading CSV into Pandas...")
start = time.time()
df = pd.read_csv('data/synthetic_sessions.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
load_time = time.time() - start

print(f"  Loaded {len(df):,} rows in {load_time:.2f}s")
print(f"  Memory usage: {df.memory_usage(deep=True).sum() / (1024**3):.2f} GB")

# ===== TRANSFORMATION 1: Sessionization =====
print("\n" + "=" * 60)
print("[2/4] SESSIONIZATION: Aggregate events by session")
print("=" * 60)

start = time.time()

session_summary = df.groupby('session_id').agg({
    'user_id': 'first',
    'event_type': lambda x: (x == 'purchase').sum(),  # Count purchases
    'value': 'sum',
    'timestamp': ['min', 'max']
}).reset_index()

session_summary.columns = [
    'session_id', 'user_id', 'conversions', 'revenue', 
    'session_start', 'session_end'
]
session_summary['session_duration'] = (
    session_summary['session_end'] - session_summary['session_start']
).dt.total_seconds()

pandas_session_time = time.time() - start

print(f"  Aggregated {len(session_summary):,} sessions in {pandas_session_time:.2f}s")
print(f"\n  Sample results:")
print(session_summary.head(10))

# ===== TRANSFORMATION 2: Funnel Analysis =====
print("\n" + "=" * 60)
print("[3/4] FUNNEL ANALYSIS: page_view -> click -> add_to_cart -> purchase")
print("=" * 60)

start = time.time()

funnel_stages = ['page_view', 'click', 'add_to_cart', 'purchase']

# Efficient approach: count unique users per event type
funnel_data = []
for stage in funnel_stages:
    stage_users = df[df['event_type'] == stage]['user_id'].nunique()
    funnel_data.append({
        'stage': stage,
        'user_count': stage_users
    })

funnel_df = pd.DataFrame(funnel_data)
first_stage_count = funnel_df.loc[0, 'user_count']
funnel_df['dropout_rate'] = (1 - (funnel_df['user_count'] / first_stage_count)) * 100

pandas_funnel_time = time.time() - start

print(f"  Computed funnel in {pandas_funnel_time:.2f}s")
print(f"\n  Funnel results:")
print(funnel_df)

# ===== TRANSFORMATION 3: Cohort Analysis =====
print("\n" + "=" * 60)
print("[4/4] COHORT ANALYSIS: Group users by signup month")
print("=" * 60)

start = time.time()

df['cohort_month'] = df['timestamp'].dt.to_period('M')
cohort_data = df.groupby(['cohort_month', 'user_id']).agg({
    'value': 'sum',
    'event_type': 'count'
}).reset_index()
cohort_data.columns = ['cohort_month', 'user_id', 'ltv', 'event_count']

cohort_summary = cohort_data.groupby('cohort_month').agg({
    'user_id': 'nunique',
    'ltv': 'mean',
    'event_count': 'mean'
}).reset_index()
cohort_summary.columns = ['cohort_month', 'cohort_size', 'avg_ltv', 'avg_events']

pandas_cohort_time = time.time() - start

print(f"  Computed cohorts in {pandas_cohort_time:.2f}s")
print(f"\n  Cohort results:")
print(cohort_summary)

# ===== FINAL SUMMARY =====
print("\n" + "=" * 60)
print("PANDAS BASELINE SUMMARY")
print("=" * 60)
total_pandas_time = pandas_session_time + pandas_funnel_time + pandas_cohort_time

print(f"\n  Sessionization:  {pandas_session_time:>8.2f}s")
print(f"  Funnel:          {pandas_funnel_time:>8.2f}s")
print(f"  Cohort:          {pandas_cohort_time:>8.2f}s")
print(f"  " + "-" * 30)
print(f"  TOTAL:           {total_pandas_time:>8.2f}s")

# Save metrics for comparison
metrics = {
    'pandas_session_time': pandas_session_time,
    'pandas_funnel_time': pandas_funnel_time,
    'pandas_cohort_time': pandas_cohort_time,
    'total_pandas_time': total_pandas_time,
    'row_count': len(df)
}
with open('logs/pandas_baseline.json', 'w') as f:
    json.dump(metrics, f, indent=2)

print(f"\n  Metrics saved to logs/pandas_baseline.json")
