import { Footer } from "./_components/Footer";
import { Hero } from "./_components/Hero";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex justify-center items-center flex-col py-8 bg-sinister-radial-gradient">
      <main className="w-full max-w-lg">
        <h1 className="mb-4 text-center text-xl text-sinister-red font-bold mx-8">
          <Hero text="404" />
        </h1>

        <div className="flex flex-col gap-2 rounded-2xl bg-neutral-800/50 p-8 mx-8 items-center">
          <p>Page not found</p>
        </div>
      </main>

      <Footer className="mt-4" />
    </div>
  );
}
