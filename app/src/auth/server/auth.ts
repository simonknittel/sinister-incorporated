import type { PermissionSet } from "@/auth/common";
import { getPermissionSetsByRoles } from "@/auth/server";
import { requestEmailConfirmation } from "@/common/utils/emailConfirmation";
import { prisma } from "@/db";
import { env } from "@/env";
import { log } from "@/logging";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User,
} from "next-auth";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { type UserRole } from "../../types";

const guildMemberResponseSchema = z.union([
  z.object({
    avatar: z.string().nullable(),
  }),

  z.object({
    message: z.string(),
  }),
]);

async function getGuildMember(access_token: string) {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${access_token}`);

  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
    {
      headers,
      next: {
        revalidate: 0,
      },
    },
  );

  const body: unknown = await response.json();
  const data = guildMemberResponseSchema.parse(body);

  return data;
}

function getAvatar(
  profile: DiscordProfile,
  guildMember: z.infer<typeof guildMemberResponseSchema>,
) {
  if ("avatar" in guildMember && guildMember.avatar) {
    const format = guildMember.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${profile.id}/${guildMember.avatar}.${format}`;
  } else if (profile.avatar) {
    const format = profile.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
  }

  const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      emailVerified: Date | null;
    } & DefaultSession["user"];
    discordId: string;
    givenPermissionSets: PermissionSet[];
    entityId: string | null;
  }

  interface User {
    role?: UserRole;
    lastSeenAt?: Date;
  }
}

const adapter = PrismaAdapter(prisma);

const maxAge = 60 * 60 * 24 * 31; // 31 days

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      const discordAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
        },
      });

      const entity = await prisma.entity.findUnique({
        where: {
          discordId: discordAccount!.providerAccountId,
        },
      });

      let givenPermissionSets: PermissionSet[] = [];

      if (entity) {
        const assignedRoles = entity.roles?.split(",") ?? [];

        const roles = await prisma.role.findMany({
          where: {
            id: {
              in: assignedRoles,
            },
          },
          include: {
            permissionStrings: true,
          },
        });

        givenPermissionSets = getPermissionSetsByRoles(roles);
      }

      // Only update lastSeenAt once a day
      if (
        !user.lastSeenAt ||
        user.lastSeenAt.toDateString() !== new Date().toDateString()
      ) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastSeenAt: new Date(),
          },
        });
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        discordId: discordAccount!.providerAccountId,
        givenPermissionSets,
        entityId: entity?.id,
      };
    },

    async signIn({ user, account, profile }) {
      if (!profile) throw new Error("Missing profile");

      /**
       * Update account and user on login
       *
       * This callback doesn't tell us if the user already exists in the
       * database. Also, this callback gets called before a new user gets
       * created in the database. Therefore, we have to figure out ourselves
       * if we can update an existing user or not.
       */

      void log.info("Login attempt", {
        accountProvider: account?.provider,
        accountProviderAccountId: account?.providerAccountId,
        profileEmail: profile.email,
      });

      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (existingUser) {
        const guildMember = await getGuildMember(account.access_token);

        if ("message" in guildMember) {
          void log.info("User not member of the Discord guild", {
            userId: user.id,
          });
          throw new Error(guildMember.message);
        }

        const avatar = getAvatar(profile, guildMember);

        await prisma.$transaction([
          prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account!.provider,
                providerAccountId: account!.providerAccountId,
              },
            },
            data: {
              refresh_token: account!.refresh_token,
              access_token: account!.access_token,
              expires_at: account!.expires_at,
              scope: account!.scope,
              updatedAt: new Date(),
            },
          }),

          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              email: profile.email!.toLocaleLowerCase(),
              image: avatar,
              updatedAt: new Date(),
            },
          }),
        ]);
      } else {
        // New user
        const guildMember = await getGuildMember(account.access_token);

        if ("message" in guildMember) {
          void log.info("User not member of the Discord guild", {
            userId: user.id,
          });
          throw new Error(guildMember.message);
        }

        user.email = profile.email!.toLocaleLowerCase();

        const avatar = getAvatar(profile, guildMember);
        user.image = avatar;

        user.name = null;

        const latestConfirmedDiscordIdEntityLog =
          await prisma.entityLog.findFirst({
            where: {
              type: "discord-id",
              content: profile.id,
              attributes: {
                some: {
                  key: "confirmed",
                  value: "confirmed",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

        if (latestConfirmedDiscordIdEntityLog) {
          const latestConfirmedHandleEntityLog =
            await prisma.entityLog.findFirst({
              where: {
                entityId: latestConfirmedDiscordIdEntityLog.entityId,
                type: "handle",
                attributes: {
                  some: {
                    key: "confirmed",
                    value: "confirmed",
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            });

          user.name =
            latestConfirmedHandleEntityLog?.content ||
            latestConfirmedDiscordIdEntityLog.entityId;
        }
      }

      return true;
    },
  },

  adapter: {
    ...adapter,
    createUser: async (user: User) => {
      const createdUser = await adapter.createUser!(user);

      try {
        await requestEmailConfirmation(createdUser.id, user.email);
      } catch (error) {
        void log.error(
          "Failed to request email confirmation for created user",
          {
            userId: createdUser.id,
            error: serializeError(error),
          },
        );
      }

      return createdUser;
    },
  },

  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds.members.read",
    }),
  ],

  pages: {
    error: "/",
    newUser: "/email-confirmation?new-user=true",
  },

  session: {
    maxAge,
    updateAge: maxAge * 2, // Make sure `updateAge` is bigger than `maxAge` so that the session actually expires at some point and then a refreshed authentication with the identity provider is forced
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
