# Mirror database

> How to copy the production database to your local machine

1. Create a dump from the production database
	1. `docker run -it --rm postgres:15.2 bash`
	2. `pg_dump --dbname=postgresql://<user>:<pass>@<host>:5432/<database> --no-owner --no-privileges --no-acl --no-tablespaces --format=custom --file dump`
	3. `docker cp <container ID>:/dump .`
2. Stop the local database: `docker compose down`
3. Destroy the local database: `docker compose rm`
4. Create a new local database: `docker compose up`
5. Restore the dump to the local database: `pg_restore --dbname=postgresql://postgres:admin@localhost:5432/db --no-owner --clean --if-exists dump`
6. Delete the dump: `rm dump`
