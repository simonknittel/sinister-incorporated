import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { unstable_cache } from "next/cache";
import { z } from "zod";

const schema = z.object({
  data: z.object({
    resultset: z.array(
      z.object({
        nickname: z.string(),
        displayname: z.string(),

        rank: z.coerce.number(),
        rank_score: z.coerce.number(),
        score: z.coerce.number(),
        score_minute: z.coerce.number(),
        rating: z.coerce.number(),

        kills: z.coerce.number(),
        deaths: z.coerce.number(),
        kill_death_ratio: z.coerce.number(),

        damage_dealt: z.coerce.number(),
        damage_taken: z.coerce.number(),

        matches: z.coerce.number(),
        wins: z.coerce.number(),
        draws: z.coerce.number(),
        losses: z.coerce.number(),

        flight_time: z.string(),
      }),
    ),
  }),
});

export const getLeaderboard = (mode: "SB", season: string) => {
  return unstable_cache(
    async (mode: "SB", season: string) => {
      return getTracer().startActiveSpan("getLeaderboard", async (span) => {
        try {
          const response = await fetch(
            "https://robertsspaceindustries.com/api/leaderboards/getLeaderboard",
            {
              method: "POST",
              body: JSON.stringify({
                mode,
                map: "MAP-ANY",
                type: "Account",
                season,
                page: 1,
                pagesize: "100",
              }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          const json = (await response.json()) as unknown;
          const result = schema.parse(json);
          return result.data.resultset;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          throw error;
        } finally {
          span.end();
        }
      });
    },
    [`mode=${mode}`, `season=${season}`],
    {
      revalidate: 60,
    },
  )(mode, season);
};
