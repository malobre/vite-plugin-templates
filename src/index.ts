import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";

import MagicString from "magic-string";
import * as parse5 from "parse5";
import { type Plugin, type ResolvedConfig } from "vite";

const traverseNodes = async (
  node: parse5.DefaultTreeAdapterMap["node"],
  visitor: (node: parse5.DefaultTreeAdapterMap["node"]) => void | Promise<void>,
) => {
  await visitor(node);

  if ("childNodes" in node) {
    for (const child of node.childNodes) {
      await traverseNodes(child, visitor);
    }
  }
};

const visitHtml = async (
  html: string,
  { cwd, root }: { cwd: string; root: string },
) => {
  const buffer = new MagicString(html);

  const document = parse5.parse(html, { sourceCodeLocationInfo: true });

  await traverseNodes(document, async (node) => {
    if (node.nodeName === "template") {
      const src = node.attrs.find((attr) => attr.name === "src");

      if (src) {
        // biome-ignore lint/style/noNonNullAssertion: Locations are enabled in parser settings
        const location = node.sourceCodeLocation!;

        let path = src.value;

        if (isAbsolute(path)) {
          path = join(root, path);
        } else {
          path = join(cwd, path);
        }

        buffer.update(
          location.startOffset,
          location.endOffset,
          await visitHtml(await readFile(path, { encoding: "utf8" }), {
            cwd: dirname(path),
            root,
          }),
        );
      }
    }
  });

  return buffer.toString();
};

export default (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: "@malobre/vite-plugin-templates",
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml: {
      order: "pre",
      handler: async (html, ctx) =>
        visitHtml(html, { cwd: dirname(ctx.filename), root: config.root }),
    },
  };
};
