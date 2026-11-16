from app.extensions import db
from app.models.notification import Notification

def send_notification(user_id: int, notif_type: str, title: str, message: str, link: str = '') -> Notification:
    """Helper to persist in-app notifications for students."""
    try:
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            title=title,
            message=message,
            link=link
        )
        db.session.add(notif)
        db.session.commit()
        return notif
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {e}")
        return None
