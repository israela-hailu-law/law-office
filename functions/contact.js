/**
 * Cloudflare Pages Function — /contact
 *
 * מקבלת POST מהטופס בצד הלקוח, מבצעת ולידציה בסיסית גם בצד השרת
 * (אף פעם לא לסמוך רק על JS בצד הלקוח), ושולחת מייל לעורכת הדין.
 *
 * ⚠️ PLACEHOLDER — לפני deployment יש להגדיר ב-Cloudflare Pages
 * (Settings → Environment Variables) את המשתנים הבאים:
 *   RESEND_API_KEY   — מפתח API של שירות שליחת המייל (לדוגמה Resend.com)
 *   CONTACT_EMAIL    — כתובת המייל של עורכת הדין (יעד השליחה)
 *
 * אין לשים API keys או כתובות אמיתיות בקוד עצמו — רק כ-environment
 * variables בממשק הניהול של Cloudflare, כדי שלא ייחשפו בצד הלקוח
 * ולא יעלו ל-GitHub.
 *
 * הפנייה עצמה אינה נשמרת במסד נתונים — נשלחת ישירות למייל ונשכחת.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const name = (data.name || "").toString().trim();
  const phone = (data.phone || "").toString().trim();
  const email = (data.email || "").toString().trim();
  const message = (data.message || "").toString().trim();

  // ולידציה בסיסית בצד השרת (לא לסמוך רק על הלקוח)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = phone.replace(/[^0-9]/g, "");

  if (name.length < 2 || phoneDigits.length < 9 || !emailPattern.test(email)) {
    return new Response(JSON.stringify({ error: "validation_failed" }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    });
  }

  // PLACEHOLDER: החלף את בלוק השליחה בשירות המייל שתבחרו בפועל
  // (Resend / SendGrid / Mailchannels וכו'). דוגמה עם Resend:
  //
  // const emailResponse = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     from: "אתר משרד ישראלה הילו <no-reply@PLACEHOLDER-DOMAIN.co.il>",
  //     to: env.CONTACT_EMAIL,
  //     subject: `פנייה חדשה מהאתר — ${name}`,
  //     text: `שם: ${name}\nטלפון: ${phone}\nמייל: ${email}\n\nהודעה:\n${message || "(ללא הודעה)"}`
  //   })
  // });
  //
  // if (!emailResponse.ok) {
  //   return new Response(JSON.stringify({ error: "email_send_failed" }), {
  //     status: 502,
  //     headers: { "Content-Type": "application/json" }
  //   });
  // }

  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL) {
    // עדיין לא הוגדרו משתני הסביבה — מחזיר שגיאה ברורה במקום להעמיד פנים שנשלח.
    return new Response(
      JSON.stringify({
        error: "email_service_not_configured",
        message: "שירות שליחת המייל טרם הוגדר. יש להשלים RESEND_API_KEY ו-CONTACT_EMAIL בהגדרות Cloudflare Pages."
      }),
      { status: 501, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
