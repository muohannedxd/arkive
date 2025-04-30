# Arkive DMS

A document management system.

## How to run?

1. Clone this repository:
```
git clone https://github.com/RaidOuahioune/Intern-Dz.git
```

2. Build:
```
docker compose build
```

3. Run:
```
docker compose up
```

4. Migrate Databases:
```
docker exec -it users-service flask db init
docker exec -it users-service flask db migrate -m "Initial migration"
docker exec -it users-service flask db upgrade
```