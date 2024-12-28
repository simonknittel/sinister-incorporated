# Mirror database

> How to copy the production database to your local machine

1. Stop the local database: `docker compose down`
2. Destroy the local database: `docker compose rm`
3. Create a new local database: `docker compose up`
4. Connect to the local database container: `docker exec -it sinister-incorporated-psql-1 /bin/bash`
5. Dump the production database to a local file: `pg_dump --dbname=postgresql://<user>:<pass>@<host>:5432/<database> --no-owner --no-privileges --no-acl --no-tablespaces --format=custom --file dump`
6. Restore the dump to the local database: `pg_restore --dbname=postgresql://postgres:admin@localhost:5432/db --no-owner --clean --if-exists dump`
