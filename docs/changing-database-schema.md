# Changing database schema

1. Update `schema.prisma`
2. Start local database: `docker compose up`
3. Update local database: `npx prisma db push`
4. Commit and push everything to develop
5. Update development branch on PlanetScale: `DATABASE_URL= npx prisma db push`
6. Run production deployment
7. Merge Deploy request on PlanetScale for main branch
