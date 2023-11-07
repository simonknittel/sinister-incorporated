import clsx from "clsx";
import styles from "./Hero.module.css";

interface Props {
  text: string;
}

export const Hero = ({ text }: Readonly<Props>) => {
  return (
    <h1
      className={clsx(
        "inline-block uppercase font-extrabold bg-clip-text text-transparent bg-sinister-text-gradient text-5xl lg:text-6xl relative z-10 whitespace-nowrap",
        styles.layers,
        styles.glitch,
      )}
      data-text={text}
    >
      <span>{text}</span>
    </h1>
  );
};
