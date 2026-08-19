/**
 * functions/contact.js
 * Cloudflare Pages Function — מטפלת ב-POST ל-/contact.
 * מתקבל כאן ה-JSON שנשלח מ-main.js, ומועבר משם ל-Web3Forms
 * דרך קריאת שרת-לשרת. מפתח ה-Web3Forms (WEB3FORMS_ACCESS_KEY)
 * נשמר כ-Secret בהגדרות הפרויקט ב-Cloudflare Pages, ואינו
 * חשוף בשום שלב בצד הלקוח (לא ב-HTML, לא ב-JS, לא ב-git).
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.json();
    const { name, phone, email, message, botcheck } = payload;

    // הגנת honeypot — אם השדה המוסתר מולא, כנראה בוט. מחזירים
    // תגובת "הצלחה" מזויפת (כדי לא לחשוף לבוט שהוא נחסם) אך לא שולחים מייל.
    if (botcheck) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ולידציה בסיסית בצד השרת — קו הגנה נוסף מעבר לוולידציה בצד הלקוח
    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ success: false, message: "חסרים שדות חובה." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const web3formsResponse = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        subject: "פנייה חדשה מאתר ישראלה היילו",
        from_name: name,
        name,
        phone,
        email,
        message: message || "(לא צוינה הודעה)"
      })
    });

    const result = await web3formsResponse.json();

    if (!web3formsResponse.ok || !result.success) {
      throw new Error(result.message || "Web3Forms returned an error");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "שגיאת שרת בשליחת הטופס." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
