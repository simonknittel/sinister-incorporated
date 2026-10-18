import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "vitest";

/**
 * The MCP server and a later backend use this package without Next.js and
 * without React. Thus the package must not import them, the modules of the
 * app (`@/…`) or `server-only` (a marker of Next.js). The packages
 * `infrastructure` and `mcp` are in the layers above this package: they
 * import it, thus it must not import them.
 */
const FORBIDDEN_IMPORT =
  /^(?:next|next\/.*|react|react\/.*|react-dom|react-dom\/.*|server-only|@\/.*|@sam-monorepo\/infrastructure(?:\/.*)?|@sam-monorepo\/mcp(?:\/.*)?)$/;

/** Static imports, re-exports, side-effect imports and dynamic imports */
const IMPORT_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;

test("the package does not import Next.js, React, the app or the layers above it", async () => {
  const fileNames = (await readdir(import.meta.dirname, { recursive: true }))
    .filter((fileName) => fileName.endsWith(".ts"))
    .sort();

  const imports = await Promise.all(
    fileNames.map(async (fileName) => {
      const source = await readFile(join(import.meta.dirname, fileName), {
        encoding: "utf8",
      });

      return Array.from(source.matchAll(IMPORT_SPECIFIER), (match) => ({
        fileName,
        specifier: match[1] ?? "",
      }));
    }),
  ).then((importsPerFile) => importsPerFile.flat());

  // Makes sure that the pattern still finds the imports of the package
  expect(imports.length).toBeGreaterThan(0);

  expect(
    imports.filter(({ specifier }) => FORBIDDEN_IMPORT.test(specifier)),
  ).toEqual([]);
});
