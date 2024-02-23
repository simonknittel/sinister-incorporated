import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const aiRouter = createTRPCRouter({
  getRoleNameSuggestions: protectedProcedure.query(() => {
    return new Promise<Array<string>>((resolve) => {
      setTimeout(() => {
        resolve(["Foo", "Bar", "Baz"]);
      }, 1000);
    });
  }),
});
