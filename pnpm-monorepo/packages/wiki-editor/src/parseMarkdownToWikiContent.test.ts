import type { JSONContent } from "@tiptap/core";
import { describe, expect, test } from "vitest";
import { parseMarkdownToWikiContent } from "./parseMarkdownToWikiContent.js";
import { renderWikiContentToMarkdown } from "./renderWikiContentToMarkdown.js";

const BASE_URL = "https://sam.example.com";

const parse = (markdown: string) =>
  parseMarkdownToWikiContent(markdown, { baseUrl: BASE_URL });

interface SimpleNode {
  readonly type: string | undefined;
  readonly text?: string;
  readonly marks?: (string | undefined)[];
  readonly href?: unknown;
  readonly src?: unknown;
  readonly content?: SimpleNode[];
}

/** The types, the texts, the marks and the URLs of the content, without the other attributes */
const simplify = (node: JSONContent): SimpleNode => ({
  type: node.type,
  ...(node.text === undefined ? {} : { text: node.text }),
  ...(node.marks ? { marks: node.marks.map((mark) => mark.type) } : {}),
  ...(node.marks?.some((mark) => mark.type === "link")
    ? { href: node.marks.find((mark) => mark.type === "link")?.attrs?.href }
    : {}),
  ...(node.type === "image" ? { src: node.attrs?.src } : {}),
  ...(node.content ? { content: node.content.map(simplify) } : {}),
});

const blocksOf = (markdown: string) =>
  (parse(markdown).content ?? []).map(simplify);

const paragraph = (...content: SimpleNode[]): SimpleNode => ({
  type: "paragraph",
  content,
});

const text = (value: string): SimpleNode => ({ type: "text", text: value });

describe("parseMarkdownToWikiContent", () => {
  test("keeps the structure of the supported Markdown: the renderer gives the same Markdown back", () => {
    const markdown = [
      "## Ablauf & Ziele",
      "Ein **fetter**, _kursiver_, ~~durchgestrichener~~ Text mit `Code` und [Link](https://example.com/regeln).",
      "- Eins\n  - Zwei\n- Drei",
      "3. Drei\n4. Vier",
      "- [x] Erledigt\n- [ ] Offen",
      "| Schiff | Rolle |\n| --- | --- |\n| Polaris | Korvette |",
      "```yaml\nkey: value\n```",
      "> Ein Zitat",
      "![Karte](https://example.com/karte.png)",
      "---",
    ].join("\n\n");

    expect(
      renderWikiContentToMarkdown(parse(markdown), { baseUrl: BASE_URL }),
    ).toBe(`${markdown}\n`);
  });

  test("the layout of the blocks applies only at the top, like in the editor", () => {
    const [list] = parse("- Eins").content ?? [];

    expect(list?.attrs).toMatchObject({ widthPx: 720 });
    expect(list?.content?.[0]?.content?.[0]?.attrs).toMatchObject({
      widthPx: null,
      align: null,
    });
  });

  test("content that the wiki cannot hold in that place becomes plain paragraphs", () => {
    expect(
      blocksOf(
        [
          "Text ![Bild](https://example.com/bild.png) mehr",
          "- # Titel im Punkt\n- Punkt mit ![Logo](https://example.com/logo.png)",
          "> # Titel im Zitat\n> - Punkt im Zitat",
          "<div>HTML</div>",
        ].join("\n\n"),
      ),
    ).toEqual([
      // An image in a paragraph goes between the parts of the paragraph
      paragraph(text("Text ")),
      { type: "image", src: "https://example.com/bild.png" },
      paragraph(text(" mehr")),
      {
        type: "bulletList",
        content: [
          { type: "listItem", content: [paragraph(text("Titel im Punkt"))] },
          {
            type: "listItem",
            content: [
              paragraph(text("Punkt mit ")),
              // A list item cannot show an image: a link to it
              paragraph({
                type: "text",
                text: "Logo",
                marks: ["link"],
                href: "https://example.com/logo.png",
              }),
            ],
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          paragraph(text("Titel im Zitat")),
          paragraph(text("Punkt im Zitat")),
        ],
      },
      paragraph(text("<div>HTML</div>")),
    ]);
  });

  test("keeps only safe URLs and makes relative URLs absolute", () => {
    expect(
      blocksOf(
        [
          "[Seite](/app/wiki/seite) [böse](javascript:alert(1)) [Mail](mailto:info@example.com)",
          "![Daten](data:image/png;base64,AAAA)",
          "![Upload](/uploads/bild.png)",
        ].join("\n\n"),
      ),
    ).toEqual([
      paragraph(
        {
          type: "text",
          text: "Seite",
          marks: ["link"],
          href: "https://sam.example.com/app/wiki/seite",
        },
        text(" böse "),
        {
          type: "text",
          text: "Mail",
          marks: ["link"],
          href: "mailto:info@example.com",
        },
      ),
      paragraph(text("Daten")),
      { type: "image", src: "https://sam.example.com/uploads/bild.png" },
    ]);
  });

  test("an empty text gives a valid document with an empty paragraph", () => {
    expect(blocksOf("\n\n")).toEqual([{ type: "paragraph" }]);
  });
});
