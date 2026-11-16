import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "instance", "studysync.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("UPDATE student_profiles SET avatar_url=''")
conn.commit()
print(f"Updated {cur.rowcount} profile records to clear photo URLs.")
conn.close()
