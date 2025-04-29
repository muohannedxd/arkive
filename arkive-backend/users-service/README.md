## Aurora Backend

How to start?

### I. PostreSQL Database
1. install postgreSQL and setup it in your machine (make sure to enable the service).
2. create a database `auroradb` by following these steps:
   - launch `psql` via `sudo -u postgres psql`
   - create the database: `CREATE DATABASE arkivedmsdb;`
   - create an admin user: `CREATE USER admin WITH PASSWORD '<your_pw>';`
   - grant privileges: `GRANT ALL PRIVILEGES ON DATABASE auroradb TO admin;`
   - select the created db: `\c auroradb postgres;` (you receive: 'you are now in auroradb...').
   - grant all on schema: `GRANT ALL ON SCHEMA public TO admin;`

### II. Backend application:
1. git clone the application.
2. install requis: `pip install -r requirements.txt`
3. create a `.env` file like `.env.example`
4. run the migration (only if first time or changes to models):
   - export the app: `export FLASK_APP=app.py`
   - delete the folder `migrations/` -this step not tested, to be checked-
   - `flask db init` (only if changes in the models)
   - `flask db migrate -m "Initial migration"` (only if changes in the models)
   - `flask db upgrade` (only if changes in models)
5. run the application using one of the following:
   - export the app: `export FLASK_APP=app.py` then: `flask run`
   - directly: `python app.py` 

### III. Importing Data (for local database)
1. make  POST request to the appropriate endpoint (app must be running):
   - For sentences:
   `curl -X POST -F "file=@data/app_sentences_data.csv" http://localhost:5000/sentence/import_data`
   - For vocabularies:
   `curl -X POST -F "file=@data/app_vocab_data.csv" http://localhost:5000/vocab/import_data`

### IV. Generating a random Secret Key:
1. launch python within your cli and:
   - `import secrets`
   - `print(secrets.token_hex(32))`
2. copy and paste the key in your `.env`