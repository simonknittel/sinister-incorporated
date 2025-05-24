import clsx from "clsx";
import type { Ref } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface Props {
  readonly className?: string;
  readonly children: string;
  readonly ref?: Ref<HTMLDivElement>;
}

export const Markdown = ({ className, children, ref }: Props) => {
  return (
    <div
      ref={ref}
      className={clsx("prose prose-invert max-w-none", className)}
      style={{
        overflowWrap: "anywhere",
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
