"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

type Props = ComponentProps<typeof NextLink>;

export const Link = (props: Props) => {
  const { prefetch, onMouseEnter, ...rest } = props;

  const [_prefetch, setPrefetch] = useState(
    prefetch === undefined ? false : prefetch,
  );

  const _onMouseEnter =
    prefetch === undefined && onMouseEnter === undefined
      ? () => setPrefetch(true)
      : onMouseEnter;

  return (
    <NextLink prefetch={_prefetch} onMouseEnter={_onMouseEnter} {...rest} />
  );
};
