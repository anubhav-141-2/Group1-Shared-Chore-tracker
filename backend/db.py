import os
from dotenv import load_dotenv
import mysql.connector

for env_path in [
    os.path.join(os.path.dirname(__file__), '.env'),
    os.path.join(os.path.dirname(__file__), 'db', '.env'),
]:
    if os.path.exists(env_path):
        load_dotenv(env_path)


def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'fair_split'),
        port=int(os.getenv('DB_PORT', '3306')),
        autocommit=False,
        use_pure=True,
    )
