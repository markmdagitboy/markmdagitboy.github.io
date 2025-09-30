"use strict";
(() => {
  // ts/script.ts
  function updateProgressBar() {
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      const progress = Math.min(100, Math.max(0, scrolled));
      progressBar.style.width = progress + "%";
      progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));
    }
  }
  var scrollTimeout = null;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(updateProgressBar);
  }, { passive: true });
  function createHPPartCardForTest(item) {
    const card = document.createElement("div");
    card.className = "hp-part-card entry";
    const title = document.createElement("h4");
    title.textContent = item["Model"] || "Unnamed Model";
    card.appendChild(title);
    function renderField(labelText, value) {
      if (!value)
        return;
      const p = document.createElement("p");
      p.className = "supply-chain-desc";
      p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
      card.appendChild(p);
    }
    if (item["Processor Family"] || item["Processor"]) {
      const proc = [item["Processor Family"], item["Processor"]].filter(Boolean).join(" \u2014 ");
      renderField("Processor", proc);
    }
    renderField("Memory", item["Memory"] ? `${item["Memory"]} (${item["Memory Type"] || "type N/A"})` : void 0);
    renderField("Storage", item["Internal Drive"]);
    renderField("Display", item["Display"]);
    renderField("Graphics", item["Graphics"]);
    renderField("Ports", item["External I/O Ports"]);
    renderField("Weight", item["Weight"]);
    renderField("Warranty", item["Warranty"]);
    function pnLine(labelText, pn) {
      if (!pn)
        return;
      const p = document.createElement("p");
      p.className = "supply-chain-desc";
      const label = document.createElement("strong");
      label.textContent = `${labelText}:`;
      const text = document.createElement("span");
      text.textContent = ` ${pn}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", `Copy ${labelText.toLowerCase()} part number: ${pn}`);
      btn.textContent = "Copy";
      const tip = document.createElement("span");
      tip.className = "copy-tip";
      tip.setAttribute("aria-hidden", "true");
      tip.textContent = "";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pn);
          announceLive(`Copied ${pn}`);
          tip.textContent = "Copied!";
          setTimeout(() => {
            tip.textContent = "";
          }, 1200);
        } catch (err) {
          console.error("Copy failed", err);
          announceLive("Copy failed");
          tip.textContent = "Failed";
          setTimeout(() => {
            tip.textContent = "";
          }, 1200);
        }
      });
      p.appendChild(label);
      p.appendChild(text);
      p.appendChild(document.createTextNode(" "));
      p.appendChild(btn);
      p.appendChild(tip);
      card.appendChild(p);
    }
    pnLine("Screen PN", item["Screen Replacement Part # (Common)"]);
    pnLine("Battery PN", item["Battery Replacement Part # (Common)"]);
    return card;
  }
  function announceLiveStub(message) {
    try {
      const fn = globalThis.__announceLive;
      if (typeof fn === "function") {
        fn(message);
      }
    } catch (e) {
    }
  }
  var announceLive = typeof globalThis.__announceLive === "function" ? globalThis.__announceLive : announceLiveStub;
  document.addEventListener("DOMContentLoaded", () => {
    async function loadAndDisplayHPParts() {
      const projectsSection = document.getElementById("projects");
      if (!projectsSection)
        return;
      const entryDiv = projectsSection.querySelector("#hp-parts-entry");
      if (!entryDiv)
        return;
      entryDiv.innerHTML = "<h3>HP Parts List Database</h3><p>Loading data...</p>";
      try {
        const response = await fetch("data/hp_parts.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          entryDiv.innerHTML = "<h3>HP Parts List Database</h3><p>No data available.</p>";
          return;
        }
        entryDiv.innerHTML = "<h3>HP Parts List Database</h3>";
        const listContainer = document.createElement("div");
        listContainer.className = "hp-parts-list";
        data.forEach((item) => {
          const card = createHPPartCardForTest(item);
          listContainer.appendChild(card);
        });
        entryDiv.appendChild(listContainer);
      } catch (error) {
        console.error("Error fetching or displaying HP parts data:", error);
        entryDiv.innerHTML = "<h3>HP Parts List Database</h3><p>Could not load data.</p>";
      }
    }
    loadAndDisplayHPParts();
    async function loadAndDisplaySupplyChainData() {
      const projectsSection = document.getElementById("projects");
      if (!projectsSection)
        return;
      const entryDiv = projectsSection.querySelector("#supply-chain-entry");
      if (!entryDiv)
        return;
      entryDiv.innerHTML = "<h3>Supply Chain Analysis</h3><p>Loading data...</p>";
      try {
        const response = await fetch("data/supply_chain.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          entryDiv.innerHTML = "<h3>Supply Chain Analysis</h3><p>No data available.</p>";
          return;
        }
        entryDiv.innerHTML = "<h3>Supply Chain Analysis</h3>";
        const listContainer = document.createElement("div");
        listContainer.className = "supply-chain-list";
        data.forEach((item) => {
          const card = document.createElement("div");
          card.className = "supply-chain-card entry";
          const title = document.createElement("h4");
          const series = item["Model Series"] || item["Model"] || "Model Series";
          const generation = item["Generation"] ? ` ${item["Generation"]}` : "";
          title.textContent = `${series}${generation}`;
          card.appendChild(title);
          function renderSCField(labelText, value) {
            if (!value)
              return;
            const p = document.createElement("p");
            p.className = "supply-chain-desc";
            p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
            card.appendChild(p);
          }
          renderSCField("Assembly", item["Typical Final Assembly Location(s)"]);
          renderSCField("Partners", item["Primary Assembly Partners (ODMs)"]);
          renderSCField("Notes", item["Notes & Context"]);
          listContainer.appendChild(card);
        });
        entryDiv.appendChild(listContainer);
      } catch (error) {
        console.error("Error fetching or displaying supply chain data:", error);
        entryDiv.innerHTML = "<h3>Supply Chain Analysis</h3><p>Could not load data.</p>";
      }
    }
    loadAndDisplaySupplyChainData();
    (function manageManufacturerMaps() {
      const mapContainer = document.getElementById("map-container");
      const viewSelect = document.getElementById("map-view-select");
      const modal = document.getElementById("map-modal");
      const modalBody = document.getElementById("map-modal-body");
      const modalClose = modal ? modal.querySelector(".map-modal-close") : null;
      if (!mapContainer)
        return;
      const mc = mapContainer;
      const maps = [
        {
          id: "quanta",
          name: "Quanta Computer",
          subtitle: "Quanta Computer Inc.",
          src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60918979.32972123!2d47.548828125000014!3d25.04579224030345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a73f83a3ab5d%3A0xc391ab1cf5f8bae9!2sQuanta%20Computer%20Inc.!5e1!3m2!1sen!2sus!4v1759192107767!5m2!1sen!2sus"
        },
        {
          id: "compal",
          name: "Compal Electronics",
          subtitle: "Compal Electronics, Inc.",
          src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d67178764.97335072!2d-55.26281920403455!3d2.479846959788862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fc93fbc6c9cff%3A0xbaf94dc0397341c1!2sCompal%20Electronics%2C%20Inc.!5e1!3m2!1sen!2sus!4v1759192158327!5m2!1sen!2sus"
        },
        {
          id: "wistron",
          name: "Wistron",
          subtitle: "Wistron Corp.",
          src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59697452.47319248!2d58.63536408252298!3d27.40147589261721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abd698fa1c9d%3A0x2c836807dbe09706!2zV0lUUyAoV2lzdHJvbiBJVFMpIOe3r-WJtei7n-mrlA!5e1!3m2!1sen!2sus!4v1759192215510!5m2!1sen!2sus"
        },
        {
          id: "foxconn",
          name: "Foxconn",
          subtitle: "Foxconn",
          src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56710943.70579673!2d-160.82321526865508!3d32.50025850000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d93893a57f5ee3%3A0x843d8290d945980f!2sFoxconn!5e1!3m2!1sen!2sus!4v1759192259776!5m2!1sen!2sus"
        }
      ];
      function createEmbedEl(map) {
        const wrapper = document.createElement("div");
        wrapper.className = "map-item";
        const title = document.createElement("h4");
        title.textContent = map.name;
        wrapper.appendChild(title);
        const embed = document.createElement("div");
        embed.className = "map-embed";
        const iframe = document.createElement("iframe");
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        iframe.setAttribute("title", `${map.name} map`);
        iframe.src = map.src;
        embed.appendChild(iframe);
        wrapper.appendChild(embed);
        return wrapper;
      }
      function createThumbEl(map) {
        const wrapper = document.createElement("div");
        wrapper.className = "map-item";
        const btn = document.createElement("button");
        btn.className = "map-thumb";
        btn.type = "button";
        btn.setAttribute("aria-label", `Open ${map.name} map`);
        const img = document.createElement("img");
        img.alt = `${map.name} thumbnail`;
        img.className = "map-thumb-img";
        img.src = `images/maps/${map.id}-thumb.png`;
        img.loading = "lazy";
        const textWrap = document.createElement("div");
        const title = document.createElement("div");
        title.className = "thumb-title";
        title.textContent = map.name;
        const sub = document.createElement("div");
        sub.className = "thumb-sub";
        sub.textContent = map.subtitle || "";
        textWrap.appendChild(title);
        textWrap.appendChild(sub);
        btn.appendChild(img);
        btn.appendChild(textWrap);
        btn.addEventListener("click", () => openMapModal(map));
        wrapper.appendChild(btn);
        return wrapper;
      }
      function renderEmbedded() {
        mc.className = "map-container embedded";
        mc.innerHTML = "";
        maps.forEach((m) => mc.appendChild(createEmbedEl(m)));
      }
      function renderGrid() {
        mc.className = "map-container grid";
        mc.innerHTML = "";
        maps.forEach((m) => mc.appendChild(createEmbedEl(m)));
      }
      function renderThumbnails() {
        mc.className = "map-container thumbnails";
        mc.innerHTML = "";
        maps.forEach((m) => mc.appendChild(createThumbEl(m)));
      }
      let _prevFocused = null;
      let _keydownHandler = null;
      function openMapModal(map) {
        if (!modal || !modalBody)
          return;
        _prevFocused = document.activeElement;
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        modalBody.innerHTML = "";
        const embed = document.createElement("div");
        embed.className = "map-embed";
        const iframe = document.createElement("iframe");
        iframe.src = map.src;
        iframe.setAttribute("title", `${map.name} map (modal)`);
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        embed.appendChild(iframe);
        modalBody.appendChild(embed);
        const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(modal.querySelectorAll(focusableSelector));
        const firstFocusable = focusables[0] || modal;
        const lastFocusable = focusables[focusables.length - 1] || modal;
        if (modalClose)
          modalClose.focus();
        else
          firstFocusable.focus();
        _keydownHandler = function(e) {
          if (e.key === "Escape") {
            e.preventDefault();
            closeMapModal();
          } else if (e.key === "Tab") {
            if (!focusables.length)
              return;
            const active = document.activeElement;
            if (e.shiftKey) {
              if (active === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
              }
            } else {
              if (active === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
              }
            }
          }
        };
        document.addEventListener("keydown", _keydownHandler);
      }
      function closeMapModal() {
        var _a;
        if (!modal || !modalBody)
          return;
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        modalBody.innerHTML = "";
        if (_keydownHandler) {
          document.removeEventListener("keydown", _keydownHandler);
          _keydownHandler = null;
        }
        try {
          (_a = _prevFocused == null ? void 0 : _prevFocused.focus) == null ? void 0 : _a.call(_prevFocused);
        } catch (e) {
        }
        _prevFocused = null;
      }
      if (viewSelect) {
        viewSelect.addEventListener("change", () => {
          const val = viewSelect.value;
          if (val === "embedded")
            renderEmbedded();
          else if (val === "grid")
            renderGrid();
          else
            renderThumbnails();
        });
      }
      if (modalClose)
        modalClose.addEventListener("click", closeMapModal);
      if (modal)
        modal.addEventListener("click", (e) => {
          if (e.target === modal)
            closeMapModal();
        });
      renderEmbedded();
      globalThis.__mapsRender = { renderEmbedded, renderGrid, renderThumbnails, openMapModal, closeMapModal };
    })();
    const profileImage = document.querySelector(".profile-image");
    if (profileImage) {
      profileImage.addEventListener("error", function() {
        this.style.display = "none";
        const fallback = document.getElementById("profile-fallback");
        if (fallback) {
          fallback.style.display = "block";
        }
        console.warn("Profile image not found. Please add your headshot to images/profile/headshot.png");
      });
      profileImage.addEventListener("load", function() {
        this.style.opacity = "0";
        this.style.transform = "scale(0.9)";
        setTimeout(() => {
          this.style.transition = "all 0.5s ease";
          this.style.opacity = "1";
          this.style.transform = "scale(1)";
        }, 100);
      });
    }
    const nav = document.querySelector(".nav");
    const sections = document.querySelectorAll(".content .section");
    function showTab(tabId) {
      const btns = Array.from(document.querySelectorAll(".nav button"));
      btns.forEach((btn) => {
        const isActive = btn.getAttribute("data-tab") === tabId;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
      sections.forEach((section) => {
        if (section.id === tabId)
          section.classList.remove("hidden");
        else
          section.classList.add("hidden");
      });
    }
    if (nav) {
      nav.addEventListener("click", (e) => {
        const target = e.target;
        if (!target)
          return;
        const button = target.closest("button[data-tab]");
        if (!button)
          return;
        const tab = button.getAttribute("data-tab");
        showTab(tab);
      });
    } else {
      const navButtons = document.querySelectorAll(".nav button");
      navButtons.forEach((button) => {
        button.addEventListener("click", () => showTab(button.getAttribute("data-tab")));
      });
    }
    function makeCardsFocusable() {
      const cards = document.querySelectorAll(".hp-part-card, .supply-chain-card");
      cards.forEach((card) => {
        card.tabIndex = 0;
        card.setAttribute("role", "article");
      });
    }
    setTimeout(makeCardsFocusable, 250);
    const backToTop = document.createElement("button");
    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.innerHTML = "\u2191";
    document.body.appendChild(backToTop);
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }, { passive: true });
    const live = document.createElement("div");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.className = "sr-only";
    document.body.appendChild(live);
    function announceLive2(message) {
      live.textContent = "";
      setTimeout(() => {
        live.textContent = message;
      }, 100);
    }
    globalThis.__announceLive = announceLive2;
    const blogLinks = document.querySelectorAll(".blog-link");
    const blogSection = document.getElementById("blog");
    const blogPostSection = document.getElementById("blog-post");
    blogLinks.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const url = link.getAttribute("href");
        if (url && blogSection && blogPostSection) {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            blogPostSection.innerHTML = content;
            blogSection.classList.add("hidden");
            blogPostSection.classList.remove("hidden");
          } catch (error) {
            console.error("Error fetching blog post:", error);
            blogPostSection.innerHTML = '<p>Sorry, there was an error loading the blog post. Please try again later.</p><button class="back-to-blog">Back to Blog</button>';
            blogSection.classList.add("hidden");
            blogPostSection.classList.remove("hidden");
          }
        }
      });
    });
    if (blogPostSection) {
      blogPostSection.addEventListener("click", (e) => {
        if (e.target.classList.contains("back-to-blog")) {
          if (blogSection && blogPostSection) {
            blogPostSection.classList.add("hidden");
            blogSection.classList.remove("hidden");
            blogPostSection.innerHTML = "";
          }
        }
      });
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("keyboard-navigation");
    }
  });
  document.addEventListener("mousedown", () => {
    document.body.classList.remove("keyboard-navigation");
  });
})();
//# sourceMappingURL=script.bundle.js.map
