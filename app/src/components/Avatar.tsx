import clsx from "clsx";
import Image from "next/image";

// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript/21682946#21682946
export function stringToColor(str: string) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return `hsl(${hash % 360}, 100%, 25%)`;
}

interface Props {
  className?: string;
  name?: string | null;
  image?: string | null;
  size?: number;
}

const Avatar = ({ className, name, image, size }: Props) => {
  return (
    <span
      className={clsx(
        className,
        "flex items-center justify-center overflow-hidden rounded uppercase",
        {
          "text-sm": size === 32,
          "text-2xl": !size || size === 64,
        }
      )}
      style={{
        backgroundColor: image
          ? undefined
          : name
          ? stringToColor(name)
          : "#dedfe0",
        width: size || 64,
        height: size || 64,
      }}
    >
      {image ? (
        <Image
          src={image}
          alt={name ? `Image of ${name}` : ""}
          width={size || 64}
          height={size || 64}
        />
      ) : name ? (
        name.replace(/\s/g, "").substring(0, 2)
      ) : null}
    </span>
  );
};

export default Avatar;
