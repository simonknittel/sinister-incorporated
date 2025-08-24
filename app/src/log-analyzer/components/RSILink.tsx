import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Link } from "@/common/components/Link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { isNpc } from "../utils/isNpc";

interface Props {
  readonly handle: string;
}

export const RSILink = ({ handle }: Props) => {
  const authentication = useAuthentication();

  const isMe =
    authentication && authentication.session.entity?.handle === handle;

  if (isMe)
    return (
      <span className="text-me flex items-center h-full px-2 py-1">
        <span className="truncate" title={handle}>
          {handle}
        </span>
      </span>
    );

  if (isNpc(handle))
    return (
      <span className="text-neutral-500 flex items-center h-full px-2 py-1">
        <span className="truncate" title={handle}>
          {handle}
        </span>
      </span>
    );

  return (
    <Link
      href={`https://robertsspaceindustries.com/citizens/${handle}`}
      className="hover:background-secondary focus-visible:background-secondary rounded-secondary flex items-center gap-2 h-full px-2 py-1 text-rsi-blue-200"
      rel="noreferrer"
      target="_blank"
      title={handle}
    >
      <span className="truncate">{handle}</span>
      <FaExternalLinkAlt className="text-xs opacity-50 flex-none" />
    </Link>
  );
};
