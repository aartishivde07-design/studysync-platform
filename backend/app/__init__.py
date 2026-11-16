import os
from flask import Flask, jsonify, send_from_directory
from app.extensions import db, jwt, cors
from config import Config
from app.routes import register_routes

def create_app(config_class=Config):
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    assets_folder = os.path.join(frontend_dist, 'assets')
    
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app, 
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Register API blueprints
    register_routes(app)

    # Serve built frontend and SPA fallback
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        if os.path.exists(assets_folder):
            return send_from_directory(assets_folder, filename)
        return jsonify({'error': 'Asset not found'}), 404

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path.startswith('api'):
            return jsonify({'error': 'API endpoint not found'}), 404
        target_path = os.path.join(frontend_dist, path)
        if path and os.path.exists(target_path):
            return send_from_directory(frontend_dist, path)
        index_file = os.path.join(frontend_dist, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(frontend_dist, 'index.html')
        return jsonify({'status': 'online', 'message': 'StudySync API is active. Build frontend with: npm run build in frontend directory.'}), 200

    # JWT Error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please log in again to continue'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            'error': 'Invalid authentication token',
            'message': error_string
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({
            'error': 'Authorization header required',
            'message': error_string
        }), 401

    # General error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'An internal server error occurred'}), 500

    # Auto-initialize database tables and basic skill/interest catalog
    with app.app_context():
        # Ensure instance directory exists
        os.makedirs(app.instance_path, exist_ok=True)
        db.create_all()
        init_catalog_tags()

    return app


def init_catalog_tags():
    """Initializes common technology skills and academic interests catalog if empty."""
    from app.models.skill import Skill, Interest

    # Populate default technical skills catalog if empty
    if Skill.query.count() == 0:
        default_skills = [
            # Frontend
            ('React.js', 'Frontend'),
            ('Vue.js', 'Frontend'),
            ('Next.js', 'Frontend'),
            ('Tailwind CSS', 'Frontend'),
            ('TypeScript', 'Frontend'),
            ('JavaScript', 'Frontend'),
            ('HTML5 & CSS3', 'Frontend'),
            # Backend
            ('Python', 'Backend'),
            ('Flask', 'Backend'),
            ('Django', 'Backend'),
            ('Node.js', 'Backend'),
            ('Express.js', 'Backend'),
            ('FastAPI', 'Backend'),
            ('Java', 'Backend'),
            ('Spring Boot', 'Backend'),
            ('C++', 'Backend'),
            ('Go', 'Backend'),
            # Database
            ('PostgreSQL', 'Database'),
            ('MongoDB', 'Database'),
            ('MySQL', 'Database'),
            ('SQLite', 'Database'),
            ('Redis', 'Database'),
            # AI / ML
            ('Machine Learning', 'AI/ML'),
            ('Deep Learning', 'AI/ML'),
            ('PyTorch', 'AI/ML'),
            ('TensorFlow', 'AI/ML'),
            ('NLP', 'AI/ML'),
            ('Computer Vision', 'AI/ML'),
            ('Scikit-Learn', 'AI/ML'),
            # Mobile & Systems
            ('Flutter', 'Mobile'),
            ('React Native', 'Mobile'),
            ('Android (Kotlin)', 'Mobile'),
            ('iOS (Swift)', 'Mobile'),
            ('Docker', 'DevOps'),
            ('Git & GitHub', 'DevOps'),
            ('Linux', 'DevOps'),
            ('UI/UX Design (Figma)', 'Design')
        ]
        for name, category in default_skills:
            db.session.add(Skill(name=name, category=category))

    # Populate default interests catalog if empty
    if Interest.query.count() == 0:
        default_interests = [
            ('Artificial Intelligence & GenAI', 'AI'),
            ('Full-Stack Web Development', 'Web'),
            ('Mobile App Innovation', 'Mobile'),
            ('Data Science & Analytics', 'Data'),
            ('Cloud Computing & DevOps', 'Infrastructure'),
            ('Cybersecurity & Ethical Hacking', 'Security'),
            ('Blockchain & Web3', 'Emerging Tech'),
            ('Competitive Programming', 'Algorithms'),
            ('IoT & Robotics', 'Hardware'),
            ('Open Source Contribution', 'Community'),
            ('Human-Computer Interaction (UI/UX)', 'Design'),
            ('Game Development', 'Creative')
        ]
        for name, category in default_interests:
            db.session.add(Interest(name=name, category=category))

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Notice: Catalog initialization skipped: {e}")
