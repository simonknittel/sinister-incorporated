# Mirror database

> How to copy the production database to your local machine

1. `./scripts/mirror-database-production-to-local.sh "postgresql://<user>:<pass>@<host>:5432/<database>"`

> How to copy the production database to the stage database

1. `./scripts/mirror-database-production-to-stage.sh "postgresql://<user>:<pass>@<host>:5432/production" "postgresql://<user>:<pass>@<host>:5432/stage"`
2. `cd app && nvm install && DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/stage" npx prisma db push`
