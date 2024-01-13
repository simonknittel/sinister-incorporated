import { type Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { validateConfirmedEmailForPage } from "~/_lib/emailConfirmation";
import AdminDisabler from "../(app)/_components/AdminDisabler";
import { authenticatePage } from "../../_lib/auth/authenticateAndAuthorize";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Freigabe | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();

  await validateConfirmedEmailForPage(authentication.session);

  if (
    authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ]) === true &&
    authentication.authorize([
      {
        resource: "login",
        operation: "negate",
      },
    ]) === false
  )
    redirect("/dashboard");

  return (
    <div className="min-h-screen flex justify-center items-center flex-col py-8">
      <main className="w-full max-w-lg">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold">
          <FaRegCheckCircle className="text-green-500 inline relative top-[-2px]" />{" "}
          Anmeldung erfolgreich
        </h1>

        <div className="flex flex-col gap-2 rounded bg-neutral-900 p-8 mx-8">
          <p>Die Leitung muss deinen Account freischalten.</p>
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
