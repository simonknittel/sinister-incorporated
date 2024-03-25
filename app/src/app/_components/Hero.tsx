import clsx from "clsx";
import styles from "./Hero.module.css";

type Props = Readonly<{
  className?: string;
  text: string;
  size?: "md" | "lg";
}>

export const Hero = ({className, text, size = "lg" }: Props) => {
  return (
    <h1
      className={clsx(
        className,
        "inline-block uppercase font-extrabold bg-clip-text text-transparent bg-sinister-text-gradient relative z-[1] whitespace-nowrap",
        {
          "text-5xl lg:text-6xl": size === "lg",
          [styles.layers!]: size === "lg",
          [styles.glitch!]: size === "lg",
          "text-3xl lg:text-4xl": size === "md",
        },
      )}
      data-text={text}
    >
      <span>{text}</span>
    </h1>
  );
};
