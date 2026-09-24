import type { Definition, Image, ImageReference, Root as MdastRoot } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Relative image srcs resolve against the post's own directory via the
// bundled-asset map, so each post folder is self-contained. Reference-style
// images (![alt][id]) store the URL on the `definition` node — only rewrite
// definitions that an imageReference actually uses, so link definitions
// like [id]: ./page keep their semantics.
export const remarkResolveImages =
  (resolveImage: (src: string) => string): Plugin<[], MdastRoot> =>
  () =>
  (tree) => {
    const imageRefs = new Set<string>();
    visit(tree, "imageReference", (node: ImageReference) => {
      imageRefs.add(node.identifier);
    });
    visit(tree, "image", (node: Image) => {
      node.url = resolveImage(node.url);
    });
    visit(tree, "definition", (node: Definition) => {
      if (imageRefs.has(node.identifier)) node.url = resolveImage(node.url);
    });
  };
