from app.routes.auth_routes import auth_bp
from app.routes.profile_routes import profile_bp
from app.routes.skill_routes import skill_bp
from app.routes.project_routes import project_bp
from app.routes.matching_routes import matching_bp
from app.routes.request_routes import request_bp
from app.routes.team_routes import team_bp
from app.routes.study_group_routes import study_group_bp
from app.routes.notification_routes import notification_bp
from app.routes.dashboard_routes import dashboard_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(skill_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(matching_bp)
    app.register_blueprint(request_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(study_group_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(dashboard_bp)
