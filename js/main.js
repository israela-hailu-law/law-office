/**
 * main.js
 * טיפול נגיש בטופס יצירת הקשר: validation, מצבי טעינה/הצלחה/שגיאה.
 * הטופס נשלח ל-Cloudflare Pages Function ב-/contact (ראו functions/contact.js).
 * אין כאן שום API key או credential — אלה חיים רק בצד השרת (Cloudflare env vars).
 */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  const fields = {
    name: {
      el: document.getElementById("name"),
      errorEl: document.getElementById("name-error"),
      validate: (v) => (v.trim().length >= 2 ? "" : "נא להזין שם מלא (לפחות 2 תווים).")
    },
    phone: {
      el: document.getElementById("phone"),
      errorEl: document.getElementById("phone-error"),
      validate: (v) => {
        const digitsOnly = v.replace(/[^0-9]/g, "");
        if (digitsOnly.length < 9) return "נא להזין מספר טלפון תקין (ספרות בלבד).";
        return "";
      }
    },
    email: {
      el: document.getElementById("email"),
      errorEl: document.getElementById("email-error"),
      validate: (v) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(v.trim()) ? "" : "נא להזין כתובת מייל תקינה.";
      }
    }
  };

  // מניעת הקלדת תווים שאינם ספרות בשדה הטלפון (בנוסף ל-inputmode/pattern ב-HTML)
  if (fields.phone.el) {
    fields.phone.el.addEventListener("keypress", (e) => {
      const char = String.fromCharCode(e.which || e.keyCode);
      if (!/[0-9+\-\s]/.test(char)) {
        e.preventDefault();
      }
    });
    fields.phone.el.addEventListener("paste", (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData("text");
      if (/[^0-9+\-\s]/.test(pasted)) {
        e.preventDefault();
        const cleaned = pasted.replace(/[^0-9+\-\s]/g, "");
        document.execCommand("insertText", false, cleaned);
      }
    });
  }

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.el.value);
    field.el.setAttribute("data-touched", "true");
    field.el.setAttribute("aria-invalid", message ? "true" : "false");
    field.errorEl.textContent = message;
    return !message;
  }

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    field.el.addEventListener("blur", () => validateField(key));
    field.el.addEventListener("input", () => {
      if (field.el.getAttribute("data-touched") === "true") {
        validateField(key);
      }
    });
  });

  function setStatus(state, message) {
    statusEl.dataset.state = state;
    statusEl.textContent = message;
  }

  function setLoading(isLoading) {
    form.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      // מעביר focus לשדה השגוי הראשון (דרישת נגישות)
      const firstInvalidKey = Object.keys(fields).find(
        (key) => fields[key].el.getAttribute("aria-invalid") === "true"
      );
      if (firstInvalidKey) {
        fields[firstInvalidKey].el.focus();
      }
      setStatus("error", "יש לתקן את השדות המסומנים לפני שליחה.");
      return;
    }

    setLoading(true);
    setStatus("", "");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(form.action || "/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

           if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Server responded with an error");
      }

      form.reset();
      Object.values(fields).forEach((f) => {
        f.el.removeAttribute("data-touched");
        f.el.removeAttribute("aria-invalid");
        f.errorEl.textContent = "";
      });
      setStatus("success", "הפנייה נשלחה בהצלחה. ניצור איתך קשר בהקדם.");
    } catch (err) {
      setStatus(
        "error",
        "אירעה שגיאה בשליחת הפנייה. ניתן לנסות שוב, או ליצור קשר ישירות בטלפון/מייל שבתחתית העמוד."
      );
    } finally {
      setLoading(false);
    }
  });
})();
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');

    if (targetId === '#') return;

    const target = document.querySelector(targetId);

    if (!target) return;

    e.preventDefault();

    const start = window.scrollY;
    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      100;

    const distance = targetPosition - start;
    const duration = 800;
    let startTime = null;

    function easeInOut(t) {
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function animateScroll(currentTime) {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOut(progress);

      window.scrollTo(
        0,
        start + distance * easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  });
});
