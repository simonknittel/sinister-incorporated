import { Suspense } from "react";
import { Footer } from "../Footer";
import { DesktopSidebar } from "./DesktopSidebar";

export const DesktopSidebarContainer = () => {
  return (
    <div className="hidden lg:flex fixed left-8 top-8 bottom-8 w-96 flex-col">
      <Suspense
        fallback={
          <div className="flex h-full flex-col justify-between bg-neutral-800/50 rounded-2xl">
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
