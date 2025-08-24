import clsx from "clsx";
import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type SearchParams,
} from "nuqs/server";
import { getTasks } from "../queries";
import { Task } from "./Task";

const loadSearchParams = createLoader({
  status: parseAsString.withDefault("open"),
  accepted: parseAsStringLiteral(["all", "yes"]).withDefault("all"),
  created_by: parseAsStringLiteral(["others", "me"]).withDefault("others"),
});

interface Props {
  readonly className?: string;
  readonly searchParams: Promise<SearchParams>;
}

export const TasksTile = async ({ className, searchParams }: Props) => {
  const { status, accepted, created_by } = await loadSearchParams(searchParams);

  let tasks = await getTasks({
    filters: {
      status,
      accepted,
      created_by,
    },
  });

  if (tasks.length <= 0)
    return (
      <section className={clsx(className)}>
        <div className="rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center gap-4">
          <p>Keine Tasks gefunden</p>
        </div>
      </section>
    );

  if (status === "closed") {
    tasks = tasks.toSorted((a, b) => {
      const aDate = a.completedAt
        ? a.completedAt
        : a.cancelledAt
          ? a.cancelledAt
          : a.deletedAt
            ? a.deletedAt
            : a.expiresAt
              ? a.expiresAt
              : a.createdAt;
      const bDate = b.completedAt
        ? b.completedAt
        : b.cancelledAt
          ? b.cancelledAt
          : b.deletedAt
            ? b.deletedAt
            : b.expiresAt
              ? b.expiresAt
              : b.createdAt;

      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;

      return 0;
    });
  }

  return (
    <section className={clsx("flex flex-col gap-[1px]", className)}>
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </section>
  );
};
