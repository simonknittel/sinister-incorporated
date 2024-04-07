# Setup Local Machine

## Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://www.docker.com/)

## Setup

1. Configure environment variables: Duplicate `app/.env.example` to `app/.env` and fill in the blanks.
2. Install required Node.js version: `nvm use`
3. Install dependencies: `cd app && npm ci`
4. Start up the database: `cd .. && docker compose up`
5. Update the database's schema: `cd app && npx prisma migrate dev`
6. Run the app: `npm run dev`
7. Access the app at: <http://localhost:3000>

### (Experimental) Dev Container

1. Install the _Dev Containers_ extension for VSCode
2. `Dev Containers: Reopen In Container` and wait for it to finish
3. Go to your VSCode extensions and enable the recommended ones
4. (Optional) Install your personal VSCode extensions in Dev Container
   - You'll need to do this after every rebuild of the container
5. Update the database's schema: `npx prisma migrate dev`
6. Run the app
   - Terminal: `npm run dev`
   - VSCode debugger: `F5`
7. Access the app at: <http://localhost:3000>

## Bot Invite Link with required scopes

- <https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=0&scope=bot>
