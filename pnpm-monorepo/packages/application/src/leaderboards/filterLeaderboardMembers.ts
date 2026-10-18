import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

/**
 * A rank of a leaderboard of the game. The host reads the ranks from the
 * website of the game and validates them, thus this interface is not a
 * schema.
 */
export interface LeaderboardRank {
  /** The handle of the player */
  readonly nickname: string;
  readonly rank: number;
}

/**
 * Keeps the ranks of the members of the organization, the best rank first.
 * The members are the citizens with a login. A rank belongs to a member when
 * its nickname is the handle of the citizen. Requires `leaderboards;read`.
 */
export const filterLeaderboardMembers = <Rank extends LeaderboardRank>(
  context: ApplicationContext,
  actor: Actor,
  ranks: readonly Rank[],
): Promise<Rank[]> =>
  withSpan(context, "filterLeaderboardMembers", async () => {
    requirePermission(actor, "leaderboards", "read");

    const members = await context.prisma.citizen.findMany({
      where: { userId: { not: null } },
      select: { handle: true },
    });
    const memberHandles = new Set(members.map((member) => member.handle));

    return ranks
      .filter((rank) => memberHandles.has(rank.nickname))
      .toSorted((first, second) => first.rank - second.rank);
  });
