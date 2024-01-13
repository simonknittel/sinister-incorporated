import { type Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RiInformationLine } from "react-icons/ri";
import { serializeError } from "serialize-error";
import {
  requestEmailConfirmation,
  requiresEmailConfirmation,
} from "~/_lib/emailConfirmation";
import { log } from "~/_lib/logging";
import AdminDisabler from "../(app)/_components/AdminDisabler";
import {
  authenticateApi,
  authenticatePage,
} from "../../_lib/auth/authenticateAndAuthorize";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "E-Mail-Adresse bestätigen | Sinister Incorporated",
};

const handleClick = async () => {
  "use server";

  const authentication = await authenticateApi();

  try {
    await requestEmailConfirmation(
      authentication.session.user.id,
      authentication.session.user.email!,
    );
  } catch (error) {
    log.error("Error while requesting email confirmation", {
      path: "/email-confirmation",
      error: serializeError(error),
    });
  }
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const authentication = await authenticatePage();
  if ((await requiresEmailConfirmation(authentication.session)) === false)
    redirect("/clearance");
  if (authentication.session.user.emailVerified) redirect("/clearance");

  const newUser =
    (Array.isArray(searchParams["new-user"])
      ? searchParams["new-user"][0]
      : searchParams["new-user"]) === "true";

  return (
    <div className="min-h-screen flex justify-center items-center flex-col py-8">
      <main className="w-full max-w-3xl">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold">
          <RiInformationLine className="text-sky-500 text-2xl inline align-text-bottom" />{" "}
          E-Mail-Adresse und Datenschutzerklärung bestätigen
        </h1>

        <div className="flex flex-col gap-2 rounded bg-neutral-900 p-8 mx-8">
          <p>
            Um fortfahren zu können musst du deine E-Mail-Adresse und die{" "}
            <Link href="/privacy" className="underline">
              Datenschutzerklärung
            </Link>{" "}
            bestätigen.
          </p>

          {/* {newUser ? (
            <p>
              Zur Bestätigung haben wir eine E-Mail an{" "}
              <i>{authentication.session.user.email}</i> geschickt.
            </p>
          ) : (
            <form action={handleClick} className="inline">
              <p>
                <RequestConfirmationEmailButton>
                  Klick hier
                </RequestConfirmationEmailButton>{" "}
                um die Bestätigungs-E-Mail an{" "}
                <i>{authentication.session.user.email}</i> zu verschicken.
              </p>
            </form>
          )}

          <form action={handleClick} className="inline">
            <p className="text-neutral-500">
              Falls die E-Mail nicht angekommen ist,{" "}
              <RequestConfirmationEmailButton>
                klick hier
              </RequestConfirmationEmailButton>{" "}
              um es erneut zu versuchen, oder melde dich bei{" "}
              <Link
                href="mailto:info@sinister-incorporated.de"
                className="underline"
              >
                info@sinister-incorporated.de
              </Link>
              .
            </p>
          </form> */}
        </div>
      </main>

      <Footer className="mt-4" />

      {authentication.session.user.role === "admin" && (
        <AdminDisabler
          disabled={cookies().get("disableAdmin")?.value === "disableAdmin"}
        />
      )}
    </div>
  );
}
