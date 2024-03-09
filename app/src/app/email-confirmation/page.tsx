import { type Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RiInformationLine } from "react-icons/ri";
import { requiresEmailConfirmation } from "~/_lib/emailConfirmation";
import { AdminEnabler } from "../(app)/_components/AdminEnabler";
import { authenticatePage } from "../../_lib/auth/authenticateAndAuthorize";
import { Footer } from "../_components/Footer";
import { PageRefresher } from "./_components/PageRefresher";
import {
  RequestConfirmationEmailButton,
  RequestConfirmationEmailLink,
} from "./_components/RequestConfirmationEmail";
import { requestEmailConfirmationAction } from "./_lib/actions";

export const metadata: Metadata = {
  title:
    "E-Mail-Adresse und Datenschutzerklärung bestätigen | Sinister Incorporated",
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
    <div className="min-h-screen flex justify-center items-center flex-col py-8 bg-sinister-radial-gradient">
      <main className="w-full max-w-3xl">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold mx-8">
          <RiInformationLine className="text-sky-500 text-2xl inline align-text-bottom" />{" "}
          E-Mail-Adresse und Datenschutzerklärung bestätigen
        </h1>

        <div className="flex flex-col gap-2 rounded-2xl bg-neutral-900/50 backdrop-blur p-8 mx-8">
          <p>
            Um fortfahren zu können musst du deine E-Mail-Adresse (
            <i>{authentication.session.user.email}</i>) und die{" "}
            <Link href="/privacy" className="underline" prefetch={false}>
              Datenschutzerklärung
            </Link>{" "}
            bestätigen.
          </p>

          <form action={requestEmailConfirmationAction}>
            {newUser ? (
              <p>Zur Bestätigung haben wir dir eine E-Mail geschickt.</p>
            ) : (
              <div className="flex justify-center mt-4 mb-3">
                <RequestConfirmationEmailButton>
                  Bestätigungs-E-Mail verschicken
                </RequestConfirmationEmailButton>
              </div>
            )}

            <p className="text-neutral-500">
              Falls die E-Mail nicht angekommen ist,{" "}
              <RequestConfirmationEmailLink>
                klick hier
              </RequestConfirmationEmailLink>{" "}
              um es erneut zu versuchen, oder melde dich bei{" "}
              <Link
                href="mailto:info@sinister-incorporated.de"
                className="underline"
              >
                info@sinister-incorporated.de
              </Link>
              .
            </p>
          </form>
        </div>
      </main>

      <Footer className="mt-4" />

      <PageRefresher />

      {authentication.session.user.role === "admin" && (
        <AdminEnabler
          enabled={cookies().get("enableAdmin")?.value === "enableAdmin"}
        />
      )}
    </div>
  );
}
