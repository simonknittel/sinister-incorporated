import { Link } from "@/modules/common/components/Link";
import { getWikiPageLinkTarget } from "@/modules/wiki/queries/getWikiSettings";
import { WikiPageLinkKey } from "@sam-monorepo/domain";
import { FaQuestionCircle } from "react-icons/fa";

export const Support = async () => {
  const target = await getWikiPageLinkTarget(WikiPageLinkKey.Support);
  if (!target) return null;

  return (
    <Link
      href={target.href}
      prefetch={false}
      className="flex h-full items-center px-4 text-neutral-500 hover:bg-tertiary hover:text-white focus-visible:bg-tertiary focus-visible:text-white"
      title="Support"
    >
      <FaQuestionCircle />
    </Link>
  );
};
