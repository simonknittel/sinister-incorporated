import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import CreateManufacturerForm from "./_components/CreateManufacturerForm";
import ManufacturerSection from "./_components/ManufacturerSection";

export const metadata: Metadata = {
  title: "Schiffe | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (["admin"].includes(session!.user.role) === false) redirect("/dashboard");

  const data = await prisma.manufacturer.findMany({
    include: {
      series: {
        include: {
          variants: true,
        },
      },
    },
  });

  return (
    <main>
      <h1 className="text-xl font-bold">Schiffe</h1>

      <section className="p-8 bg-neutral-900 rounded max-w-4xl mt-8">
        <CreateManufacturerForm />
      </section>

      {data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((data) => (
          <ManufacturerSection key={data.id} data={data} />
        ))}
    </main>
  );
}
