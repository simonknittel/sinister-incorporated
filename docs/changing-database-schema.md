# Changing database schema

1. Update `schema.prisma` as required
2. Run `pnpm exec prisma db push`
3. Create migration `pnpm exec prisma migrate dev --name my-migration`
4. Commit
5. Apply to other developer databases: `pnpm exec prisma migrate dev`
6. Apply to production databases: `DATABASE_URL="..." pnpm exec prisma migrate deploy`
