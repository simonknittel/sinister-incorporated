import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const manufacturerRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const manufacturer = await ctx.prisma.manufacturer.findUnique({
        where: {
          id: input.id,
        },
      });

      return manufacturer;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const manufacturers = await ctx.prisma.manufacturer.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return manufacturers;
  }),

  getSeriesByManufacturerId: protectedProcedure
    .input(
      z.object({
        manufacturerId: z.string().cuid2(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const series = await ctx.prisma.series.findMany({
        where: {
          manufacturerId: input.manufacturerId,
        },
        orderBy: {
          name: "asc",
        },
      });
      return series;
    }),
});
