import { type Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { authenticate } from "../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForPage } from "../../lib/emailConfirmation";
import { log } from "../../lib/logging";
import { AdminEnabler } from "../_components/AdminEnabler";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Freigabe | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticate();

  if (!authentication) {
    log.info("Unauthenticated request to page", {
      requestPath: "/clearance",
      reason: "No session",
    });

    redirect("/");
  }

  await requireConfirmedEmailForPage(authentication.session);

  if (authentication.authorize("login", "manage")) redirect("/app");

  return (
    <div className="min-h-dvh flex justify-center items-center flex-col py-8 bg-sinister-radial-gradient">
      <main className="w-full max-w-lg">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold mx-8">
          <FaRegCheckCircle className="text-green-500 inline relative top-[-2px]" />{" "}
          Anmeldung erfolgreich
        </h1>

        <div className="flex flex-col gap-2 rounded-2xl bg-neutral-800/50  p-8 mx-8">
          <p>Die Leitung muss deinen Account freischalten.</p>
        </div>
      </main>

      <Footer className="mt-4" />

      {authentication.session.user.role === "admin" && (
        <AdminEnabler
          enabled={cookies().get("enableAdmin")?.value === "enableAdmin"}
        />
      )}
    </div>
  );
}
