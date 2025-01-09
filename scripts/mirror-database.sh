#!/bin/sh

# Usage: `./scripts/mirror-database.sh postgresql://<user>:<pass>@<host>:5432/<database>`
# # See `docs/mirror-database.md` for more information

# Exit immediately if a command exits with a non-zero status.
set -e

CONNECTION_STRING=$1

docker exec --interactive sinister-incorporated-psql-1 /bin/bash <<EOF
	pg_dump --dbname=$CONNECTION_STRING --no-owner --no-privileges --no-acl --no-tablespaces --format=custom --file dump && \
		pg_restore --dbname=postgresql://postgres:admin@localhost:5432/db --no-owner --clean --if-exists dump
EOF
