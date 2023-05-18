import { type Metadata } from "next";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";
import CreateEntity from "../_components/CreateEntity";
import Search from "./_components/Search";

export const metadata: Metadata = {
  title: "Suche - Spynet | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage("view-spynet");

  return (
    <main className="h-full flex justify-center items-center bg-sinister-radial-gradient">
      <div className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <h1 className="text-center text-5xl lg:text-6xl text-sinister-red font-extrabold uppercase bg-clip-text text-transparent bg-sinister-text-gradient">
          Spynet
        </h1>

        <Search />

        <CreateEntity />
      </div>
    </main>
  );
}
