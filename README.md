# אתר ישראלה היילו — עורכת דין לדיני תעבורה

אתר סטטי (HTML/CSS/JS ללא framework), עצמאי לחלוטין, בנוי לפריסה ב-Cloudflare Pages.
מבוסס על עיצוב Figma — ראו הערות "מדויק/משוער" בקובצי ה-CSS למקומות שממתינים לאימות סופי.

---

## 1. מבנה התיקיות

```
site/
├── index.html                     ← עמוד הבית
├── accessibility-statement.html   ← הצהרת נגישות (עם PLACEHOLDERs)
├── privacy-policy.html            ← מדיניות פרטיות (עם PLACEHOLDERs)
├── assets/
│   ├── images/
│   │   ├── hero-desktop.webp      ← תמונת Hero לדסקטופ (מ-IMG_2087.desk)
│   │   └── hero-mobile.webp       ← תמונת Hero למובייל (מ-IMG_2087.mobile)
│   └── icons/
│       ├── logo.svg               ← הלוגו (Asset_10.svg שסופק)
│       └── favicon.svg            ← פייבייקון זמני (placeholder, ראו סעיף 5)
├── css/
│   ├── reset.css                  ← reset מודרני
│   ├── variables.css              ← כל הצבעים/הפונטים/ה-spacing כ-CSS custom properties
│   └── styles.css                 ← כל שאר העיצוב (רכיבים + responsive)
├── js/
│   └── main.js                    ← ולידציה נגישה של הטופס + שליחה
├── functions/
│   └── contact.js                 ← Cloudflare Pages Function שמטפלת בשליחת המייל
├── .gitignore
└── README.md                      ← המסמך הזה
```

---

## 2. איך להריץ מקומית

האתר הוא HTML/CSS/JS טהור — אין build step. יש רק לוודא ששרת http מקומי מגיש את הקבצים (לא לפתוח `index.html` ישירות מה-Finder/Explorer, כי fetch לטופס לא יעבוד מ-`file://`).

**אפשרות א' — Python (מובנה ברוב המערכות):**
```bash
cd site
python3 -m http.server 8000
```
ואז לפתוח בדפדפן: `http://localhost:8000`

**אפשרות ב' — Node (אם מותקן):**
```bash
cd site
npx serve .
```

**אפשרות ג' — Wrangler (מדמה גם את ה-Cloudflare Function של הטופס):**
```bash
npx wrangler pages dev site
```
זו האפשרות המומלצת אם רוצים לבדוק גם את שליחת הטופס מקומית, כי `wrangler pages dev` מריץ גם את `functions/contact.js`.

---

## 3. איך לשנות תוכן (טקסטים)

