"""
StudySync Automated Backend Integration & Workflow Tests

Tests all critical workflows:
- User Registration & Authentication (JWT)
- Profile Retrieval & Modification
- Skill & Interest Management
- Project Creation & Retrieval
- AI Matching Algorithm Execution (deterministic scoring & explainability)
- Join Request Submission, Acceptance & Rejection
- Team Formation & Membership Verification
- Study Group Creation & Joining
- Notifications Lifecycle
"""

import unittest
import json
from app import create_app
from app.extensions import db
from app.models import User, StudentProfile, Project, Team, JoinRequest, StudyGroup, Notification
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-secret-key-123'

class StudySyncWorkflowTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def register_user(self, email, full_name, password="Password123!", department="Computer Science", year="1st Year"):
        return self.client.post('/api/auth/register', json={
            'email': email,
            'full_name': full_name,
            'password': password,
            'confirm_password': password,
            'department': department,
            'academic_year': year,
            'college_name': 'Test University'
        })

    def login_user(self, email, password="Password123!"):
        return self.client.post('/api/auth/login', json={
            'email': email,
            'password': password
        })

    def test_01_user_registration_and_login(self):
        # Register new user
        reg_res = self.register_user('student1@college.edu', 'Student One')
        self.assertEqual(reg_res.status_code, 201)
        data = reg_res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'student1@college.edu')

        # Test duplicate registration rejection
        dup_res = self.register_user('student1@college.edu', 'Duplicate Student')
        self.assertEqual(dup_res.status_code, 409)

        # Login
        login_res = self.login_user('student1@college.edu')
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['token']

        # Get Current User via /api/auth/me
        me_res = self.client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()['user']['full_name'], 'Student One')

    def test_02_profile_update_and_skills(self):
        reg = self.register_user('dev@college.edu', 'Dev Student')
        token = reg.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}

        # Update profile
        update_res = self.client.put('/api/profiles/me', headers=headers, json={
            'bio': 'Passionate full-stack developer focusing on Python and React.',
            'availability': '15+ hrs/week',
            'learning_goals': 'Deep learning pipelines and cloud architecture.',
            'preferred_domains': ['Web Development', 'AI/ML']
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()['user']['profile']['bio'], 'Passionate full-stack developer focusing on Python and React.')

        # Add Skills
        skill_res1 = self.client.post('/api/skills', headers=headers, json={
            'name': 'Python',
            'proficiency': 'Advanced'
        })
        self.assertEqual(skill_res1.status_code, 201)

        skill_res2 = self.client.post('/api/skills', headers=headers, json={
            'name': 'React.js',
            'proficiency': 'Intermediate'
        })
        self.assertEqual(skill_res2.status_code, 201)

        # Verify skills on profile
        me = self.client.get('/api/auth/me', headers=headers).get_json()['user']
        self.assertEqual(len(me['skills']), 2)
        skill_names = [s['skill_name'] for s in me['skills']]
        self.assertIn('Python', skill_names)
        self.assertIn('React.js', skill_names)

        # Add Interest
        int_res = self.client.post('/api/interests', headers=headers, json={'name': 'Open Source'})
        self.assertEqual(int_res.status_code, 201)

        # Remove Skill
        skill_id = me['skills'][0]['skill_id']
        del_res = self.client.delete(f'/api/skills/{skill_id}', headers=headers)
        self.assertEqual(del_res.status_code, 200)

    def test_03_project_creation_and_matching(self):
        # Register User A (Leader)
        u1_res = self.register_user('leader@college.edu', 'Team Leader')
        u1_token = u1_res.get_json()['token']
        h1 = {'Authorization': f'Bearer {u1_token}'}

        # Add skills to Leader
        self.client.post('/api/skills', headers=h1, json={'name': 'Python', 'proficiency': 'Advanced'})

        # Register User B (Applicant / Candidate)
        u2_res = self.register_user('candidate@college.edu', 'Candidate Dev')
        u2_token = u2_res.get_json()['token']
        h2 = {'Authorization': f'Bearer {u2_token}'}

        # Add complementary skills to Candidate
        self.client.post('/api/skills', headers=h2, json={'name': 'React.js', 'proficiency': 'Advanced'})
        self.client.post('/api/skills', headers=h2, json={'name': 'Tailwind CSS', 'proficiency': 'Intermediate'})
        self.client.post('/api/interests', headers=h2, json={'name': 'Full-Stack Web Development'})

        # Leader creates project
        proj_res = self.client.post('/api/projects', headers=h1, json={
            'title': 'Campus Exchange Platform',
            'description': 'Student peer collaboration and marketplace.',
            'domain': 'Web Development',
            'team_size': 3,
            'availability_requirement': '10-15 hrs/week',
            'required_skills': [
                {'skill_name': 'React.js', 'proficiency_level': 'Intermediate'},
                {'skill_name': 'Tailwind CSS', 'proficiency_level': 'Intermediate'}
            ],
            'roles': [
                {'role_name': 'Frontend Lead', 'open_spots': 1}
            ]
        })
        self.assertEqual(proj_res.status_code, 201)
        proj_id = proj_res.get_json()['project']['id']

        # Test Smart Matching for Leader (peer recommendations)
        match_res = self.client.get('/api/matches', headers=h1)
        self.assertEqual(match_res.status_code, 200)
        matches = match_res.get_json()['matches']
        self.assertTrue(len(matches) > 0)
        self.assertEqual(matches[0]['candidate']['email'], 'candidate@college.edu')
        self.assertTrue(matches[0]['compatibility_score'] > 0)
        self.assertTrue(len(matches[0]['reasons']) > 0)

        # Test Project-specific matching
        proj_match_res = self.client.get(f'/api/projects/{proj_id}/matches', headers=h1)
        self.assertEqual(proj_match_res.status_code, 200)
        cand_matches = proj_match_res.get_json()['matches']
        self.assertTrue(len(cand_matches) > 0)
        self.assertIn('React.js', cand_matches[0]['matched_skills'])

    def test_04_join_request_lifecycle_and_team_update(self):
        # Register Leader
        u1 = self.register_user('lead2@college.edu', 'Leader Two').get_json()
        h1 = {'Authorization': f"Bearer {u1['token']}"}

        # Create project with team size 2
        proj = self.client.post('/api/projects', headers=h1, json={
            'title': 'AI Study Helper',
            'description': 'Automated notes and summarization.',
            'domain': 'Artificial Intelligence & GenAI',
            'team_size': 2,
            'roles': [{'role_name': 'NLP Engineer', 'open_spots': 1}]
        }).get_json()['project']

        # Register Applicant
        u2 = self.register_user('applicant@college.edu', 'Applicant One').get_json()
        h2 = {'Authorization': f"Bearer {u2['token']}"}

        # Applicant sends join request
        req_res = self.client.post('/api/requests', headers=h2, json={
            'project_id': proj['id'],
            'message': 'I have built NLP models with transformers and want to contribute.',
            'role_applied': 'NLP Engineer'
        })
        self.assertEqual(req_res.status_code, 201)
        req_id = req_res.get_json()['request']['id']

        # Check Leader received notification
        notif_res = self.client.get('/api/notifications', headers=h1)
        self.assertEqual(notif_res.status_code, 200)
        notifs = notif_res.get_json()['notifications']
        self.assertTrue(len(notifs) >= 1)
        self.assertEqual(notifs[0]['type'], 'request_received')

        # Leader accepts request
        accept_res = self.client.put(f'/api/requests/{req_id}/accept', headers=h1)
        self.assertEqual(accept_res.status_code, 200)

        # Verify applicant is now in team members
        team_id = proj['team']['id']
        team_res = self.client.get(f'/api/teams/{team_id}', headers=h2)
        self.assertEqual(team_res.status_code, 200)
        members = team_res.get_json()['team']['members']
        self.assertEqual(len(members), 2)
        member_emails = [m['user']['email'] for m in members]
        self.assertIn('applicant@college.edu', member_emails)

        # Applicant checks notification
        applicant_notifs = self.client.get('/api/notifications', headers=h2).get_json()['notifications']
        self.assertEqual(applicant_notifs[0]['type'], 'request_accepted')

        # Attempting to apply again or add beyond team size returns error
        u3 = self.register_user('third@college.edu', 'Third Student').get_json()
        h3 = {'Authorization': f"Bearer {u3['token']}"}
        over_res = self.client.post('/api/requests', headers=h3, json={
            'project_id': proj['id'],
            'message': 'Can I join too?'
        })
        self.assertEqual(over_res.status_code, 400)
        self.assertIn('maximum size', over_res.get_json()['error'])

    def test_05_study_group_module(self):
        u1 = self.register_user('group_lead@college.edu', 'Group Lead').get_json()
        h1 = {'Authorization': f"Bearer {u1['token']}"}

        # Create Study Group
        sg_res = self.client.post('/api/study-groups', headers=h1, json={
            'name': 'Algorithms & LeetCode Sprint',
            'subject': 'CS201 Data Structures',
            'description': 'Weekly problem solving and algorithm analysis.',
            'max_members': 4,
            'meeting_schedule': 'Tuesdays at 6 PM'
        })
        self.assertEqual(sg_res.status_code, 201)
        sg_id = sg_res.get_json()['study_group']['id']

        # Register second user and join study group
        u2 = self.register_user('peer@college.edu', 'Peer Student').get_json()
        h2 = {'Authorization': f"Bearer {u2['token']}"}

        join_res = self.client.post(f'/api/study-groups/{sg_id}/join', headers=h2)
        self.assertEqual(join_res.status_code, 200)
        self.assertEqual(join_res.get_json()['study_group']['current_members_count'], 2)

if __name__ == '__main__':
    unittest.main()
