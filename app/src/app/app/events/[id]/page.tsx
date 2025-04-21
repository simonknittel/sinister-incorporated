import { authenticatePage } from "@/auth/server";
import { OverviewTab } from "@/events/components/OverviewTab";
import { Template } from "@/events/components/Template";
import { getEventById } from "@/events/queries";
import { log } from "@/logging";
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
    const event = await getEventById((await props.params).id);
    if (!event) notFound();

    return {
      title: `${event.name} - Event | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/events/[id]/fleet/page.tsx",
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
  const authentication = await authenticatePage("/app/events/[id]");
  await authentication.authorizePage("event", "read");

  const eventId = (await params).id;
  const event = await getEventById(eventId);
  if (!event) notFound();

  return (
    <Template event={event}>
      <OverviewTab event={event} />
    </Template>
  );
}
