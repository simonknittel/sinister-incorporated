import clsx from "clsx";
import { unstable_noStore } from "next/cache";
import { merriweather } from "../../../fonts";

const quotes = [
  ["Pretend inferiority and encourage his arrogance.", "Sun Tzu"],
  ["Appear weak when you are strong, and strong when you are weak.", "Sun Tzu"],
  [
    "The supreme art of war is to subdue the enemy without fighting.",
    "Sun Tzu",
  ],
  [
    "Let your plans be dark and impenetrable as night, and when you move, fall like a thunderbolt.",
    "Sun Tzu",
  ],
  ["In the midst of chaos, there is also opportunity.", "Sun Tzu"],
  ["To know your Enemy, you must become your Enemy.", "Sun Tzu"],
  [
    "Treat your men as you would your own beloved sons. And they will follow you into the deepest valley.",
    "Sun Tzu",
  ],
  ["There is nothing permanent except change.", "Heraclitus"],
  [
    "Do not mind anything that anyone tells you about anyone else. Judge everyone and everything for yourself.",
    "Henry James",
  ],
  [
    "Good judgment comes from experience, and a lot of that comes from bad judgment.",
    "Will Rogers",
  ],
  [
    "Coming together is a beginning; keeping together is progress; working together is success.",
    "Henry Ford",
  ],
] as const;

type Props = Readonly<{
  className?: string;
}>;

export const QuotesTile = ({ className }: Props) => {
  unstable_noStore();

  const quote = quotes[Math.floor(Math.random() * quotes.length)]!;

  return (
    <div className="flex justify-center">
      <blockquote className={clsx(className, "p-8 flex flex-col")}>
        <p
          className={clsx(
            merriweather.className,
            "text-xl lg:text-2xl font-serif relative before:absolute before:right-[calc(100%+8px)] before:content-['“'] before:font-bold before:text-neutral-50/50 max-w-[640px]",
          )}
        >
          {quote[0]}
        </p>

        <footer className="text-neutral-50/50 mt-2">
          <cite>— {quote[1]}</cite>
        </footer>
      </blockquote>
    </div>
  );
};
