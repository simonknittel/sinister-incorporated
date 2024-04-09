#!/bin/sh

# Make the script fail on error (this is somewhat similar to chaining each commands using `&&` but for the whole file instead.)
set -e

# Make sure the node user can write to the node_modules folder which is mounted as named volume (see docker-compose.yml)
sudo chown node:node node_modules

npm ci

# After a `git clone` the `.env` won't exist. When you start the container from an existing local project, the `.env` may already exist.
if [ -e .env ]; then
	npx prisma migrate dev
else
	echo "Skipping database migration due to missing .env file"
fi
