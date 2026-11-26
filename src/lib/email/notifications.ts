import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface ComponentNotificationPayload {
  title: string;
  description?: string | null;
  slug: string;
  type: "launch" | "update";
  category?: string | null;
  tags?: string[] | null;
}

export interface NotificationResult {
  success: boolean;
  totalRecipients: number;
  sentCount: number;
  mode: "full" | "test_admin_only" | "skipped";
  error?: string;
}

/**
 * Generates the HTML template for component notifications.
 */
function generateNotificationHtml({
  title,
  description,
  slug,
  type,
  siteUrl,
}: {
  title: string;
  description?: string | null;
  slug: string;
  type: "launch" | "update";
  siteUrl: string;
}) {
  const componentUrl = `${siteUrl}/components/${slug}`;
  const catalogUrl = `${siteUrl}/components`;
  const isLaunch = type === "launch";

  const badgeText = isLaunch ? "✨ NEW COMPONENT LAUNCH" : "⚡ COMPONENT UPDATED";
  const badgeBg = isLaunch ? "#052e16" : "#082f49";
  const badgeBorder = isLaunch ? "#166534" : "#0284c7";
  const badgeColor = isLaunch ? "#4ade80" : "#38bdf8";

  const headline = isLaunch
    ? "New Component Launch — Explore What's New"
    : `Component Updated: ${title}`;

  const subheadline = isLaunch
    ? "A new motion-crafted component is now live on UX With Motion! Elevate your user experience with smooth, production-ready interactions."
    : `We've just pushed updates and improvements to ${title}. Explore what's new and grab the latest code.`;

  const fallbackDescription =
    description && description.trim().length > 0
      ? description.trim()
      : "Smooth, high-performance UI interaction built with React, Tailwind CSS, and Framer Motion.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #121316; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);" cellspacing="0" cellpadding="0">
          
          <!-- Header / Brand -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid #1f2024;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 19px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff; text-decoration: none;">
                      UX With Motion
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 9999px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor};">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 16px; font-size: 26px; line-height: 1.25; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                ${title}
              </h1>
              
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                ${subheadline}
              </p>

              <!-- Component Preview Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #18191e; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 8px;">
                      Component Overview
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #f4f4f5; margin-bottom: 8px;">
                      ${title}
                    </div>
                    <div style="font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                      ${fallbackDescription}
                    </div>

                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
                      ⚡ React &nbsp;•&nbsp; Tailwind CSS &nbsp;•&nbsp; Framer Motion &nbsp;•&nbsp; 100% Copy-Paste Ready
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${componentUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background-color: #ffffff; color: #09090b; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; transition: background-color 0.2s ease;">
                      Explore Component →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${catalogUrl}" target="_blank" style="display: inline-block; font-size: 13px; color: #71717a; text-decoration: underline; margin-top: 6px;">
                      Or browse all motion components
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; background-color: #0f1013; border-top: 1px solid #1f2024; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #71717a;">
                You are receiving this email because you are a registered user of UX With Motion.
              </p>
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                © ${new Date().getFullYear()} UX With Motion. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates plain-text fallback for email clients.
 */
function generateNotificationText({
  title,
  description,
  slug,
  type,
  siteUrl,
}: {
  title: string;
  description?: string | null;
  slug: string;
  type: "launch" | "update";
  siteUrl: string;
}) {
  const componentUrl = `${siteUrl}/components/${slug}`;
  const catalogUrl = `${siteUrl}/components`;
  const isLaunch = type === "launch";

  return `
UX With Motion — ${isLaunch ? "New Component Launch" : "Component Updated"}

${isLaunch ? "✨ NEW COMPONENT LAUNCH" : "⚡ COMPONENT UPDATED"}
${title}

${description ? description + "\n\n" : ""}
Explore the interactive demo, variants, and copy-paste code now:
${componentUrl}

Browse all components:
${catalogUrl}

--
You are receiving this email because you are a registered user of UX With Motion.
© ${new Date().getFullYear()} UX With Motion.
  `.trim();
}

/**
 * Sends component launch / update notification emails to all registered/login users.
 */
export async function sendComponentNotificationEmail(
  payload: ComponentNotificationPayload
): Promise<NotificationResult> {
  // Paused by default; set ENABLE_COMPONENT_NOTIFICATIONS="true" to resume user emails.
  if (process.env.ENABLE_COMPONENT_NOTIFICATIONS !== "true") {
    console.info(
      `[Email Notification] Paused (${payload.type}): "${payload.title}" (${payload.slug})`
    );
    return {
      success: true,
      totalRecipients: 0,
      sentCount: 0,
      mode: "skipped",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email Notification] Skipped: RESEND_API_KEY is not configured.");
    return {
      success: false,
      totalRecipients: 0,
      sentCount: 0,
      mode: "skipped",
      error: "RESEND_API_KEY is not configured",
    };
  }

  const resend = new Resend(apiKey);
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://uxwithmotion.com";

  const isLaunch = payload.type === "launch";
  const subject = isLaunch
    ? `✨ New Component Launch: ${payload.title} | UX With Motion`
    : `⚡ Component Updated: ${payload.title} | UX With Motion`;

  const html = generateNotificationHtml({
    title: payload.title,
    description: payload.description,
    slug: payload.slug,
    type: payload.type,
    siteUrl,
  });

  const text = generateNotificationText({
    title: payload.title,
    description: payload.description,
    slug: payload.slug,
    type: payload.type,
    siteUrl,
  });

  // Default sender address or configured custom domain
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "UX With Motion <onboarding@resend.dev>";
  const replyToEmail =
    process.env.RESEND_REPLY_TO_EMAIL || "gfxwithsahil@gmail.com";

  try {
    // 1. Query all registered users from Supabase Auth admin API
    const supabase = createServiceRoleClient();
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authError) {
      console.error("[Email Notification] Error fetching users:", authError.message);
      return {
        success: false,
        totalRecipients: 0,
        sentCount: 0,
        mode: "skipped",
        error: authError.message,
      };
    }

    const rawUsers = authData?.users || [];
    const validEmails = Array.from(
      new Set(
        rawUsers
          .map((u) => u.email?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email && email.includes("@")))
      )
    );

    if (validEmails.length === 0) {
      console.log("[Email Notification] No registered users found to notify.");
      return {
        success: true,
        totalRecipients: 0,
        sentCount: 0,
        mode: "full",
      };
    }

    console.log(
      `[Email Notification] Preparing to notify ${validEmails.length} registered user(s) for ${payload.type}: "${payload.title}"`
    );

    // 2. Attempt to batch send to all users
    // If the domain is unverified on Resend (e.g. testing mode with onboarding@resend.dev),
    // Resend will restrict sending to only the verified account owner (gfxwithsahil@gmail.com).
    const isDefaultTestingDomain = fromEmail.includes("onboarding@resend.dev");

    if (isDefaultTestingDomain) {
      // In Resend testing mode, send to the account owner / verified address
      const adminOwnerEmail = "gfxwithsahil@gmail.com";
      console.log(
        `[Email Notification] Resend is using test domain (${fromEmail}). Sending notification preview to account owner: ${adminOwnerEmail}`
      );

      const { data, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: adminOwnerEmail,
        replyTo: replyToEmail,
        subject,
        html,
        text,
      });

      if (sendError) {
        console.error("[Email Notification] Resend send error:", sendError);
        return {
          success: false,
          totalRecipients: validEmails.length,
          sentCount: 0,
          mode: "test_admin_only",
          error: sendError.message,
        };
      }

      console.log(
        `[Email Notification] Successfully sent email to ${adminOwnerEmail} (ID: ${data?.id}). ` +
        `Note: To deliver to all ${validEmails.length} registered users automatically, add and verify your custom domain on https://resend.com/domains and set RESEND_FROM_EMAIL in your env.`
      );

      return {
        success: true,
        totalRecipients: validEmails.length,
        sentCount: 1,
        mode: "test_admin_only",
      };
    }

    // 3. For verified custom domains: send batch emails
    // Resend allows up to 100 emails per batch.send call
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < validEmails.length; i += batchSize) {
      const emailChunk = validEmails.slice(i, i + batchSize);
      const batchPayload = emailChunk.map((email) => ({
        from: fromEmail,
        to: email,
        replyTo: replyToEmail,
        subject,
        html,
        text,
      }));

      const { data: batchData, error: batchError } = await resend.batch.send(batchPayload);

      if (batchError) {
        console.error(`[Email Notification] Batch send error at chunk ${i}:`, batchError);
        // Fallback: If domain verification failed at runtime, attempt send to admin email
        if (batchError.message?.toLowerCase().includes("verify a domain")) {
          const adminOwnerEmail = "gfxwithsahil@gmail.com";
          await resend.emails.send({
            from: "UX With Motion <onboarding@resend.dev>",
            to: adminOwnerEmail,
            replyTo: replyToEmail,
            subject,
            html,
            text,
          });
          return {
            success: true,
            totalRecipients: validEmails.length,
            sentCount: 1,
            mode: "test_admin_only",
            error: batchError.message,
          };
        }
      } else {
        sentCount += emailChunk.length;
      }
    }

    console.log(
      `[Email Notification] Successfully sent notifications to ${sentCount}/${validEmails.length} registered users.`
    );

    return {
      success: true,
      totalRecipients: validEmails.length,
      sentCount,
      mode: "full",
    };
  } catch (error: any) {
    console.error("[Email Notification] Unexpected error:", error);
    return {
      success: false,
      totalRecipients: 0,
      sentCount: 0,
      mode: "skipped",
      error: error?.message || "Unknown error",
    };
  }
}
