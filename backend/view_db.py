"""
Database Inspector Utility for StudySync
Usage:
    python view_db.py            # Lists all tables and record counts
    python view_db.py users      # View records in a specific table
    python view_db.py projects
    python view_db.py student_profiles
"""

import sys
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "instance", "studysync.db")

def view_database():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    table_arg = sys.argv[1] if len(sys.argv) > 1 else None

    if table_arg:
        try:
            cursor.execute(f"SELECT * FROM {table_arg}")
            rows = cursor.fetchall()
            print(f"\n=== Table: {table_arg} ({len(rows)} records) ===")
            if not rows:
                print("(No records found)")
                return
            
            # Print columns
            col_names = [col[0] for col in cursor.description]
            print(" | ".join(col_names))
            print("-" * 80)
            for r in rows:
                values = [str(r[c])[:30] + ("..." if len(str(r[c])) > 30 else "") for c in col_names]
                print(" | ".join(values))
        except sqlite3.OperationalError as e:
            print(f"Error querying table '{table_arg}': {e}")
    else:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [r[0] for r in cursor.fetchall()]
        print(f"\n=== StudySync SQLite Database Summary ===")
        print(f"Location: {DB_PATH}\n")
        print(f"{'Table Name':<30} | {'Record Count':<12}")
        print("-" * 46)
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            cnt = cursor.fetchone()[0]
            print(f"{t:<30} | {cnt:<12}")
        print("\nTip: Run 'python view_db.py <table_name>' to view records in any table.")
        print("Example: python view_db.py users\n")

    conn.close()

if __name__ == "__main__":
    view_database()
