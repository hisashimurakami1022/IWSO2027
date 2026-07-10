import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { file: true },
  });

  if (!submission || !submission.file) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isChair = user.roles.includes("CHAIR");
  const isSubmitter = submission.submitterId === user.id;
  let isAssignedReviewer = false;

  if (!isChair && !isSubmitter) {
    const assignment = await prisma.reviewAssignment.findUnique({
      where: { submissionId_reviewerId: { submissionId: id, reviewerId: user.id } },
    });
    isAssignedReviewer = !!assignment;
  }

  if (!isChair && !isSubmitter && !isAssignedReviewer) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { file } = submission;
  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
      "Content-Length": String(file.size),
    },
  });
}
