import nodemailer, { type Transporter } from "nodemailer";
import prisma from "@/lib/prisma";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return transporter;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailArgs) {
  const t = getTransporter();
  const fromAddress = from ?? process.env.SMTP_FROM;
  if (!fromAddress) {
    throw new Error("SMTP_FROM is not configured");
  }

  const info = await t.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });

  return info;
}

/**
 * Replace {{placeholders}} in the string with values from the data object.
 */
function renderTemplate(input: string, data: Record<string, unknown>): string {
  return input.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key: string) => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (acc, part) =>
          acc && typeof acc === "object"
            ? (acc as Record<string, unknown>)[part]
            : undefined,
        data
      );
    return value === undefined || value === null ? "" : String(value);
  });
}

export async function sendTemplate(
  slug: string,
  to: string,
  data: Record<string, unknown> = {}
) {
  const template = await prisma.emailTemplate.findUnique({ where: { slug } });
  if (!template) {
    throw new Error(`Email template "${slug}" not found`);
  }
  if (template.active !== 1) {
    throw new Error(`Email template "${slug}" is inactive`);
  }

  const subject = renderTemplate(template.subject, data);
  const html = renderTemplate(template.message, data);

  const from =
    template.fromEmail && template.fromName
      ? `"${template.fromName}" <${template.fromEmail}>`
      : template.fromEmail ?? undefined;

  return sendEmail({ to, subject, html, from });
}

export { renderTemplate };
