# Setup Local Machine

## Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/)
   - `corepack enable`

## Setup

1. Clone the repository
3. Configure environment variables: Duplicate [app/.env.example](../app/.env.example) to [app/.env](../app/.env) and fill in the blanks.
4. Start up the database: `docker compose up`
5. Open a second terminal and change to `pnpm-workspace` directory: `cd pnpm-workspace`
6. Install required Node.js version: `nvm install`
7. Install dependencies: `pnpm install --frozen-lockfile`
8. Update the database's schema: `npx prisma migrate dev`
9. Run the app: `pnpm run dev:app`
10. Access the app at: <http://localhost:3000>

## Bot Invite Link with required scopes

- <https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=0&scope=bot>
