import os
import sys
from subprocess import run

def migrate_and_run():
    try:
        # Step 1: Run flask db migrate
        print("Generating migration script...")
        result = run(['flask', 'db', 'migrate'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error generating migration: {result.stderr}")
            sys.exit(1)
        print(result.stdout)

        # Step 2: Run flask db upgrade
        print("Applying migrations to the database...")
        result = run(['flask', 'db', 'upgrade'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error applying migrations: {result.stderr}")
            sys.exit(1)
        print(result.stdout)

        # Step 3: Run the Flask app
        print("Starting the Flask application...")
        run(['python', 'app.py'])
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    migrate_and_run()
