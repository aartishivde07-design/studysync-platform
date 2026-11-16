import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "instance", "studysync.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

skills_to_add = [
    ('Node.js', 'Backend Development'),
    ('JavaScript', 'Programming Languages'),
    ('TypeScript', 'Programming Languages'),
    ('React.js', 'Frontend Development'),
    ('Express.js', 'Backend Development'),
    ('MongoDB', 'Databases'),
    ('SQL', 'Databases'),
    ('Python', 'Programming Languages'),
    ('Tailwind CSS', 'Frontend Development'),
    ('HTML/CSS', 'Frontend Development'),
    ('Docker', 'DevOps & Cloud'),
    ('Git / GitHub', 'Developer Tools'),
    ('Java', 'Programming Languages'),
    ('C++', 'Programming Languages'),
    ('Machine Learning', 'AI & Data'),
    ('UI/UX Design (Figma)', 'Design')
]

for name, cat in skills_to_add:
    cur.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (name,))
    row = cur.fetchone()
    if not row:
        cur.execute("INSERT INTO skills (name, category) VALUES (?, ?)", (name, cat))
        print(f"Added skill: {name}")
    else:
        print(f"Skill exists: {name}")

conn.commit()
conn.close()
print("Done checking skills.")
