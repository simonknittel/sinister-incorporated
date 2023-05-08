import { ImageResponse } from "next/server";

export const alt = "Sinister Corporated - Hoist the Black";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "edge";

export default async function og() {
  const fontData = await fetch(
    new URL("../assets/Inter/static/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: "rgb(23, 23, 23)",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: "column",
          textTransform: "uppercase",
          fontWeight: "700",
          padding: 96,
        }}
      >
        <p
          style={{
            fontSize: 128,
            color: "#BB2222",
            width: "100%",
            margin: 0,
          }}
        >
          Sinister Inc
        </p>

        <p
          style={{
            fontSize: 64,
            width: "100%",
            color: "#FFFFFF",
            margin: 0,
          }}
        >
          Hoist the Black
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
