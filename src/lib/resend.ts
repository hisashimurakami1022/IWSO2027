import { Resend } from "resend";

export const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "IWSO 2027 <onboarding@resend.dev>";
