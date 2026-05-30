import type { Options } from "html2canvas";

const INLINE_STYLE_PAIRS: Array<[prop: string, key: keyof CSSStyleDeclaration]> = [
  ["color", "color"],
  ["background-color", "backgroundColor"],
  ["border", "border"],
  ["border-radius", "borderRadius"],
  ["border-color", "borderColor"],
  ["box-shadow", "boxShadow"],
  ["opacity", "opacity"],
  ["font-size", "fontSize"],
  ["font-weight", "fontWeight"],
  ["font-family", "fontFamily"],
  ["padding", "padding"],
  ["margin", "margin"],
  ["display", "display"],
  ["flex-direction", "flexDirection"],
  ["gap", "gap"],
  ["align-items", "alignItems"],
  ["justify-content", "justifyContent"],
  ["width", "width"],
  ["height", "height"],
  ["min-width", "minWidth"],
  ["min-height", "minHeight"],
  ["text-align", "textAlign"],
  ["line-height", "lineHeight"],
];

function copyComputedStyles(source: HTMLElement, target: HTMLElement): void {
  const computed = getComputedStyle(source);
  for (const [prop, key] of INLINE_STYLE_PAIRS) {
    const value = computed[key];
    if (typeof value === "string" && value.length > 0) {
      target.style.setProperty(prop, value);
    }
  }
}

function inlineStylesRecursive(source: HTMLElement, clone: HTMLElement): void {
  copyComputedStyles(source, clone);
  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);
  const count = Math.min(sourceChildren.length, cloneChildren.length);
  for (let i = 0; i < count; i++) {
    const sourceChild = sourceChildren[i];
    const cloneChild = cloneChildren[i];
    if (sourceChild instanceof HTMLElement && cloneChild instanceof HTMLElement) {
      inlineStylesRecursive(sourceChild, cloneChild);
    }
  }
}

function stripStylesheets(clonedDoc: Document): void {
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());
}

/** Clone-safe capture — avoids html2canvas failures on oklch/oklab in global CSS. */
export async function captureElementToCanvas(
  element: HTMLElement,
  extra?: Partial<Options>
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  const scrollHeight = element.scrollHeight || element.offsetHeight || 400;
  const scale =
    scrollHeight * 2 > 14000 ? Math.max(1, Math.floor(14000 / scrollHeight)) : 2;

  return html2canvas(element, {
    backgroundColor: "#ffffff",
    scale,
    useCORS: true,
    logging: false,
    ignoreElements: (node) =>
      node instanceof HTMLElement &&
      (node.classList.contains("modebar") ||
        node.classList.contains("modebar-container") ||
        node.getAttribute("data-html2canvas-ignore") === "true"),
    onclone: (clonedDoc, clonedElement) => {
      stripStylesheets(clonedDoc);
      if (clonedElement instanceof HTMLElement) {
        inlineStylesRecursive(element, clonedElement);
      }
    },
    ...extra,
  });
}
