import { Suspense } from "react";
import { Footer } from "../Footer";
import { DesktopSidebar } from "./DesktopSidebar";

export const DesktopSidebarContainer = () => {
  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[26rem] flex-col">
      <Suspense
        fallback={
          <div className="flex max-h-full h-96 ml-8 my-8 flex-col justify-between bg-neutral-800/50 rounded-2xl">
            <div />

            <Footer className="px-8 pb-4 pt-0" />
          </div>
        }
      >
        <DesktopSidebar />
      </Suspense>
    </div>
  );
};
