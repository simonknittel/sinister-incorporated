import { SkeletonTile } from "@/common/components/SkeletonTile";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BsExclamationOctagonFill } from "react-icons/bs";

interface Props {
  readonly className?: string;
  readonly children?: ReactNode;
}

export const SuspenseWithErrorBoundaryTile = ({
  className,
  children,
}: Props) => {
  return (
    <ErrorBoundary fallback={<Fallback className={className} />}>
      <Suspense fallback={<SkeletonTile className={className} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

interface FallbackProps {
  readonly className?: string;
}

const Fallback = ({ className }: FallbackProps) => {
  const t = useTranslations();

  return (
    <section
      className={clsx(
        "rounded-2xl bg-neutral-800/50 border border-red-500",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/5 p-4 lg:px-8">
        <BsExclamationOctagonFill className="text-red-800 text-2xl" />
        <h2 className="font-thin text-2xl text-red-500">Fehler</h2>
      </div>

      <div className="p-4 lg:p-8">{t("Common.internalServerError")}</div>
    </section>
  );
};
