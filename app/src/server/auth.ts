import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { z } from "zod";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { type UserRole } from "~/types";

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
    }
  );

  const body: unknown = await response.json();
  const data = await guildMemberResponseSchema.parseAsync(body);

  return data;
}

function getAvatar(
  profile,
  guildMember: z.infer<typeof guildMemberResponseSchema>
) {
  if (guildMember.avatar) {
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
    } & DefaultSession["user"];
    discordId: string;
    permissions: string[];
  }

  interface User {
    role: UserRole;
  }
}

const maxAge = 60 * 60 * 24 * 7; // 7 days

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

      const discordIdLog = await prisma.entityLog.findFirst({
        where: {
          type: "discord-id",
          content: discordAccount!.providerAccountId,
          attributes: {
            some: {
              key: "confirmed",
              value: "true",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let permissions = [] as string[];

      if (discordIdLog) {
        const roleLogs = await prisma.entityLog.findMany({
          where: {
            entityId: discordIdLog.entityId,
            type: {
              in: ["role-added", "role-removed"],
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        const assignedRoles = new Set<string>();

        for (const roleLog of roleLogs) {
          if (!roleLog.content) continue;

          if (roleLog.type === "role-added") {
            assignedRoles.add(roleLog.content);
          } else if (roleLog.type === "role-removed") {
            assignedRoles.delete(roleLog.content);
          }
        }

        const rolesWithPermissions = await prisma.role.findMany({
          where: {
            id: {
              in: Array.from(assignedRoles),
            },
          },
          include: {
            permissions: {
              where: {
                value: true,
              },
            },
          },
        });

        permissions = rolesWithPermissions.flatMap((role) =>
          role.permissions.map((permission) => permission.key)
        );
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
        discordId: discordAccount!.providerAccountId,
        permissions,
      };
    },

    async signIn({ user, account, profile }) {
      /**
       * Update account and user on login
       *
       * This callback doesn't tell us if the user already exists in the
       * database. Also, this callback gets called before a new user gets
       * created in the database. Therefore, we have to figure out ourselves
       * if we can update an existing user or not.
       */

      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (existingUser) {
        const guildMember = await getGuildMember(account.access_token);

        if ("message" in guildMember) {
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
              content: profile!.id,
              attributes: {
                some: {
                  key: "confirmed",
                  value: "true",
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
                    value: "true",
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

  adapter: PrismaAdapter(prisma),

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
    newUser: "/onboarding",
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
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
