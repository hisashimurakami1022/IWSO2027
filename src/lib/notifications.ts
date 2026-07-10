import type { ReactElement } from "react";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

export async function sendNotification({
  to,
  subject,
  react,
  type,
  userId,
  submissionId,
}: {
  to: string;
  subject: string;
  react: ReactElement;
  type: NotificationType;
  userId?: string;
  submissionId?: string;
}) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    });
    await prisma.notificationLog.create({
      data: { type, subject, recipient: to, userId, submissionId },
    });
  } catch (error) {
    console.error(`Failed to send notification (${type}) to ${to}:`, error);
  }
}
