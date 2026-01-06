# Mustard Archives: Pandas to PySpark Migration

This module demonstrates how to scale analytics from single-machine Pandas to distributed PySpark.

## Quick Start

```bash
# 1. Create virtual environment
python -m venv pyspark_env
pyspark_env\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate synthetic data (50M rows)
python scripts/generate_data.py

# 4. Run Pandas baseline
python scripts/pandas_baseline.py

# 5. Run PySpark implementation
python scripts/spark_migration.py

# 6. Analyze query plans
python scripts/explain_queries.py

# 7. Optimize storage
python scripts/optimize_storage.py
```

## Project Structure

```
mustard_archives_pyspark/
├── data/                    # Synthetic dataset storage
│   └── synthetic_sessions.csv
├── scripts/                 # PySpark pipeline scripts
│   ├── generate_data.py     # Creates synthetic 50M-row dataset
│   ├── pandas_baseline.py   # Original Pandas transformations
│   ├── spark_migration.py   # Spark equivalents + benchmarking
│   ├── explain_queries.py   # Query plan analysis
│   └── optimize_storage.py  # Partitioning and Parquet conversion
├── notebooks/               # Jupyter notebooks for exploration
├── logs/                    # Benchmark results
│   ├── pandas_baseline.json
│   └── benchmark_results.json
├── requirements.txt
└── README.md
```

## Expected Results

| Task | Pandas | PySpark | Speedup |
|------|--------|---------|---------|
| Sessionization | ~45s | ~18s | **2.5x** |
| Funnel Analysis | ~52s | ~29s | **1.8x** |
| Cohort Analysis | ~38s | ~19s | **2.0x** |
| **TOTAL** | **~135s** | **~66s** | **~2.1x** |

## Key Learnings

1. **Lazy Evaluation:** Spark doesn't run until you call `.show()`, `.collect()`, or `.count()`
2. **Partitioning:** Filter queries 5-10x faster on partition keys
3. **Parquet:** 4x compression vs CSV with faster read times
4. **Broadcast Joins:** 15x speedup for joining small lookup tables

## Three Core Transformations

### 1. Sessionization
Aggregates events by session to compute:
- User ID (first event)
- Conversions (purchase count)
- Revenue (sum of values)
- Session duration

### 2. Funnel Analysis
Tracks user journey through stages:
- page_view -> click -> add_to_cart -> purchase
- Calculates dropout rates at each stage

### 3. Cohort Analysis
Groups users by signup month:
- Cohort size
- Average LTV
- Average event count

## Configuration

Adjust `NUM_ROWS` in `generate_data.py` based on your machine:

| Machine RAM | Recommended Rows | Data Size |
|-------------|------------------|-----------|
| 8GB | 10,000,000 | ~1GB |
| 16GB | 50,000,000 | ~4.5GB |
| 32GB+ | 100,000,000 | ~9GB |

## Next Steps

- Deploy to AWS EMR or GCP Dataproc
- Schedule with Apache Airflow
- Add real-time streaming with Kafka
