const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const localNavLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

function renderIcons() {
  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function setMenu(open) {
  if (!menuButton || !nav) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menuButton.setAttribute("title", open ? "Close navigation" : "Open navigation");
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  menuButton.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
  renderIcons();
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) setMenu(false);
});

if ("IntersectionObserver" in window && localNavLinks.length) {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      localNavLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-24% 0px -64%", threshold: [0, 0.1, 0.3] },
  );

  sections.forEach((section) => observer.observe(section));
}

const modeTabs = Array.from(document.querySelectorAll("[data-mode-tab]"));
const modePanels = Array.from(document.querySelectorAll("[data-mode-panel]"));

function selectMode(mode) {
  modeTabs.forEach((tab) => {
    const selected = tab.dataset.modeTab === mode;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  modePanels.forEach((panel) => {
    panel.hidden = panel.dataset.modePanel !== mode;
  });
}

modeTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectMode(tab.dataset.modeTab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % modeTabs.length
      : (index - 1 + modeTabs.length) % modeTabs.length;
    modeTabs[nextIndex].focus();
    selectMode(modeTabs[nextIndex].dataset.modeTab);
  });
});

async function copyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();
  if (copied) return true;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

const copyButton = document.querySelector("[data-copy-command]");
copyButton?.addEventListener("click", async () => {
  const command = document.querySelector("[data-command-text]")?.textContent?.trim();
  if (!command) return;

  copyButton.dataset.copyStatus = "working";
  try {
    const copied = await copyText(command);
    if (!copied) throw new Error("Copy failed");
    copyButton.dataset.copyStatus = "success";
    copyButton.classList.add("copied");
    copyButton.setAttribute("aria-label", "Evaluator command copied");
    copyButton.setAttribute("title", "Copied");
    copyButton.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
    renderIcons();

    window.setTimeout(() => {
      copyButton.classList.remove("copied");
      copyButton.setAttribute("aria-label", "Copy evaluator command");
      copyButton.setAttribute("title", "Copy evaluator command");
      copyButton.innerHTML = '<i data-lucide="copy" aria-hidden="true"></i>';
      copyButton.dataset.copyStatus = "idle";
      renderIcons();
    }, 3000);
  } catch {
    copyButton.dataset.copyStatus = "failed";
    copyButton.setAttribute("title", "Copy unavailable");
  }
});

const boardRows = Array.from(document.querySelectorAll(".leaderboard-table tbody tr"));
const boardFilters = Array.from(document.querySelectorAll("[data-board-filter]"));

function applyBoardFilter(direction) {
  if (!boardRows.length) return;

  const tbody = boardRows[0].parentElement;
  const sortedRows = [...boardRows].sort(
    (a, b) => Number(b.dataset.rate) - Number(a.dataset.rate),
  );

  let rank = 0;
  sortedRows.forEach((row) => {
    const visible = direction === "all" || row.dataset.direction === direction;
    row.hidden = !visible;
    if (visible) {
      rank += 1;
      row.querySelector("[data-rank]").textContent = String(rank);
    }
    tbody.appendChild(row);
  });

  boardFilters.forEach((button) => {
    const active = button.dataset.boardFilter === direction;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const visibleRows = sortedRows.filter((row) => !row.hidden);
  const packageCount = direction === "forward" ? 163 : direction === "reverse" ? 105 : 268;
  const modelCount = new Set(visibleRows.map((row) => row.querySelector('th[scope="row"]').textContent)).size;
  const bestRate = Math.max(...visibleRows.map((row) => Number(row.dataset.rate)));

  const packageStat = document.querySelector("[data-board-packages]");
  const modelStat = document.querySelector("[data-board-models]");
  const bestStat = document.querySelector("[data-board-best]");
  if (packageStat) packageStat.textContent = String(packageCount);
  if (modelStat) modelStat.textContent = String(modelCount);
  if (bestStat) bestStat.textContent = `${bestRate.toFixed(2)}%`;
}

boardFilters.forEach((button) => {
  button.addEventListener("click", () => applyBoardFilter(button.dataset.boardFilter));
});

if (boardRows.length) applyBoardFilter("all");

window.addEventListener("DOMContentLoaded", renderIcons);
