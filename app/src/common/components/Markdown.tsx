import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface Props {
  readonly className?: string;
  readonly children: string;
}

export const Markdown = ({ className, children }: Props) => {
  return (
    <div className={clsx("prose prose-invert break-all max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
