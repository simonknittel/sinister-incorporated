# Sinister Incorporated

Tools of the Star Citizen organization _Sinister Incorporated_.

## Features

- CRM-like citizen and organization management
- Dynamic RBAC + ABAC
- Fleet and ship management
- Operation management
- Discord Event integration
  - Shows the available fleet based on the participants' ships
- Discord Login

## Technologies

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [PlanetScale](https://planetscale.com/)
- [Vercel](https://vercel.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [React Table](https://github.com/TanStack/table)
- [react-hot-toast](https://github.com/timolins/react-hot-toast)
- [React Icons](https://github.com/react-icons/react-icons)
- [Zod](https://github.com/colinhacks/zod)

## Usage

### Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://www.docker.com/)

### Setup

1. Configure environment variables: Duplicate `app/.env.example` to `app/.env` and fill in the blanks.
2. Install required Node.js version: `nvm use`
3. Install dependencies: `cd app && npm ci`
4. Start up the database: `cd .. && docker compose up`
5. Update the database's schema: `cd app && npx prisma db push`
6. Run the app: `npm run dev`
7. Access the app at: <http://localhost:3000>

### Playwright tests

1. Start up the database: `docker compose up`
2. Install dependencies: `cd playwright && npm ci`
3. Run the tests: `npx playwright test --debug`

### Bot Invite Link with required scopes

- <https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=0&scope=bot>

## License

See [LICENSE](./LICENSE)
