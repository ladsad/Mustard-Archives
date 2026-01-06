"""
Mustard Archives - Analytics API
=================================
Flask API serving PySpark analytics results to the React dashboard.

Endpoints:
- GET /api/analytics/funnel - Funnel stage data
- GET /api/analytics/cohorts - Cohort summary
- GET /api/analytics/sessions - Session aggregates
- GET /api/analytics/benchmarks - Performance comparison
"""
from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Path to logs directory
LOGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'logs')


def load_json_file(filename):
    """Load JSON data from logs directory."""
    filepath = os.path.join(LOGS_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None


@app.route('/api/analytics/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'analytics-api'})


@app.route('/api/analytics/funnel', methods=['GET'])
def get_funnel():
    """
    Returns funnel stage data.
    
    Response:
    {
        "stages": [
            {"stage": "page_view", "user_count": 24991, "dropout_rate": 0},
            {"stage": "click", "user_count": 18743, "dropout_rate": 25.0},
            {"stage": "add_to_cart", "user_count": 6247, "dropout_rate": 75.0},
            {"stage": "purchase", "user_count": 1249, "dropout_rate": 95.0}
        ]
    }
    """
    # Try to load from benchmark results
    benchmarks = load_json_file('benchmark_results.json')
    
    # Default funnel data (simulated based on typical conversion rates)
    funnel_data = {
        "stages": [
            {"stage": "page_view", "user_count": 24991, "dropout_rate": 0.0},
            {"stage": "click", "user_count": 18743, "dropout_rate": 25.0},
            {"stage": "add_to_cart", "user_count": 6247, "dropout_rate": 75.0},
            {"stage": "purchase", "user_count": 1249, "dropout_rate": 95.0}
        ],
        "total_users": 25000,
        "conversion_rate": 5.0
    }
    
    return jsonify(funnel_data)


@app.route('/api/analytics/cohorts', methods=['GET'])
def get_cohorts():
    """
    Returns cohort analysis data.
    
    Response format suitable for heatmap visualization.
    """
    # Simulated cohort data for 12 months
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    cohorts = []
    for i, month in enumerate(months):
        cohorts.append({
            "month": month,
            "cohort_size": 2000 + (i * 100),
            "avg_ltv": 250.50 + (i * 15.5),
            "avg_events": 4.5 + (i * 0.3),
            "retention_rate": max(10, 85 - (i * 5))
        })
    
    return jsonify({
        "cohorts": cohorts,
        "summary": {
            "total_cohorts": 12,
            "avg_cohort_size": 2550,
            "avg_ltv": 343.0
        }
    })


@app.route('/api/analytics/sessions', methods=['GET'])
def get_sessions():
    """
    Returns session aggregate metrics.
    """
    benchmarks = load_json_file('benchmark_results.json')
    
    row_count = benchmarks.get('row_count', 10000000) if benchmarks else 10000000
    
    return jsonify({
        "total_sessions": 2000000,
        "total_events": row_count,
        "avg_session_duration": 324.5,
        "avg_revenue_per_session": 45.23,
        "conversion_rate": 5.0,
        "metrics": {
            "page_views": int(row_count * 0.60),
            "clicks": int(row_count * 0.25),
            "add_to_cart": int(row_count * 0.10),
            "purchases": int(row_count * 0.05)
        }
    })


@app.route('/api/analytics/benchmarks', methods=['GET'])
def get_benchmarks():
    """
    Returns Pandas vs PySpark benchmark comparison.
    """
    benchmarks = load_json_file('benchmark_results.json')
    
    if benchmarks:
        pandas_total = benchmarks.get('total_pandas_time', 0)
        spark_total = benchmarks.get('spark_total_time', 0)
        
        return jsonify({
            "pandas": {
                "sessionization": benchmarks.get('pandas_session_time', 0),
                "funnel": benchmarks.get('pandas_funnel_time', 0),
                "cohort": benchmarks.get('pandas_cohort_time', 0),
                "total": pandas_total
            },
            "spark": {
                "sessionization": benchmarks.get('spark_session_time', 0),
                "funnel": benchmarks.get('spark_funnel_time', 0),
                "cohort": benchmarks.get('spark_cohort_time', 0),
                "total": spark_total
            },
            "speedup": {
                "sessionization": round(benchmarks.get('pandas_session_time', 1) / max(benchmarks.get('spark_session_time', 1), 0.01), 1),
                "funnel": round(benchmarks.get('pandas_funnel_time', 1) / max(benchmarks.get('spark_funnel_time', 1), 0.01), 1),
                "cohort": round(benchmarks.get('pandas_cohort_time', 1) / max(benchmarks.get('spark_cohort_time', 1), 0.01), 1),
                "total": round(pandas_total / max(spark_total, 0.01), 1)
            },
            "row_count": benchmarks.get('row_count', 10000000),
            "has_data": True
        })
    
    # Default benchmark data for demo
    return jsonify({
        "pandas": {
            "sessionization": 12.5,
            "funnel": 15.2,
            "cohort": 10.8,
            "total": 38.5
        },
        "spark": {
            "sessionization": 5.0,
            "funnel": 8.5,
            "cohort": 5.4,
            "total": 18.9
        },
        "speedup": {
            "sessionization": 2.5,
            "funnel": 1.8,
            "cohort": 2.0,
            "total": 2.0
        },
        "row_count": 10000000,
        "has_data": False
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Mustard Archives Analytics API")
    print("=" * 60)
    print("\nEndpoints:")
    print("  GET /api/analytics/health")
    print("  GET /api/analytics/funnel")
    print("  GET /api/analytics/cohorts")
    print("  GET /api/analytics/sessions")
    print("  GET /api/analytics/benchmarks")
    print("\nStarting server on http://localhost:5000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
