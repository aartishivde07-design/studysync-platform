import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "instance", "studysync.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE student_profiles ADD COLUMN college_email VARCHAR(120) DEFAULT ''")
    conn.commit()
    print("Added college_email column to student_profiles.")
except sqlite3.OperationalError as e:
    print(f"Column may already exist or error: {e}")

conn.close()
