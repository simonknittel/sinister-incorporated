import { authenticatePage } from "@/auth/server";
import { log } from "@/logging";
import { Overview } from "@/tasks/components/Overview";
import { getTaskById } from "@/tasks/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const task = await getTaskById((await props.params).id);
    if (!task) notFound();

    return {
      title: `${task.title} - Task | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/tasks/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

interface Props {
  readonly params: Params;
}

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/tasks/[id]");
  await authentication.authorizePage("task", "read");

  const task = await getTaskById((await params).id);
  if (!task) notFound();

  return (
    <main className="p-4 pb-20 lg:p-8">
      <Overview task={task} />
    </main>
  );
}
