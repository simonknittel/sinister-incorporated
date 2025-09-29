import { requireAuthenticationPage } from "@/modules/auth/server";
import { OverviewTab } from "@/modules/events/components/OverviewTab";
import { Template } from "@/modules/events/components/Template";
import { getEventById } from "@/modules/events/queries";
import { log } from "@/modules/logging";
import { type Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
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
    unstable_rethrow(error);
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

export default async function Page({ params }: PageProps<"/app/events/[id]">) {
  const authentication = await requireAuthenticationPage("/app/events/[id]");
  await authentication.authorizePage("event", "read");

  const event = await getEventById((await params).id);
  if (!event) notFound();

  return (
    <Template event={event}>
      <OverviewTab event={event} />
    </Template>
  );
}
