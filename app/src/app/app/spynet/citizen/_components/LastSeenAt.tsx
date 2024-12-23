import { getLastSeenAt } from "@/common/utils/getLastSeenAt";
import { type Entity } from "@prisma/client";

interface Props {
  entity: Entity;
}

export const LastSeenAt = async ({ entity }: Readonly<Props>) => {
  const lastSeenAt = await getLastSeenAt(entity);

  return (
    <>
      {lastSeenAt?.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Europe/Berlin",
      }) || "-"}
    </>
  );
};
