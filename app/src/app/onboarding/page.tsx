import { type Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import AdminDisabler from "../(app)/_components/AdminDisabler";
import { authenticatePage } from "../_lib/auth/authenticateAndAuthorize";

export const metadata: Metadata = {
  title: "Onboarding | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  if (
    authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ])
  )
    redirect("/dashboard");

  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="w-full max-w-md py-8">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold flex items-center gap-2 justify-center">
          <FaRegCheckCircle className="text-green-500" /> Anmeldung erfolgreich
        </h1>

        <div className="flex flex-col gap-2 rounded bg-neutral-900 p-8 mx-8">
          <p>Die Leitung muss deinen Account freischalten.</p>
        </div>
      </main>

      {authentication.session.user.role === "admin" && (
        <AdminDisabler
          disabled={cookies().get("disableAdmin")?.value === "disableAdmin"}
        />
      )}
    </div>
  );
}
