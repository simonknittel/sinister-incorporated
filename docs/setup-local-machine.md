# Setup Local Machine

## Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/)
   1. `corepack enable`
   2. `corepack install`

## Setup

1. Clone the repository
2. Configure environment variables: Duplicate [app/.env.example](../app/.env.example) to [app/.env](../app/.env) and fill in the blanks.
3. Start up the database: `docker compose up`
4. Open a second terminal and change to `app` directory: `cd app`
5. Install required Node.js version: `nvm install`
6. Install dependencies: `pnpm install`
7. Update the database's schema: `pnpm exec prisma migrate dev`
8. Run the app: `pnpm run dev`
9. Access the app at: <http://localhost:3000>

### (Experimental) Dev Container

1. Install the _Dev Containers_ extension for VSCode
2. `Dev Containers: Reopen In Container` and wait for it to finish
3. Go to your VSCode extensions and enable the recommended ones
4. (Optional) Install your personal VSCode extensions in Dev Container
   - You'll need to do this after every rebuild of the container
5. Update the database's schema: `pnpm exec prisma migrate dev`
6. Run the app
   - Terminal: `pnpm run dev`
   - VSCode debugger: `F5`
7. Access the app at: <http://localhost:3000>

## Bot Invite Link with required scopes

- <https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=0&scope=bot>
