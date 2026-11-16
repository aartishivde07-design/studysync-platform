"""
StudySync Demonstration Seed Script

This script populates the database with realistic student profiles, projects,
and study groups for demonstration and testing purposes.
Run: python seed.py
Reset & Re-seed: python seed.py --reset
"""

import sys
from app import create_app
from app.extensions import db
from app.models import (
    User, StudentProfile, Skill, UserSkill, Interest, UserInterest,
    Project, ProjectRequiredSkill, ProjectRole, JoinRequest, Team, TeamMember,
    StudyGroup, StudyGroupMember, Notification
)

def seed_database(reset=False):
    app = create_app()
    with app.app_context():
        if reset:
            print("Resetting database tables...")
            db.drop_all()
            db.create_all()

        if User.query.count() > 0 and not reset:
            print("Database already contains users. Skipping seed to preserve data.")
            print("Use 'python seed.py --reset' if you want a fresh demo seed.")
            return

        print("Seeding StudySync sample college data...")

        # 1. Skills catalog
        skills_data = {
            'Python': 'Backend',
            'React.js': 'Frontend',
            'Tailwind CSS': 'Frontend',
            'Flask': 'Backend',
            'FastAPI': 'Backend',
            'Node.js': 'Backend',
            'TypeScript': 'Frontend',
            'PyTorch': 'AI/ML',
            'Machine Learning': 'AI/ML',
            'PostgreSQL': 'Database',
            'MongoDB': 'Database',
            'Flutter': 'Mobile',
            'Docker': 'DevOps',
            'UI/UX Design (Figma)': 'Design'
        }
        skills_objs = {}
        for name, cat in skills_data.items():
            skill = Skill.query.filter_by(name=name).first()
            if not skill:
                skill = Skill(name=name, category=cat)
                db.session.add(skill)
                db.session.flush()
            skills_objs[name] = skill

        # 2. Interests catalog
        interests_data = {
            'Artificial Intelligence & GenAI': 'AI',
            'Full-Stack Web Development': 'Web',
            'Mobile App Innovation': 'Mobile',
            'Data Science & Analytics': 'Data',
            'Cloud Computing & DevOps': 'Infrastructure',
            'Open Source Contribution': 'Community',
            'Human-Computer Interaction (UI/UX)': 'Design'
        }
        interests_objs = {}
        for name, cat in interests_data.items():
            interest = Interest.query.filter_by(name=name).first()
            if not interest:
                interest = Interest(name=name, category=cat)
                db.session.add(interest)
                db.session.flush()
            interests_objs[name] = interest

        # 3. Create Sample College Students
        students_info = [
            {
                'email': 'priya.sharma@college.edu',
                'full_name': 'Priya Sharma',
                'department': 'Computer Science & Engineering',
                'academic_year': '1st Year',
                'college_name': 'Institute of Engineering & Tech',
                'bio': 'First-year CSE student enthusiastic about Python, algorithms, and full-stack web applications. Eager to collaborate on hands-on team projects.',
                'learning_goals': 'Master modern React and scalable backend API development with Flask.',
                'preferred_domains': 'Web Development, Artificial Intelligence',
                'availability': '10-15 hrs/week',
                'avatar_url': '',
                'skills': [('Python', 'Intermediate'), ('Flask', 'Beginner'), ('React.js', 'Beginner')],
                'interests': ['Full-Stack Web Development', 'Artificial Intelligence & GenAI']
            },
            {
                'email': 'alex.chen@college.edu',
                'full_name': 'Alex Chen',
                'department': 'Information Technology',
                'academic_year': '2nd Year',
                'college_name': 'Institute of Engineering & Tech',
                'bio': 'Frontend specialist passionate about crafting accessible, pixel-perfect user interfaces in React, Tailwind, and TypeScript.',
                'learning_goals': 'Deepen knowledge of state management and cloud backend integration.',
                'preferred_domains': 'Web Development, Human-Computer Interaction (UI/UX)',
                'availability': '15+ hrs/week',
                'avatar_url': '',
                'skills': [('React.js', 'Advanced'), ('Tailwind CSS', 'Advanced'), ('TypeScript', 'Intermediate'), ('UI/UX Design (Figma)', 'Advanced')],
                'interests': ['Full-Stack Web Development', 'Human-Computer Interaction (UI/UX)']
            },
            {
                'email': 'rohan.verma@college.edu',
                'full_name': 'Rohan Verma',
                'department': 'Computer Science & Engineering',
                'academic_year': '2nd Year',
                'college_name': 'Institute of Engineering & Tech',
                'bio': 'Backend developer and systems hobbyist. Love building RESTful APIs, database schemas, and microservices.',
                'learning_goals': 'Explore distributed systems, Redis caching, and Docker containerization.',
                'preferred_domains': 'Web Development, Cloud Computing & DevOps',
                'availability': '10-15 hrs/week',
                'avatar_url': '',
                'skills': [('Python', 'Advanced'), ('Flask', 'Advanced'), ('PostgreSQL', 'Intermediate'), ('Docker', 'Beginner')],
                'interests': ['Cloud Computing & DevOps', 'Full-Stack Web Development']
            },
            {
                'email': 'ananya.iyer@college.edu',
                'full_name': 'Ananya Iyer',
                'department': 'Data Science & AI',
                'academic_year': '1st Year',
                'college_name': 'Institute of Engineering & Tech',
                'bio': 'Passionate about machine learning models, statistical analysis, and computer vision. Looking for frontend teammates to turn ML models into real web apps.',
                'learning_goals': 'Deploy PyTorch neural network pipelines to production web interfaces.',
                'preferred_domains': 'Artificial Intelligence, Data Science & Analytics',
                'availability': '10-15 hrs/week',
                'avatar_url': '',
                'skills': [('Python', 'Advanced'), ('PyTorch', 'Intermediate'), ('Machine Learning', 'Intermediate')],
                'interests': ['Artificial Intelligence & GenAI', 'Data Science & Analytics']
            },
            {
                'email': 'marcus.lee@college.edu',
                'full_name': 'Marcus Lee',
                'department': 'Software Engineering',
                'academic_year': '1st Year',
                'college_name': 'Institute of Engineering & Tech',
                'bio': 'First-year student learning mobile development with Flutter. Interested in student utility apps and collaborative study tools.',
                'learning_goals': 'Build cross-platform mobile apps with cloud synchronization.',
                'preferred_domains': 'Mobile App Innovation, Human-Computer Interaction (UI/UX)',
                'availability': '5-10 hrs/week',
                'avatar_url': '',
                'skills': [('Flutter', 'Intermediate'), ('UI/UX Design (Figma)', 'Intermediate'), ('Python', 'Beginner')],
                'interests': ['Mobile App Innovation', 'Human-Computer Interaction (UI/UX)']
            }
        ]

        created_users = []
        for s in students_info:
            user = User(
                email=s['email'],
                full_name=s['full_name'],
                department=s['department'],
                academic_year=s['academic_year']
            )
            user.set_password('Password123!')
            db.session.add(user)
            db.session.flush()

            profile = StudentProfile(
                user_id=user.id,
                department=user.department,
                academic_year=user.academic_year,
                college_name=s['college_name'],
                bio=s['bio'],
                learning_goals=s['learning_goals'],
                preferred_domains=s['preferred_domains'],
                availability=s['availability'],
                avatar_url=s['avatar_url']
            )
            db.session.add(profile)

            # Assign skills
            for sk_name, prof in s['skills']:
                if sk_name in skills_objs:
                    db.session.add(UserSkill(user_id=user.id, skill_id=skills_objs[sk_name].id, proficiency=prof))

            # Assign interests
            for int_name in s['interests']:
                if int_name in interests_objs:
                    db.session.add(UserInterest(user_id=user.id, interest_id=interests_objs[int_name].id))

            created_users.append(user)

        db.session.commit()

        # 4. Create Sample Projects
        priya = created_users[0]
        alex = created_users[1]
        ananya = created_users[3]

        # Project 1 (Created by Priya)
        p1 = Project(
            title='CampusMart – Student Peer-to-Peer Marketplace',
            description='A secure college campus marketplace for verified students to buy, sell, and exchange course textbooks, lab kits, calculators, and dorm essentials with zero middleman fees.',
            domain='Web Development',
            team_size=4,
            deadline='End of Semester',
            availability_requirement='10-15 hrs/week',
            creator_id=priya.id,
            status='recruiting'
        )
        db.session.add(p1)
        db.session.flush()

        db.session.add(ProjectRequiredSkill(project_id=p1.id, skill_id=skills_objs['React.js'].id, proficiency_level='Intermediate', is_required=True))
        db.session.add(ProjectRequiredSkill(project_id=p1.id, skill_id=skills_objs['Tailwind CSS'].id, proficiency_level='Intermediate', is_required=True))
        db.session.add(ProjectRequiredSkill(project_id=p1.id, skill_id=skills_objs['Python'].id, proficiency_level='Intermediate', is_required=True))
        
        db.session.add(ProjectRole(project_id=p1.id, role_name='Frontend UI Lead', open_spots=1))
        db.session.add(ProjectRole(project_id=p1.id, role_name='Database Engineer', open_spots=1))
        db.session.add(ProjectRole(project_id=p1.id, role_name='Quality Assurance', open_spots=1))

        t1 = Team(project_id=p1.id, name='Team CampusMart')
        db.session.add(t1)
        db.session.flush()
        db.session.add(TeamMember(team_id=t1.id, user_id=priya.id, role='Team Leader & Backend'))

        # Project 2 (Created by Ananya)
        p2 = Project(
            title='AI NoteCraft – Smart Lecture Summarizer & Flashcards',
            description='An AI-powered academic assistant that processes audio recordings, PDFs, and slide decks to generate concise lecture summaries, concept mind-maps, and automated spaced-repetition quizzes for students.',
            domain='Artificial Intelligence & GenAI',
            team_size=3,
            deadline='Mid Semester Evaluation',
            availability_requirement='10-15 hrs/week',
            creator_id=ananya.id,
            status='recruiting'
        )
        db.session.add(p2)
        db.session.flush()

        db.session.add(ProjectRequiredSkill(project_id=p2.id, skill_id=skills_objs['Python'].id, proficiency_level='Advanced', is_required=True))
        db.session.add(ProjectRequiredSkill(project_id=p2.id, skill_id=skills_objs['Machine Learning'].id, proficiency_level='Intermediate', is_required=True))
        db.session.add(ProjectRequiredSkill(project_id=p2.id, skill_id=skills_objs['React.js'].id, proficiency_level='Intermediate', is_required=False))

        db.session.add(ProjectRole(project_id=p2.id, role_name='Full-Stack React Integrator', open_spots=1))
        db.session.add(ProjectRole(project_id=p2.id, role_name='ML Pipeline Developer', open_spots=1))

        t2 = Team(project_id=p2.id, name='Team NoteCraft')
        db.session.add(t2)
        db.session.flush()
        db.session.add(TeamMember(team_id=t2.id, user_id=ananya.id, role='ML Research Lead'))

        # 5. Join Requests
        # Alex chen applied to Priya's project
        req1 = JoinRequest(
            project_id=p1.id,
            applicant_id=alex.id,
            message='Hi Priya! I have strong experience in React and Tailwind CSS and would love to build out the frontend components for CampusMart.',
            role_applied='Frontend UI Lead',
            status='pending'
        )
        db.session.add(req1)

        # Send notification to Priya
        db.session.add(Notification(
            user_id=priya.id,
            type='request_received',
            title='New Join Request Received',
            message=f"{alex.full_name} applied to join '{p1.title}' as Frontend UI Lead.",
            link='/requests'
        ))

        # 6. Study Groups
        sg1 = StudyGroup(
            name='Data Structures & Algorithms Sprint',
            subject='CS201 Data Structures',
            description='Collaborative problem solving on LeetCode patterns, trees, graphs, and dynamic programming to prepare for semester exams and coding interviews.',
            creator_id=priya.id,
            max_members=6,
            meeting_schedule='Mon & Wed at 6:30 PM (Library Room B)',
            preferred_learning_method='Live Whiteboarding & Timed Code Challenges'
        )
        db.session.add(sg1)
        db.session.flush()
        db.session.add(StudyGroupMember(study_group_id=sg1.id, user_id=priya.id))
        db.session.add(StudyGroupMember(study_group_id=sg1.id, user_id=alex.id))

        sg2 = StudyGroup(
            name='Modern Web Dev & Cloud Circles',
            subject='Full-Stack Web Engineering',
            description='Weekly deep-dives into modern web architectures, REST vs GraphQL, Dockerizing applications, and testing React applications.',
            creator_id=alex.id,
            max_members=5,
            meeting_schedule='Saturdays at 11:00 AM (Discord & Discord Voice)',
            preferred_learning_method='Code Reviews & Architecture Teardowns'
        )
        db.session.add(sg2)
        db.session.flush()
        db.session.add(StudyGroupMember(study_group_id=sg2.id, user_id=alex.id))

        db.session.commit()

        print("\n✅ Seed data populated successfully!")
        print("Demo Student Accounts (All passwords: 'Password123!'):")
        for s in students_info:
            print(f"  • {s['full_name']} <{s['email']}> | {s['department']} ({s['academic_year']})")
        print("\nTry logging in as:")
        print("  Email: priya.sharma@college.edu")
        print("  Password: Password123!")

if __name__ == '__main__':
    reset_flag = '--reset' in sys.argv
    seed_database(reset=reset_flag)
