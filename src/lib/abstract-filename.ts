// Download name for an abstract PDF: "<submission code>_<title>.pdf",
// e.g. "C0012_First-Principles Study of NbAlN.pdf". Used by the single-file
// route and the bulk ZIP export so a saved file is recognisable.
export function abstractFileName(
  submission: { submissionCode: string | null; id: string; title: string },
  originalName?: string | null
): string {
  const code = submission.submissionCode ?? submission.id.slice(0, 8);
  const title = submission.title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const ext = originalName?.match(/\.[A-Za-z0-9]+$/)?.[0]?.toLowerCase() ?? ".pdf";
  return title ? `${code}_${title}${ext}` : `${code}${ext}`;
}

// A value safe to put inside a quoted Content-Disposition `filename=`
// (ASCII only); pair it with `filename*=UTF-8''<encoded>` for the real name.
export function asciiFallbackName(name: string): string {
  return name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
}
