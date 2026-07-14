const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const copyButton = document.querySelector("[data-copy-layout]");

function setMenu(open) {
  if (!menuButton || !nav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menuButton.setAttribute("title", open ? "Close navigation" : "Open navigation");
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);

  const icon = menuButton.querySelector("svg");
  if (icon && window.lucide) {
    icon.outerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 960) setMenu(false);
});

const observedSections = Array.from(document.querySelectorAll("main section[id]"));
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-22% 0px -65%", threshold: [0, 0.1, 0.3] },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through for browsers that expose the API but deny permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

copyButton?.addEventListener("click", async () => {
  const layout = document.querySelector("[data-layout-text]")?.textContent?.trim();
  if (!layout) return;

  try {
    const copied = await copyText(layout);
    if (!copied) throw new Error("Copy failed");
    copyButton.classList.add("copied");
    copyButton.setAttribute("aria-label", "Archive layout copied");
    copyButton.setAttribute("title", "Copied");
    copyButton.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
    window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });

    window.setTimeout(() => {
      copyButton.classList.remove("copied");
      copyButton.setAttribute("aria-label", "Copy archive layout");
      copyButton.setAttribute("title", "Copy archive layout");
      copyButton.innerHTML = '<i data-lucide="copy" aria-hidden="true"></i>';
      window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
    }, 1600);
  } catch {
    copyButton.setAttribute("title", "Copy unavailable");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
});
