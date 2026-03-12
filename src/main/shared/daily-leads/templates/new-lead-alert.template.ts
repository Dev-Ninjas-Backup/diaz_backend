/**
 * HTML template for new daily lead email alert to admin.
 * Placeholders: LEAD_NAME, LEAD_EMAIL, STATUS, USER_ID, LEAD_TIME,
 * TIMESTAMP, CLIENT_NAME, YEAR, DASHBOARD_URL
 */
export const NEW_LEAD_ALERT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>New Lead Alert</title>
    <style>
        /* Bulletproof email reset */
        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
        a { text-decoration: none; }

        /* Mobile */
        @media screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .px { padding-left: 16px !important; padding-right: 16px !important; }
          .py { padding-top: 16px !important; padding-bottom: 16px !important; }
          .h1 { font-size: 22px !important; line-height: 28px !important; }
          .btn { width: 100% !important; }
          .btn a { display: block !important; }
          .two-col td { display: block !important; width: 100% !important; }
          .label { width: 120px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6;">
    <!-- Preheader (hidden) -->
    <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
        New daily lead received for {{LEAD_NAME}}.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#f3f4f6;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <!--[if mso]>
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr><td>
          <![endif]-->
          <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td class="px py" style="padding:22px 28px; background-color:#0b5ed7;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; color:#ffffff;">
                      <div class="h1" style="font-size:26px; line-height:32px; font-weight:800;">
                        New Lead Alert
                      </div>
                      <div style="margin-top:6px; font-size:13px; line-height:18px; opacity:0.95;">
                        {{TIMESTAMP}}
                      </div>
                    </td>
                    <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; color:#ffffff;">
                      <span style="display:inline-block; padding:8px 12px; border-radius:999px; background-color:rgba(255,255,255,0.18); font-size:12px; font-weight:700; letter-spacing:0.6px;">
                        DAILY LEAD
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td class="px" style="padding:22px 28px 10px 28px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; color:#111827;">
                <div style="font-size:15px; line-height:22px;">
                  Hello <strong>{{CLIENT_NAME}}</strong>,
                </div>
                <div style="margin-top:8px; font-size:15px; line-height:22px; color:#374151;">
                  A new daily lead has been submitted. Details are below.
                </div>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td class="px" style="padding:14px 28px 16px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb; border-radius:12px;">
                  <tr>
                    <td style="padding:16px 16px 12px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                      <div style="font-size:16px; line-height:22px; font-weight:800; color:#111827;">
                        {{LEAD_NAME}}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 16px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        <tr>
                          <td class="label" width="140" style="padding:10px 0; font-size:12px; line-height:18px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.4px; border-top:1px solid #f3f4f6;">
                            Email
                          </td>
                          <td style="padding:10px 0; font-size:14px; line-height:20px; font-weight:600; color:#111827; border-top:1px solid #f3f4f6;">
                            <a href="mailto:{{LEAD_EMAIL}}" style="color:#0b5ed7;">{{LEAD_EMAIL}}</a>
                          </td>
                        </tr>
                        <tr>
                          <td class="label" width="140" style="padding:10px 0; font-size:12px; line-height:18px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.4px; border-top:1px solid #f3f4f6;">
                            User ID
                          </td>
                          <td style="padding:10px 0; font-size:14px; line-height:20px; font-weight:600; color:#111827; border-top:1px solid #f3f4f6;">
                            {{USER_ID}}
                          </td>
                        </tr>
                        <tr>
                          <td class="label" width="140" style="padding:10px 0; font-size:12px; line-height:18px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.4px; border-top:1px solid #f3f4f6;">
                            Status
                          </td>
                          <td style="padding:10px 0; font-size:14px; line-height:20px; font-weight:600; color:#111827; border-top:1px solid #f3f4f6;">
                            {{STATUS}}
                          </td>
                        </tr>
                        <tr>
                          <td class="label" width="140" style="padding:10px 0; font-size:12px; line-height:18px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.4px; border-top:1px solid #f3f4f6;">
                            Received
                          </td>
                          <td style="padding:10px 0; font-size:14px; line-height:20px; font-weight:600; color:#111827; border-top:1px solid #f3f4f6;">
                            {{LEAD_TIME}}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Actions -->
            <tr>
              <td class="px" style="padding:0 28px 22px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="two-col">
                  <tr>
                    <td valign="top" style="padding:0 0 12px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="mailto:{{LEAD_EMAIL}}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="16%" stroke="f" fillcolor="#0b5ed7">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                          Respond now
                        </center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="width:260px;">
                        <tr>
                          <td align="center" style="background-color:#0b5ed7; border-radius:10px;">
                            <a href="mailto:{{LEAD_EMAIL}}" style="display:inline-block; padding:12px 14px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:14px; font-weight:800; color:#ffffff;">
                              Respond now
                            </a>
                          </td>
                        </tr>
                      </table>
                      <!--<![endif]-->
                    </td>
                    <td valign="top" align="right" style="padding:0 0 12px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{DASHBOARD_URL}}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="16%" stroke="t" strokecolor="#0b5ed7" fillcolor="#ffffff">
                        <w:anchorlock/>
                        <center style="color:#0b5ed7;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                          View dashboard
                        </center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="width:260px;">
                        <tr>
                          <td align="center" style="background-color:#ffffff; border:2px solid #0b5ed7; border-radius:10px;">
                            <a href="{{DASHBOARD_URL}}" style="display:inline-block; padding:10px 14px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:14px; font-weight:800; color:#0b5ed7;">
                              View dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="px py" style="padding:18px 28px; background-color:#f9fafb; border-top:1px solid #e5e7eb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                <div style="font-size:12px; line-height:18px; color:#6b7280; text-align:center; font-weight:700;">
                  Jupiter Marine Sales
                </div>
                <div style="margin-top:6px; font-size:12px; line-height:18px; color:#6b7280; text-align:center;">
                  © {{YEAR}} Jupiter Marine Sales. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td></tr></table>
          <![endif]-->
        </td>
      </tr>
    </table>
</body>
</html>
`;

export type NewLeadAlertVars = {
  LEAD_NAME: string;
  LEAD_EMAIL: string;
  STATUS: string;
  USER_ID: string;
  LEAD_TIME: string;
  TIMESTAMP: string;
  CLIENT_NAME: string;
  YEAR: string;
  DASHBOARD_URL: string;
};

export function getNewLeadAlertHtml(vars: NewLeadAlertVars): string {
  let html = NEW_LEAD_ALERT_HTML;
  for (const [key, value] of Object.entries(vars)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return html;
}
