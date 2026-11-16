# StudySync – AI-Powered Student Team Matching Platform

StudySync is a full-stack student collaboration platform designed specifically for college students and first-year undergrads who struggle to find compatible project teammates and study groups.

Through a deterministic, explainable multi-factor skill matching recommendation engine, StudySync pairs students based on complementary capabilities, project requirements, shared academic interests, and weekly commitment availability.

---

## 🌟 Key Features

1. **Deterministic Smart Skill Matching System**:
   - Multi-factor weighted recommendation algorithm written in pure Python.
   - 40% Required/Complementary Skill Coverage.
   - 20% Academic Interests & Domain Synergy.
   - 20% Schedule & Availability Compatibility.
   - 10% Learning Goals Overlap.
   - 10% Skill Proficiency Suitability (Beginner, Intermediate, Advanced).
   - Generates transparent, human-readable explanations for every match recommendation.
2. **Project Idea Hub**:
   - Discover semester projects, filter by domain, technology, and required skills.
   - Create projects with custom team sizes, roles, deadlines, and skill levels.
   - Manage, edit, and delete user's own projects.
3. **Interactive Join Request System**:
   - Send joining requests with customized application notes and role selection.
   - Team leaders can view applicants' complete profiles, accept, or decline applications.
   - Enforces capacity constraints (prevents duplicate applications, self-joining, and over-capacity teams).
4. **Team Management Hub**:
   - Dedicated team workspaces showing project title, team leader, member rosters, assigned roles, and member skillsets.
   - Protected management view for authorized project creators.
5. **Study Groups Module**:
   - Create and discover course-specific study circles (e.g. Data Structures, Web Engineering, Machine Learning).
   - Track meeting schedules, learning methodologies, and group capacities.
   - One-click join/leave functionality.
6. **Live Dynamic Dashboard**:
   - Personalized greeting, dynamic profile completion progress tracker with actionable recommendations.
   - Real-time database metrics (Available Projects, Pending Requests, Joined Teams).
   - Top recommended peers and projects matching the logged-in student.
7. **Database-Backed In-App Notifications**:
   - Real-time notification logs for received requests, accepted applications, and status updates.
   - Unread badges and instant mark-as-read toggles.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React Icons |
| **Backend** | Python 3.12, Flask, Flask-SQLAlchemy, Flask-CORS, Flask-JWT-Extended, Werkzeug |
| **Database** | SQLite, SQLAlchemy ORM (15 relational tables with strict foreign keys & constraints) |
| **Design** | Lavender/Purple palette (`#7c3aed`), soft off-white surface (`#fcfbfd`), rounded cards |

---

## 📁 Project Structure

```
my first project/
├── backend/
│   ├── app/
│   │   ├── models/            # 15 relational SQLAlchemy models
│   │   │   ├── user.py        # User & StudentProfile
│   │   │   ├── skill.py       # Skill, UserSkill, Interest, UserInterest
│   │   │   ├── project.py     # Project, ProjectRequiredSkill, ProjectRole
│   │   │   ├── request.py     # JoinRequest
│   │   │   ├── team.py        # Team, TeamMember
│   │   │   ├── study_group.py # StudyGroup, StudyGroupMember
│   │   │   ├── notification.py# Notification
│   │   │   └── __init__.py
│   │   ├── routes/            # Modular REST API Blueprints
│   │   │   ├── auth_routes.py
│   │   │   ├── profile_routes.py
│   │   │   ├── skill_routes.py
│   │   │   ├── project_routes.py
│   │   │   ├── matching_routes.py
│   │   │   ├── request_routes.py
│   │   │   ├── team_routes.py
│   │   │   ├── study_group_routes.py
│   │   │   ├── notification_routes.py
│   │   │   ├── dashboard_routes.py
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   └── matching_service.py # Pure Python Weighted Recommendation Algorithm
│   │   ├── utils/
│   │   │   ├── validators.py
│   │   │   └── notifications.py
│   │   ├── extensions.py      # db, jwt, cors
│   │   └── __init__.py        # Application factory & catalog seeder
│   ├── instance/
│   │   └── studysync.db       # SQLite Database
│   ├── config.py              # Configuration & algorithm weights
│   ├── run.py                 # Backend entrypoint (Port 5000)
│   ├── seed.py                # Demonstration seed script
│   ├── test_api.py            # Automated unittest suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Badge, Modal, EmptyState, LoadingSpinner
│   │   │   ├── matching/      # MatchCard, AlgorithmExplainModal
│   │   │   ├── projects/      # ProjectCard, CreateProjectModal, ApplyModal
│   │   │   └── study_groups/  # StudyGroupCard, CreateStudyGroupModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx # Collapsible sidebar, notification popover
│   │   ├── pages/             # All application views
│   │   ├── services/
│   │   │   └── api.js         # Axios interceptor with JWT handling
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── run_all.bat                # Windows 1-click dual launcher
└── README.md
```