כל הטקסטים נמצאים ישירות בקבצי ה-HTML (`index.html` וכו') — אין CMS או מקור תוכן חיצוני.
לדוגמה, 4 כרטיסי "תחומי טיפול" נמצאים בקובץ `index.html` בתוך `<ul class="services__grid">` — כרגע כולם עם אותו טקסט placeholder ("דיני תעבורה..."), יש להחליף כל `<li class="service-card">` בנפרד עם הכותרת (`<h3>`) והתיאור (`<p>`) הרלוונטיים.

---

## 4. איך לשנות תמונות

1. שמרו את קובץ התמונה החדש (עדיף `.webp` לביצועים, אך `.jpg`/`.png` גם יעבדו).
2. שימו בתיקייה `assets/images/`.
3. עדכנו את הנתיב ב-`index.html` בתוך תגית ה-`<picture>`:
   ```html
   <source media="(min-width: 761px)" srcset="assets/images/HERO-DESKTOP-CHADASH.webp">
   <img src="assets/images/HERO-MOBILE-CHADASH.webp" ...>
   ```
4. **חשוב**: יש להשאיר שתי גרסאות נפרדות (Desktop + Mobile) — כפי שהוגדר בעיצוב, כדי שמכשיר מובייל לא יוריד את תמונת הדסקטופ הכבדה.

---

## 5. איך לשנות צבעים

כל הצבעים מוגדרים במקום אחד — `css/variables.css`, למעלה בקובץ:

```css
--color-navy: #1F3248;   /* Header, סקשן טופס יצירת קשר */
--color-brown: #76665B;  /* לוגו, סקשן תחומי טיפול, כפתור משני */
--color-cream: #EDEBE8;  /* Hero, Footer */
```

שינוי ערך כאן משפיע על כל האתר בבת אחת (אין צבעים "קשיחים" מפוזרים בקבצי הרכיבים, מלבד חריגים מעטים ומתועדים כמו אפקט ה-glass).

---

## 6. איך לשנות פונטים

הפונט הנוכחי הוא **Heebo** (משקלים 400/500/700), נטען מ-Google Fonts דרך תגית `<link>` בראש כל עמוד HTML.

להחלפת הפונט:
1. עדכנו את שורת ה-`<link href="https://fonts.googleapis.com/css2?family=...">` בראש כל אחד משלושת קבצי ה-HTML.
2. עדכנו את `--font-family` בקובץ `css/variables.css`.

> **הערה לפרטיות**: טעינת Google Fonts יוצרת בקשת רשת חיצונית לשרתי Google (לא cookie מעקב, אך כן third-party request). אם תרצו למזער בקשות חיצוניות לגמרי — ניתן לעשות self-host לקובצי הפונט בתוך `assets/fonts/` ולהגדיר `@font-face` ב-CSS במקום ה-`<link>`. זה שינוי טכני קטן שאפשר לבצע בקלות אם תרצי.

---

## 7. איפה נמצא הטופס

- ה-HTML של הטופס: `index.html`, בתוך `<section class="cta" id="contact">`.
- ה-JS שמטפל בולידציה/שליחה: `js/main.js`.
- ה-Function בצד השרת שמקבלת את השליחה ואמורה לשלוח מייל: `functions/contact.js`.

**⚠️ הטופס עדיין לא שולח מייל בפועל** — זהו כרגע שלד production-ready עם placeholder, כפי שביקשת. כדי להפעיל אותו בפועל:
1. הירשמו לשירות שליחת מייל טרנזקציוני (למשל [Resend](https://resend.com), פשוט לשילוב עם Cloudflare).
2. הסירו את הערות ה-`//` בבלוק הדוגמה בתוך `functions/contact.js` ומלאו את פרטי השירות שבחרתן.
3. ב-Cloudflare Pages → Settings → Environment Variables, הוסיפו:
   - `RESEND_API_KEY` — המפתח הסודי מהשירות שבחרתן (**לעולם לא** לשים אותו בקוד עצמו).
   - `CONTACT_EMAIL` — כתובת המייל שאליה יגיעו הפניות (כרגע `Israela@hailu-lawoffice.com` מופיע רק כטקסט תצוגה ב-`index.html`/`privacy-policy.html`, לא בקוד השליחה).

עד אז, שליחת הטופס תחזיר הודעת שגיאה ברורה למשתמש/ת (ולא תעמיד פנים שהמייל נשלח) — ר' `functions/contact.js`.

---

## 8. מה נדרש כדי לפרוס ל-GitHub

```bash
cd site
git init
git add .
git commit -m "Initial commit — israela-hailu website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```
(יש ליצור קודם ריפו ריק ב-GitHub תחת שם הבחירה שלכן, ולהחליף `USERNAME/REPO-NAME`.)

---

## 9. מה נדרש כדי לפרוס ל-Cloudflare Pages

**אפשרות א' — חיבור ל-GitHub (מומלץ, כולל auto-deploy בכל push):**
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. בחרו את הריפו שיצרתן בשלב 8.
3. הגדרות Build:
   - **Framework preset**: None
   - **Build command**: (ריק — אין build step)
   - **Build output directory**: `/` (שורש הריפו, כי `index.html` נמצא ישירות שם)
4. לפני הפריסה — הוסיפו את משתני הסביבה מסעיף 7 (`RESEND_API_KEY`, `CONTACT_EMAIL`) אם רוצים שהטופס יעבוד בפועל.
5. חברו דומיין מותאם אישית תחת Custom Domains, לאחר שהאתר עלה בהצלחה.

**אפשרות ב' — Deploy ידני בלי GitHub (Wrangler CLI):**
```bash
npx wrangler pages deploy site --project-name=israela-hailu
```

לפי הבקשה המקורית — **לא ביצעתי אף אחת מהפעולות האלה בפועל**, רק הכנתי את האתר שיהיה מוכן לכך.
