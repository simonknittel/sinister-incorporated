# Mirror database

> How to copy the production database to your local machine

1. `docker compose up`
2. `./scripts/mirror-database.sh "postgresql://<user>:<pass>@<host>:5432/<database>"`
