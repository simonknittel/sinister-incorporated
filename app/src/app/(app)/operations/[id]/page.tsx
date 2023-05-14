import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FaChevronLeft } from "react-icons/fa";
import Avatar from "~/app/_components/Avatar";
import { prisma } from "~/server/db";
import ConfirmParticipation from "./_components/ConfirmParticipation";
import CreateUnit from "./_components/CreateUnit";
import DeleteOperation from "./_components/DeleteOperation";
import EditOperation from "./_components/EditOperation";
import JoinOperation from "./_components/JoinOperation";
import RemoveParticipation from "./_components/RemoveParticipation";
import SquadronTile from "./_components/SquadronTile";

const getOperation = cache(async (id: string) => {
  return prisma.operation.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      units: {
        include: {
          members: {
            include: {
              user: true,
              ship: {
                include: {
                  variant: true,
                },
              },
            },
          },
          childUnits: {
            include: {
              members: {
                include: {
                  user: true,
                  ship: {
                    include: {
                      variant: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const operation = await getOperation(params.id);
    if (!operation) return {};

    return {
      title: `${operation.title} - Operation | Sinister Incorporated`,
    };
  } catch (error) {
    console.error(error);

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

interface Props {
  params: Params;
}

export default async function Page({ params }: Props) {
  const operation = await getOperation(params.id);
  if (!operation) notFound();

  const confirmedMembers = operation.members.filter(
    (member) => member.status === "confirmed"
  );
  const unconfirmedMembers = operation.members.filter(
    (member) => member.status === "pending"
  );

  return (
    <main className="p-4 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/operations"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          <FaChevronLeft className="w-[16px] h-[16px]" /> Übersicht
        </Link>

        <span className="text-neutral-500">/</span>

        <div className="flex gap-2">
          <h1>{operation.title}</h1>

          <div className="flex">
            <EditOperation operation={operation} />
            <DeleteOperation operation={operation} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_24rem] gap-8">
        <div>
          {operation.units
            .filter((unit) => unit.type === "squadron")
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((unit) => (
              <SquadronTile key={unit.id} unit={unit} className="mt-4" />
            ))}

          <div className="mt-4">
            <CreateUnit operation={operation} />
          </div>
        </div>

        <div className="border-l-2 border-neutral-700 px-4 lg:px-8">
          <div className="flex gap-4">
            <h2 className="text-lg font-bold">Teilnehmer</h2>
            <JoinOperation operation={operation} />
          </div>

          {operation.members.length > 0 ? (
            <>
              {confirmedMembers.length > 0 && (
                <>
                  <h3 className="font-bold mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 block bg-green-500 rounded-full" />
                    Anwesend
                  </h3>

                  <ul className="mt-2 flex flex-col gap-1">
                    {confirmedMembers
                      .sort((a, b) => a.user.name!.localeCompare(b.user.name!))
                      .map((member) => (
                        <li
                          className="flex gap-2 items-center"
                          key={member.userId}
                        >
                          <Avatar
                            name={member.user.name}
                            image={member.user.image}
                            size={32}
                            className="grow-1 shrink-0"
                          />

                          {member.user.name}

                          <RemoveParticipation operation={operation} />
                        </li>
                      ))}
                  </ul>
                </>
              )}

              {unconfirmedMembers.length > 0 && (
                <>
                  <h3 className="font-bold mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 block bg-red-500 rounded-full" />
                    Unbestätigt
                  </h3>

                  <ul className="mt-2 flex flex-col gap-1">
                    {unconfirmedMembers
                      .sort((a, b) => a.user.name!.localeCompare(b.user.name!))
                      .map((member) => (
                        <li
                          className="flex gap-2 items-center"
                          key={member.userId}
                        >
                          <Avatar
                            name={member.user.name}
                            image={member.user.image}
                            size={32}
                            className="grow-1 shrink-0"
                          />

                          {member.user.name}

                          <ConfirmParticipation operation={operation} />
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <p className="text-neutral-500 italic mt-4">Keine Teilnehmer</p>
          )}
        </div>
      </div>
    </main>
  );
}
