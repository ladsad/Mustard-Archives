"""
Mustard Archives PySpark Analytics
===================================
PySpark implementation with performance benchmarking.

Migrates Pandas transformations to PySpark:
1. Sessionization - aggregate events by session
2. Funnel Analysis - track user journey
3. Cohort Analysis - group by signup month
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, first, sum, when, min, max, 
    unix_timestamp, count, countDistinct, 
    avg, lit, trunc
)
from pyspark.sql.types import IntegerType, DoubleType, TimestampType
import time
import json
import os

print("=" * 60)
print("PYSPARK MIGRATION: Distributed Analytics")
print("=" * 60)

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Step 1: Create Spark Session
print("\n[1/5] Initializing Spark Session...")

spark = SparkSession.builder \
    .appName("MustardArchives_Analytics") \
    .master("local[*]") \
    .config("spark.sql.shuffle.partitions", "200") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \
    .config("spark.driver.memory", "4g") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

print(f"  Spark {spark.version} initialized")
print(f"  Available cores: {spark.sparkContext.defaultParallelism}")

# Step 2: Load CSV
print("\n[2/5] Loading CSV into Spark DataFrame...")
start = time.time()

df_spark = spark.read \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .csv('data/synthetic_sessions.csv')

# Cast columns to correct types
df_spark = df_spark \
    .withColumn("user_id", col("user_id").cast(IntegerType())) \
    .withColumn("session_id", col("session_id").cast(IntegerType())) \
    .withColumn("timestamp", col("timestamp").cast(TimestampType())) \
    .withColumn("value", col("value").cast(DoubleType()))

load_time = time.time() - start

print(f"  Schema inferred in {load_time:.2f}s")
print(f"\n  Schema:")
df_spark.printSchema()

# Cache for repeated queries
df_spark.cache()

print(f"\n  Dataframe cached in memory")

# Show sample
print(f"\n  Sample data:")
df_spark.show(5)

print("\n[KEY CONCEPT] This load was fast because Spark only *planned* the read.")
print("The actual count triggers the computation:")

start = time.time()
total_count = df_spark.count()
count_time = time.time() - start

print(f"  Total rows: {total_count:,}")
print(f"  Count triggered computation in {count_time:.2f}s")

# Load Pandas baseline for comparison
try:
    with open('logs/pandas_baseline.json', 'r') as f:
        pandas_metrics = json.load(f)
except FileNotFoundError:
    print("\n  WARNING: Run pandas_baseline.py first to get comparison metrics")
    pandas_metrics = {
        'pandas_session_time': 0,
        'pandas_funnel_time': 0,
        'pandas_cohort_time': 0,
        'total_pandas_time': 0
    }

# ===== TRANSFORMATION 1: Sessionization (Spark) =====
print("\n" + "=" * 60)
print("[3/5] SESSIONIZATION (PySpark)")
print("=" * 60)

start = time.time()

session_agg = df_spark.groupby("session_id").agg(
    first("user_id").alias("user_id"),
    sum(when(col("event_type") == "purchase", 1).otherwise(0)).alias("conversions"),
    sum("value").alias("revenue"),
    min("timestamp").alias("session_start"),
    max("timestamp").alias("session_end")
).withColumn(
    "session_duration_secs",
    (unix_timestamp(col("session_end")) - unix_timestamp(col("session_start")))
)

session_agg.cache()
spark_session_count = session_agg.count()
spark_session_time = time.time() - start

print(f"  Computed {spark_session_count:,} session summaries in {spark_session_time:.2f}s")
print(f"\n  Sample results:")
session_agg.show(5)

if pandas_metrics['pandas_session_time'] > 0:
    speedup = pandas_metrics['pandas_session_time'] / spark_session_time
    print(f"\n  Speedup over Pandas: {speedup:.1f}x")
    if speedup > 1:
        print(f"  PySpark is FASTER (expected on multi-core)")
    else:
        print(f"  Pandas was faster (expected on small datasets or single-core machines)")

# ===== TRANSFORMATION 2: Funnel Analysis (Spark) =====
print("\n" + "=" * 60)
print("[4/5] FUNNEL ANALYSIS (PySpark)")
print("=" * 60)

start = time.time()

funnel_stages = ['page_view', 'click', 'add_to_cart', 'purchase']

# Count distinct users per stage (more efficient than iterating)
funnel_results = []
for stage in funnel_stages:
    stage_users = df_spark \
        .filter(col("event_type") == stage) \
        .select("user_id") \
        .distinct() \
        .count()
    
    funnel_results.append({
        'stage': stage,
        'user_count': stage_users
    })

funnel_df = spark.createDataFrame(funnel_results)

# Add dropout rate
first_stage_count = funnel_results[0]['user_count']
funnel_df = funnel_df.withColumn(
    "dropout_rate",
    (1 - (col("user_count") / lit(first_stage_count))) * 100
)

spark_funnel_time = time.time() - start

print(f"  Computed funnel in {spark_funnel_time:.2f}s")
print(f"\n  Funnel results:")
funnel_df.show()

if pandas_metrics['pandas_funnel_time'] > 0:
    speedup = pandas_metrics['pandas_funnel_time'] / spark_funnel_time
    print(f"\n  Speedup over Pandas: {speedup:.1f}x")

# ===== TRANSFORMATION 3: Cohort Analysis (Spark) =====
print("\n" + "=" * 60)
print("[5/5] COHORT ANALYSIS (PySpark)")
print("=" * 60)

start = time.time()

cohort_data = df_spark \
    .withColumn("cohort_month", trunc(col("timestamp"), "month")) \
    .groupby("cohort_month", "user_id") \
    .agg(
        sum("value").alias("ltv"),
        count("*").alias("event_count")
    )

cohort_summary = cohort_data \
    .groupby("cohort_month") \
    .agg(
        countDistinct("user_id").alias("cohort_size"),
        avg("ltv").alias("avg_ltv"),
        avg("event_count").alias("avg_events")
    ) \
    .orderBy("cohort_month")

cohort_summary.cache()
spark_cohort_count = cohort_summary.count()
spark_cohort_time = time.time() - start

print(f"  Computed {spark_cohort_count:,} cohorts in {spark_cohort_time:.2f}s")
print(f"\n  Cohort results:")
cohort_summary.show()

if pandas_metrics['pandas_cohort_time'] > 0:
    speedup = pandas_metrics['pandas_cohort_time'] / spark_cohort_time
    print(f"\n  Speedup over Pandas: {speedup:.1f}x")

# ===== FINAL SUMMARY =====
print("\n" + "=" * 60)
print("PYSPARK vs PANDAS: Final Benchmark")
print("=" * 60)

spark_metrics = {
    'spark_session_time': spark_session_time,
    'spark_funnel_time': spark_funnel_time,
    'spark_cohort_time': spark_cohort_time,
    'spark_total_time': spark_session_time + spark_funnel_time + spark_cohort_time,
    'row_count': total_count
}

if pandas_metrics['total_pandas_time'] > 0:
    total_pandas = pandas_metrics['total_pandas_time']
    total_spark = spark_metrics['spark_total_time']
    total_speedup = total_pandas / total_spark

    print(f"\n{'Task':<20} {'Pandas (s)':<15} {'Spark (s)':<15} {'Speedup':<15}")
    print("-" * 65)
    
    sess_speedup = pandas_metrics['pandas_session_time'] / spark_session_time if spark_session_time > 0 else 0
    fun_speedup = pandas_metrics['pandas_funnel_time'] / spark_funnel_time if spark_funnel_time > 0 else 0
    coh_speedup = pandas_metrics['pandas_cohort_time'] / spark_cohort_time if spark_cohort_time > 0 else 0
    
    print(f"{'Sessionization':<20} {pandas_metrics['pandas_session_time']:<15.2f} {spark_session_time:<15.2f} {sess_speedup:<15.1f}x")
    print(f"{'Funnel':<20} {pandas_metrics['pandas_funnel_time']:<15.2f} {spark_funnel_time:<15.2f} {fun_speedup:<15.1f}x")
    print(f"{'Cohort':<20} {pandas_metrics['pandas_cohort_time']:<15.2f} {spark_cohort_time:<15.2f} {coh_speedup:<15.1f}x")
    print("-" * 65)
    print(f"{'TOTAL':<20} {total_pandas:<15.2f} {total_spark:<15.2f} {total_speedup:<15.1f}x")

    improvement_pct = (1 - 1/total_speedup) * 100 if total_speedup > 0 else 0
    print(f"\n  Migration reduces query time by {improvement_pct:.1f}%")
else:
    print("\n  No Pandas baseline found - run pandas_baseline.py first for comparison")
    print(f"\n  Spark Session Time: {spark_session_time:.2f}s")
    print(f"  Spark Funnel Time: {spark_funnel_time:.2f}s")
    print(f"  Spark Cohort Time: {spark_cohort_time:.2f}s")
    print(f"  Spark Total Time: {spark_metrics['spark_total_time']:.2f}s")

# Save metrics
all_metrics = {**pandas_metrics, **spark_metrics}
with open('logs/benchmark_results.json', 'w') as f:
    json.dump(all_metrics, f, indent=2)

print(f"\n  Metrics saved to logs/benchmark_results.json")

spark.stop()
