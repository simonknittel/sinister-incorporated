"use client";

import { UnreadDot } from "@/modules/common/components/UnreadDot";
import { useOnSiteNotifications } from "@/modules/notifications/components/OnSiteNotificationsProvider";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AiFillAppstore } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";

interface MobileActionBarFlyoutContext {
  /**
   * The flyout stays mounted while it is translated off-screen. Thus content
   * which must react to the close of the flyout (for example a popover which
   * closes with it) reads this.
   */
  readonly isVisible: boolean;
  /**
   * True when the flyout is visible and its slide-in transition has ended.
   * Base UI calculates the position of a popup from its trigger, and the
   * trigger moves during the transition. Thus a popover which opens without
   * a press on its trigger waits for this.
   */
  readonly isSlideInComplete: boolean;
  readonly show: () => void;
}

const MobileActionBarFlyoutContext = createContext<
  MobileActionBarFlyoutContext | undefined
>(undefined);

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useMobileActionBarFlyout() {
  const context = useContext(MobileActionBarFlyoutContext);
  if (!context)
    throw new Error("[MobileActionBarFlyoutContext] Provider is missing!");
  return context;
}

export function useMobileActionBarFlyoutVisibility() {
  return useMobileActionBarFlyout().isVisible;
}

interface Props {
  readonly children?: ReactNode;
}

export const MobileActionBarFlyout = ({ children }: Props) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isSlideInComplete, setIsSlideInComplete] = useState(false);
  const { unreadCount } = useOnSiteNotifications();
  const flyoutId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setIsVisible(false);
  }

  if (!isVisible && isSlideInComplete) setIsSlideInComplete(false);

  /**
   * The same method as Base UI. `getAnimations()` applies the new classes
   * first, thus it gives the transition that they start. When the viewer
   * prefers reduced motion, the duration is 0 s: there is no transition and
   * no `transitionend` event, and the list is empty. A close during the
   * slide-in cancels the wait.
   */
  useEffect(() => {
    const flyout = flyoutRef.current;
    if (!isVisible || !flyout) return;

    let isCancelled = false;

    void Promise.allSettled(
      flyout.getAnimations().map((animation) => animation.finished),
    ).then(() => {
      if (!isCancelled) setIsSlideInComplete(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [isVisible]);

  /**
   * A popover inside the flyout renders in a portal. Its Escape key also
   * arrives here through the React tree, but it must close only the popover.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !isVisible) return;
    if (!event.currentTarget.contains(event.target as Node)) return;

    setIsVisible(false);
    toggleRef.current?.focus();
  };

  const contextValue = {
    isVisible,
    isSlideInComplete,
    show: () => setIsVisible(true),
  };

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => setIsVisible((value) => !value)}
        onKeyDown={handleKeyDown}
        type="button"
        aria-expanded={isVisible}
        aria-controls={flyoutId}
        className="flex h-full flex-col items-center justify-center rounded-secondary px-4 active:bg-neutral-700"
      >
        <span className="relative">
          {isVisible ? <FaTimes /> : <AiFillAppstore />}
          {unreadCount > 0 && (
            <UnreadDot className="absolute -top-1 -right-2" />
          )}
        </span>
        <span className="text-xs">Apps</span>
      </button>

      <div
        ref={flyoutRef}
        id={flyoutId}
        // The closed flyout only moves off-screen. Thus it must also leave
        // the focus order and the accessibility tree.
        inert={!isVisible}
        onKeyDown={handleKeyDown}
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex w-96 max-w-[90dvw] flex-col overflow-auto bg-neutral-800 shadow-sm transition-transform",
          {
            "-translate-x-full": isVisible === false,
            "translate-x-0": isVisible === true,
          },
        )}
      >
        <MobileActionBarFlyoutContext value={contextValue}>
          {children}
        </MobileActionBarFlyoutContext>
      </div>

      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
};
