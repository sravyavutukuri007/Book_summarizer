import sqlite3
from datetime import datetime
from typing import Optional, List, Dict
import hashlib
import secrets

DATABASE_PATH = "book_summarizer.db"


def get_db_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Summaries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            summary_id TEXT UNIQUE NOT NULL,
            original_text TEXT NOT NULL,
            summary_text TEXT NOT NULL,
            summary_type TEXT NOT NULL,
            summary_length INTEGER NOT NULL,
            word_count INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Sessions table for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()

    # Create default admin user if not exists
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    if not cursor.fetchone():
        admin_password_hash = hash_password("admin123")
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
            ("admin", "admin@booksummarizer.com", admin_password_hash, 1)
        )
        conn.commit()

    conn.close()


def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(username: str, email: str, password: str, is_admin: bool = False) -> Optional[int]:
    """Create a new user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        password_hash = hash_password(password)

        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, is_admin)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        return None


def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """Authenticate a user and return user data."""
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(password)

    cursor.execute(
        "SELECT id, username, email, is_admin FROM users WHERE username = ? AND password_hash = ?",
        (username, password_hash)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "is_admin": bool(user["is_admin"])
        }
    return None


def create_session(user_id: int) -> str:
    """Create a session token for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now().timestamp() + (24 * 60 * 60)  # 24 hours

    cursor.execute(
        "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)",
        (user_id, session_token, expires_at)
    )
    conn.commit()
    conn.close()
    return session_token


def validate_session(session_token: str) -> Optional[Dict]:
    """Validate a session token and return user data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT u.id, u.username, u.email, u.is_admin, s.expires_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ?
        """,
        (session_token,)
    )
    result = cursor.fetchone()
    conn.close()

    if result and result["expires_at"] > datetime.now().timestamp():
        return {
            "id": result["id"],
            "username": result["username"],
            "email": result["email"],
            "is_admin": bool(result["is_admin"])
        }
    return None


def delete_session(session_token: str):
    """Delete a session (logout)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE session_token = ?", (session_token,))
    conn.commit()
    conn.close()


def save_summary(user_id: int, summary_id: str, original_text: str, summary_text: str,
                 summary_type: str, summary_length: int, word_count: int) -> int:
    """Save a summary to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO summaries (user_id, summary_id, original_text, summary_text,
                              summary_type, summary_length, word_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (user_id, summary_id, original_text, summary_text, summary_type, summary_length, word_count)
    )
    conn.commit()
    summary_db_id = cursor.lastrowid
    conn.close()
    return summary_db_id


def get_user_summaries(user_id: int) -> List[Dict]:
    """Get all summaries for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, summary_id, summary_text, summary_type, summary_length,
               word_count, created_at
        FROM summaries
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,)
    )
    summaries = cursor.fetchall()
    conn.close()

    return [dict(summary) for summary in summaries]


def get_summary_by_id(summary_id: str) -> Optional[Dict]:
    """Get a specific summary by its ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT s.*, u.username, u.email
        FROM summaries s
        JOIN users u ON s.user_id = u.id
        WHERE s.summary_id = ?
        """,
        (summary_id,)
    )
    summary = cursor.fetchone()
    conn.close()

    return dict(summary) if summary else None


def get_all_users() -> List[Dict]:
    """Get all users (admin only)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, username, email, is_admin, created_at,
               (SELECT COUNT(*) FROM summaries WHERE user_id = users.id) as summary_count
        FROM users
        WHERE is_admin = 0
        ORDER BY created_at DESC
        """
    )
    users = cursor.fetchall()
    conn.close()

    return [dict(user) for user in users]


def get_all_summaries_admin() -> List[Dict]:
    """Get all summaries with user info (admin only)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT s.*, u.username, u.email
        FROM summaries s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
        """
    )
    summaries = cursor.fetchall()
    conn.close()

    return [dict(summary) for summary in summaries]


def get_user_summaries_admin(user_id: int) -> List[Dict]:
    """Get all summaries for a specific user (admin only)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT s.*, u.username, u.email
        FROM summaries s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
        """,
        (user_id,)
    )
    summaries = cursor.fetchall()
    conn.close()

    return [dict(summary) for summary in summaries]
