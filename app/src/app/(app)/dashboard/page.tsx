import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default function Page() {
  return (
    <main>
      <h1 className="text-xl font-bold">Dashboard</h1>
    </main>
  );
}
