// Converts plain digits/symbols/letters to real Unicode subscript/
// superscript characters (e.g. "2" -> "₂"), for chemical formulas and
// oxidation states in submission titles (Bi2O3 -> Bi₂O₃, Fe3+ -> Fe³⁺,
// AlxGa1-xO -> AlₓGa₁₋ₓO). These are ordinary text characters, not markup,
// so they render correctly wherever a title is shown — admin views, CSV
// export, email subjects, the program PDF — with no HTML
// parsing/sanitizing needed anywhere.
//
// Unicode only defines subscript forms for digits, a handful of symbols
// (+ - = ( )), and a small set of lowercase letters used in phonetics
// (a e h k l m n o p s t x) — not the full alphabet, and no uppercase at
// all. Letters outside that set (e.g. "y", a common alloy-composition
// variable alongside "x") pass through unchanged; there is no Unicode
// subscript form for them to convert to.
const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  s: "ₛ",
  t: "ₜ",
  x: "ₓ",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
};

function reversed(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([plain, script]) => [script, plain]));
}

const NORMAL_MAP: Record<string, string> = { ...reversed(SUBSCRIPT_MAP), ...reversed(SUPERSCRIPT_MAP) };

function convert(text: string, map: Record<string, string>): string {
  return Array.from(text)
    .map((ch) => map[ch] ?? ch)
    .join("");
}

export function toSubscript(text: string): string {
  return convert(text, SUBSCRIPT_MAP);
}

export function toSuperscript(text: string): string {
  return convert(text, SUPERSCRIPT_MAP);
}

/** Converts subscript/superscript characters back to plain digits/symbols. */
export function toNormalScript(text: string): string {
  return convert(text, NORMAL_MAP);
}

/** Letters the Subscript button can actually convert, for UI hint text. */
export const SUBSCRIPT_SUPPORTED_LETTERS = Object.keys(SUBSCRIPT_MAP)
  .filter((ch) => /[a-z]/.test(ch))
  .join(" ");