---

## 🚀 Step-by-Step Setup & Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.12)
- Node.js 18+ (Tested on Node.js v20.18.0) & npm

---

### 1. Backend Setup & Startup

1. Open PowerShell or Command Prompt and navigate to the backend directory:
   ```powershell
   cd "backend"
   ```

2. (Optional) Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Populate sample demo college accounts and active projects:
   ```powershell
   python seed.py
   ```
   *(To wipe and re-seed at any point, run `python seed.py --reset`)*

5. Run the automated integration test suite:
   ```powershell
   python test_api.py
   ```

6. Start the Flask server:
   ```powershell
   python run.py
   ```
   *The backend will start on `http://127.0.0.1:5000` with active CORS.*

---

### 2. Frontend Setup & Startup

1. Open a second PowerShell or Command Prompt window and navigate to the frontend directory:
   ```powershell
   cd "frontend"
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## 🔑 Demo Account Credentials

You can immediately log in with any of the seeded student profiles (Password for all: `Password123!`):

| Student Name | Email | Department & Year | Profile Focus |
|---|---|---|---|
| **Priya Sharma** | `priya.sharma@college.edu` | CSE (1st Year) | Python, Flask, Leader of CampusMart project |
| **Alex Chen** | `alex.chen@college.edu` | IT (2nd Year) | React.js, Tailwind CSS, TypeScript, UI/UX |
| **Rohan Verma** | `rohan.verma@college.edu` | CSE (2nd Year) | Python, Flask, PostgreSQL, Docker Backend |
| **Ananya Iyer** | `ananya.iyer@college.edu` | AI/DS (1st Year) | PyTorch, ML, Leader of AI NoteCraft project |
| **Marcus Lee** | `marcus.lee@college.edu` | Software Eng (1st Year) | Flutter, Mobile, Figma Design |

*Or click **Register** on the login page to register a brand new student account!*

---

## 🧠 How the Smart Skill Matching Algorithm Works

The recommendation engine in `backend/app/services/matching_service.py` computes compatibility deterministically:

$$\text{Total Score} = (0.40 \times \text{SkillScore}) + (0.20 \times \text{InterestScore}) + (0.20 \times \text{AvailabilityScore}) + (0.10 \times \text{GoalScore}) + (0.10 \times \text{ProficiencyScore})$$

1. **Skill Coverage & Complement (40%)**:
   - Detects shared baseline skills + complementary skillsets (e.g. Pairing a Frontend React developer with a Backend Python developer).
2. **Academic Interests Alignment (20%)**:
   - Calculates Jaccard similarity across student interests and project domain tags.
3. **Availability Compatibility (20%)**:
   - Compares weekly commitment hour expectations (e.g. 10-15 hrs/week vs 15+ hrs/week).
4. **Learning Goals Synergy (10%)**:
   - Extracts semantic keywords to identify overlapping project aspirations.
5. **Proficiency Suitability (10%)**:
   - Weights Beginner (1.0), Intermediate (2.0), and Advanced (3.0) capabilities.

---

## 🛡️ Common Errors & Solutions

1. **Port 5000 already in use**:
   - Specify an alternative port: `PORT=5001 python run.py`.
2. **CORS issues**:
   - Flask backend has `Flask-CORS` enabled for all origins (`*`) with full support for credentials and JWT headers.
3. **Reset Database**:
   - Run `python seed.py --reset` or delete `backend/instance/studysync.db` and restart Flask.
