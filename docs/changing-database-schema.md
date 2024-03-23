# Changing database schema

1. Update `schema.prisma` as required
2. Run `npx prisma db push`
3. Create migration `npx prisma migrate dev --name my-migration`
4. Commit
5. Apply to other developer databases: `npx prisma migrate dev`
6. Apply to production databases: `DATABASE_URL=... npx prisma migrate deploy`
