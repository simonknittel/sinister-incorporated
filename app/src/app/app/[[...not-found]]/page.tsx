import { type Metadata } from "next";
import { Footer } from "../../_components/Footer";
import { Hero } from "../../_components/Hero";

/**
 * From Next.js documentation:
 * > In addition to catching expected `notFound()` errors, the root `app/not-found.js` file also handles any unmatched URLs for your whole application
 * That means, that we can't have nested `not-found.tsx` files. Instead we need to use a workaround by leveraging a catch-all router (`[[...not-found]]/page.tsx`)
 */

export const metadata: Metadata = {
  title: "404 - Page not found | Sinister Incorporated",
};

export default function Page() {
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
