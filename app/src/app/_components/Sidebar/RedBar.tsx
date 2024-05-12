"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const RedBar = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const [style, setStyle] = useState({});

  useEffect(() => {
    const container = document.querySelector("[data-red-bar-container]");
    if (!container) return;

    const links = container.querySelectorAll(`a`);
    const link = findMatchingLink(links, pathname);
    if (!link) return;

    const containerRect = container.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    setStyle({
      transform: `translateY(${linkRect.top - containerRect.top}px)`,
    });

    setIsInitialized(true);

    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, [pathname]);

  return (
    <div
      className={clsx(
        "w-[2px] h-[2em] bg-sinister-red-500 absolute left-4 before:rounded pointer-events-none top-3",
        {
          "opacity-100": isVisible,
          "opacity-0": !isVisible,
          "transition-all": isInitialized,
        },
      )}
      style={style}
    />
  );
};

const findMatchingLink = (
  links: NodeListOf<HTMLAnchorElement>,
  pathname: string,
) => {
  let bestMatch: HTMLAnchorElement | null = null;
  let bestMatchHref = "";

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!link) continue;

    const href = link.getAttribute("href");
    if (!href) continue;

    if (pathname.startsWith(href) && href.length > bestMatchHref.length) {
      bestMatch = link;
      bestMatchHref = href;
    }
  }

  return bestMatch;
};
