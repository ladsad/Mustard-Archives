"""
Mustard Archives PySpark Analytics
===================================
Query plan analysis for understanding Spark execution.

Learn to read and optimize Spark query plans:
- Filter pushdown
- Broadcast joins vs shuffle joins
- Hash aggregation
"""
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, broadcast

spark = SparkSession.builder \
    .appName("QueryPlanAnalysis") \
    .master("local[*]") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

df_spark = spark.read \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .csv('data/synthetic_sessions.csv')

print("=" * 80)
print("QUERY PLAN ANALYSIS: Understanding Spark's Execution")
print("=" * 80)

# Example 1: Simple filter + group
query1 = df_spark \
    .filter(col("event_type") == "purchase") \
    .groupby("user_id") \
    .agg(count("*").alias("purchase_count"))

print("\n[Query 1] Filter by event_type, then group by user_id")
print("-" * 80)
query1.explain(mode="extended")

print("\n\n[KEY OBSERVATIONS]:")
print("  1. Look for 'Filter (event_type = purchase)' -> Spark pushed filter down")
print("  2. Look for 'Exchange' -> data shuffled across network (expensive!)")
print("  3. Look for 'HashAggregate' -> fast in-memory grouping")

# Example 2: Join without optimization (causes shuffle)
print("\n" + "=" * 80)
print("[Query 2] Join without optimization")
print("-" * 80)

user_data = spark.createDataFrame([
    (1, "Alice", "US"),
    (2, "Bob", "UK"),
], ["user_id", "name", "country"])

query2 = df_spark \
    .groupby("user_id").agg(sum("value").alias("revenue")) \
    .join(user_data, on="user_id", how="inner")

query2.explain(mode="simple")

print("\n\n[KEY OBSERVATIONS]:")
print("  1. Look for 'SortMergeJoin' -> expensive, requires sorting and shuffling")
print("  2. Two 'Exchange' steps (one per table) -> lots of network communication")

# Example 3: Join with broadcast optimization
print("\n" + "=" * 80)
print("[Query 3] Join WITH broadcast optimization (fast!)")
print("-" * 80)

query3 = df_spark \
    .groupby("user_id").agg(sum("value").alias("revenue")) \
    .join(broadcast(user_data), on="user_id", how="inner")

query3.explain(mode="simple")

print("\n\n[KEY OBSERVATIONS]:")
print("  1. Look for 'BroadcastHashJoin' -> fast!")
print("  2. Only ONE 'Exchange' (df_spark side) -> less shuffling")
print("  3. user_data broadcasted to all executors -> no shuffle needed")

print("\n" + "=" * 80)
print("OPTIMIZATION SUMMARY")
print("=" * 80)
print("\n  GOOD patterns to look for:")
print("    - Filter appears early (filter pushdown)")
print("    - BroadcastHashJoin for small tables")
print("    - HashAggregate for groupBy operations")
print("\n  BAD patterns to avoid:")
print("    - Many 'Exchange' operations (shuffle = slow)")
print("    - SortMergeJoin on large tables without partitioning")
print("    - Collect() on large datasets")

spark.stop()
