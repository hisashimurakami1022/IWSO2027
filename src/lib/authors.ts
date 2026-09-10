// Authors carry `affiliationIndexes` — 1-based positions into the
// submission's ordered `affiliations` list. These helpers render that
// structure for display (superscript byline) and export (plain text).

const SUPERSCRIPT_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

export function toSuperscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPERSCRIPT_DIGITS[Number(d)] ?? d)
    .join("");
}

export type AuthorWithAffiliations = {
  name: string;
  affiliationIndexes: number[];
};

/** "Yamada¹, Suzuki¹²" — each author's name followed by superscript markers. */
export function formatAuthorByline(authors: AuthorWithAffiliations[]): string {
  return authors
    .map((a) => {
      const marks = a.affiliationIndexes.map(toSuperscript).join("˒");
      return marks ? `${a.name}${marks}` : a.name;
    })
    .join(", ");
}

/** "1. Tokyo Tech; 2. Kyushu Univ" */
export function formatAffiliationList(affiliations: string[], sep = "; "): string {
  return affiliations.map((name, i) => `${i + 1}. ${name}`).join(sep);
}

/** The affiliation names a single author belongs to, in list order. */
export function resolveAuthorAffiliations(
  affiliationIndexes: number[],
  affiliations: string[]
): string[] {
  return affiliationIndexes
    .map((n) => affiliations[n - 1])
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}
