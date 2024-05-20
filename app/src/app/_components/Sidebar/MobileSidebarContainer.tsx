import { Suspense } from "react";
import { MobileActionBar } from "./MobileActionBar";

export const MobileSidebarContainer = () => {
  return (
    <div className="lg:hidden">
      <Suspense
        fallback={
          <div className="absolute left-0 right-0 bottom-0 h-16 shadow bg-neutral-800" />
        }
      >
        <MobileActionBar />
      </Suspense>
    </div>
  );
};
