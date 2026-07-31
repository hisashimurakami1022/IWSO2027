import { Readable } from "node:stream";
import { ZipArchive } from "archiver";
import { prisma } from "@/lib/prisma";
import { requireChair } from "@/lib/session";
import type { SubmissionStatus } from "@/generated/prisma/client";

function safeFilenamePart(value: string, maxLength: number) {
  return value
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .slice(0, maxLength);
}

export async function GET(request: Request) {
  await requireChair();

  const status = new URL(request.url).searchParams.get("status") as SubmissionStatus | null;

  // Fetch only ids/titles up front, then pull each PDF's bytes one at a time
  // below, so we never hold more than one file in memory at once.
  const submissions = await prisma.submission.findMany({
    where: { ...(status ? { status } : {}), file: { isNot: null } },
    select: { id: true, title: true },
    orderBy: { createdAt: "asc" },
  });

  const archive = new ZipArchive({ zlib: { level: 6 } });
  const usedNames = new Set<string>();

  (async () => {
    for (const submission of submissions) {
      const file = await prisma.submissionFile.findUnique({
        where: { submissionId: submission.id },
        select: { data: true },
      });
      if (!file) continue;

      let name = `${safeFilenamePart(submission.title, 60)}_${submission.id}.pdf`;
      while (usedNames.has(name)) name = `_${name}`;
      usedNames.add(name);

      archive.append(Buffer.from(file.data), { name });
    }
    await archive.finalize();
  })();

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="abstracts.zip"',
    },
  });
}
