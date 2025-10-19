// ✅ Choose API automatically:
// - when running locally: http://127.0.0.1:8787/api/translate
// - when deployed: https://pollyglot-worker.pollyglot-worker-humaira.workers.dev/api/translate
const API =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8787/api/translate"
    : "https://pollyglot-worker.pollyglot-worker-humaira.workers.dev/api/translate";

const $ = (sel) => document.querySelector(sel);

const inputScreen = $("#screen-input");
const resultScreen = $("#screen-results");
const sourceText = $("#sourceText");
const originalText = $("#originalText");
const translatedText = $("#translatedText");
const translateBtn = $("#translateBtn");
const resetBtn = $("#resetBtn");
const errorEl = $("#error");

function getTargetLang() {
  const checked = document.querySelector('input[name="target"]:checked');
  return checked ? checked.value : "fr";
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}

async function translate() {
  clearError();
  const text = sourceText.value.trim();
  if (!text) return showError("Please enter some text to translate.");

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating…";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        targetLang: getTargetLang(), // ✅ changed this
        temperature: 0.4,
        max_tokens: 120
      })
    });

    if (!res.ok) {
      const m = await res.text();
      throw new Error(m || `Request failed: ${res.status}`);
    }

    const data = await res.json();
    const out = (data.translation || "").trim();

    if (!out) throw new Error("Empty translation. Try again.");

    // Fill results
    originalText.textContent = text;
    translatedText.textContent = out;

    // Swap screens
    inputScreen.classList.remove("active");
    resultScreen.classList.add("active");
  } catch (err) {
    showError(err.message || "Something went wrong.");
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
}

function resetApp() {
  resultScreen.classList.remove("active");
  inputScreen.classList.add("active");
  sourceText.focus();
}

translateBtn.addEventListener("click", translate);
resetBtn.addEventListener("click", resetApp);
