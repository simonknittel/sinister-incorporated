import { formatDate } from "@/common/utils/formatDate";
import { getLastSeenAt } from "@/common/utils/getLastSeenAt";
import { type Entity } from "@prisma/client";

interface Props {
  entity: Entity;
}

export const LastSeenAt = async ({ entity }: Readonly<Props>) => {
  const lastSeenAt = await getLastSeenAt(entity);

  return <>{formatDate(lastSeenAt, "short") || "-"}</>;
};
