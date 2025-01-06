"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextLink>;

export const Link = (props: Props) => {
  const { prefetch, href, onMouseEnter, ...rest } = props;
  const router = useRouter();

  const _prefetch = prefetch === undefined ? false : prefetch;
  const _onMouseEnter =
    prefetch === undefined && onMouseEnter === undefined
      ? () => router.prefetch(typeof href === "string" ? href : href.href)
      : onMouseEnter;

  return (
    <NextLink
      href={href}
      prefetch={_prefetch}
      onMouseEnter={_onMouseEnter}
      {...rest}
    />
  );
};
