import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { Link } from "@/common/components/Link";
import cornerstoneImageBrowserScreenshot from "@/cornerstone-image-browser/assets/screenshot.png";
import { itemTypes } from "@/cornerstone-image-browser/utils/config";
import logAnalyzerScreenshot from "@/log-analyzer/assets/screenshot.png";
import { type Metadata } from "next";
import Image from "next/image";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Tools | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tools");
  const showLogAnalyzer = await authentication.authorize("logAnalyzer", "read");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Tools" withGlitch />
      </div>

      <div className="mt-4 lg:mt-8 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-4">
        <article className="background-secondary rounded-primary overflow-hidden">
          <Image
            src={cornerstoneImageBrowserScreenshot}
            alt="Screenshot vom Cornerstone Image Browser"
            priority
          />

          <div className="p-4 lg:p-8">
            <h2 className="font-bold text-xl">Cornerstone Image Browser</h2>

            <p className="mt-2">
              Stellt die Bilder von Cornerstone nebeneinander dar, um sie
              visuell einfach vergleichen zu können.
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {itemTypes.map((item) => (
                <Link
                  key={item.page}
                  href={`/app/tools/cornerstone-image-browser/${item.page}`}
                  className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300"
                  prefetch={false}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </article>

        {showLogAnalyzer && (
          <article className="background-secondary rounded-primary overflow-hidden">
            <Image
              src={logAnalyzerScreenshot}
              alt="Screenshot vom Log Analyzer"
              priority
            />

            <div className="p-4 lg:p-8">
              <h2 className="font-bold text-xl">Log Analyzer</h2>

              <p className="mt-2">
                Wertet die Game Logs von Star Citizen aus um nach Kills zu
                filtern.
              </p>

              <Link
                href="/app/tools/log-analyzer"
                className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 mt-2 block"
              >
                Zum Log Analyzer
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
