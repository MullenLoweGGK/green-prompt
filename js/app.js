(function () {
  var promptNode = document.getElementById("green-prompt");
  var promptText = promptNode ? promptNode.textContent.replace(/^\n/, "").trim() : "";
  var copyButton = document.getElementById("copy-button");
  var copyVerb = document.querySelector(".copy-verb");
  var copyName = document.querySelector(".copy-name");
  var copyStatus = document.getElementById("copy-status");
  var fallback = document.getElementById("prompt-fallback");
  var footButton = document.getElementById("copy-button-foot");
  var qrMount = document.getElementById("qrcode");
  var action = document.querySelector(".action");
  var defaultHelp =
    "Po naskenovaní je GREEN PROMPT v schránke. Otvor ChatGPT a vlož ho ako prvú správu.";
  var fromScan = new URL(window.location.href).searchParams.get("scan") === "1";

  function pageUrl() {
    var url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.set("scan", "1");
    return url.toString();
  }

  function drawQr() {
    if (!qrMount || typeof qrcode !== "function") return;
    var qr = qrcode(0, "M");
    qr.addData(pageUrl());
    qr.make();
    qrMount.innerHTML = qr.createSvgTag({
      cellSize: 4,
      margin: 1,
      scalable: true,
    });
    qrMount.dataset.url = pageUrl();
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function markCopied(sticky) {
    if (fallback) fallback.hidden = true;
    copyVerb.textContent = "Skopírované";
    copyName.textContent = "Vlož do ChatGPT";
    copyButton.classList.add("is-copied");
    copyStatus.textContent =
      "GREEN PROMPT je v schránke. Otvor ChatGPT a vlož ho ako prvú správu.";
    if (sticky) return;
    window.setTimeout(function () {
      copyVerb.textContent = "Skopírovať";
      copyName.textContent = "GREEN PROMPT";
      copyButton.classList.remove("is-copied");
      copyStatus.textContent = defaultHelp;
    }, 2800);
  }

  function showManualCopy() {
    if (!fallback) return;
    fallback.hidden = false;
    fallback.value = promptText;
    fallback.focus();
    fallback.select();
    copyStatus.textContent =
      "Schránka nie je dostupná. Prompt je označený nižšie, skopíruj ho odtiaľ a vlož do ChatGPT.";
  }

  function copyPrompt(options) {
    var sticky = options && options.sticky;
    var revealFallback = !options || options.revealFallback !== false;
    var done = function () {
      markCopied(sticky);
    };
    var failed = function () {
      if (fromScan && !revealFallback) {
        copyStatus.textContent =
          "Klepni na tlačidlo. Prompt sa skopíruje a vložíš ho do ChatGPT.";
        return;
      }
      showManualCopy();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptText).then(done).catch(function () {
        if (fallbackCopy(promptText)) done();
        else failed();
      });
      return;
    }

    if (fallbackCopy(promptText)) done();
    else failed();
  }

  drawQr();

  if (fromScan && action) {
    action.classList.add("is-from-scan");
    copyStatus.textContent = "Kopírujem GREEN PROMPT do schránky…";
    copyPrompt({ sticky: true, revealFallback: false });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      copyPrompt();
    });
  }
  if (footButton) {
    footButton.addEventListener("click", function () {
      action.scrollIntoView({ behavior: "smooth", block: "center" });
      copyPrompt();
    });
  }
})();
