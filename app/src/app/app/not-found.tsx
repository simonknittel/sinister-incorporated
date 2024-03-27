import { type Metadata } from "next";
import { Footer } from "../_components/Footer";
import { Hero } from "../_components/Hero";

export const metadata: Metadata = {
  title: "404 - Page not found | Sinister Incorporated",
};

export default function NotFound() {
  return (
    <div className="min-h-dvh flex justify-center items-center flex-col py-8 bg-sinister-radial-gradient">
      <main className="w-full max-w-lg">
        <div className="text-center mb-4">
          <Hero text="404" className="text-center mx-auto" />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-neutral-800/50 p-8 mx-8 items-center">
          <p>Page not found</p>
        </div>
      </main>

      <Footer className="mt-4" />
    </div>
  );
}
