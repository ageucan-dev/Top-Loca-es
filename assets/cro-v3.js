(function () {
  "use strict";

  var VERSION = "whatsapp-seo-v3";
  var PHONE = "5516992631992";
  var PHONE_DISPLAY = "(16) 99263-1992";
  var ROTATION_MS = 4600;
  var scheduled = false;
  var pendingWhatsApp = null;
  var leadStep = 1;
  var leadAnswers = { product: "", city: "", email: "" };
  var leadReturnFocus = null;

  function pushEvent(name, details) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({
      event: name,
      cro_version: VERSION,
      page_path: window.location.pathname
    }, details || {}));
  }

  function productContext(element) {
    var scope = element && element.closest(".product-card, .product-hero, .application-card, main");
    var text = scope ? scope.textContent.toLowerCase() : "";
    if (window.location.pathname.indexOf("eletrico") !== -1 || text.indexOf("elétrico") !== -1) {
      return "balancim elétrico";
    }
    if (window.location.pathname.indexOf("manual") !== -1 || text.indexOf("manual") !== -1) {
      return "balancim manual";
    }
    return "locação de balancim";
  }

  function whatsAppUrl(element, answers) {
    var product = answers && answers.product ? answers.product : productContext(element);
    var message = "Olá, Top Locações! Vim pelo site e gostaria de solicitar um orçamento para " + product + ".";
    if (answers && answers.city) message += " A obra será em " + answers.city + ".";
    if (answers && answers.email) message += " Meu e-mail é " + answers.email + ".";
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);
  }

  function openWhatsApp(element, location, answers) {
    var product = answers && answers.product ? answers.product : productContext(element);
    pushEvent("whatsapp_click", {
      conversion_type: "primary",
      cta_location: location,
      product_name: product
    });
    pushEvent("cro_whatsapp_click", {
      conversion_type: "primary",
      cta_location: location,
      product_name: product
    });
    pushEvent("generate_lead", {
      method: "whatsapp",
      cta_location: location,
      product_name: product
    });
    window.open(whatsAppUrl(element, answers), "_blank", "noopener,noreferrer");
  }

  function ensureLeadModal() {
    var existing = document.querySelector(".cro-lead-modal");
    if (existing) return existing;

    var modal = document.createElement("div");
    modal.className = "cro-lead-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="cro-lead-modal__backdrop" data-lead-close></div>' +
      '<section class="cro-lead-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cro-lead-title">' +
      '  <button class="cro-lead-modal__close" type="button" data-lead-close aria-label="Fechar">×</button>' +
      '  <div class="cro-lead-modal__eyebrow">ORÇAMENTO RÁPIDO</div>' +
      '  <div class="cro-lead-modal__progress" aria-label="Progresso"><span></span><span></span><span></span></div>' +
      '  <form class="cro-lead-modal__form" novalidate>' +
      '    <div class="cro-lead-step" data-lead-step="1">' +
      '      <div class="cro-lead-modal__count">Passo 1 de 3</div>' +
      '      <h2 id="cro-lead-title">Qual balancim você precisa?</h2>' +
      '      <p>Escolha o equipamento para prepararmos a conversa.</p>' +
      '      <div class="cro-lead-options">' +
      '        <button type="button" data-lead-product="balancim elétrico"><strong>Balancim elétrico</strong><span>Mais agilidade para obras maiores</span></button>' +
      '        <button type="button" data-lead-product="balancim manual"><strong>Balancim manual</strong><span>Praticidade e ótimo custo-benefício</span></button>' +
      '        <button type="button" data-lead-product="quero ajuda para escolher"><strong>Quero ajuda para escolher</strong><span>Nossa equipe indica o modelo ideal</span></button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="cro-lead-step" data-lead-step="2" hidden>' +
      '      <div class="cro-lead-modal__count">Passo 2 de 3</div>' +
      '      <h2>Em qual cidade será a obra?</h2>' +
      '      <p>Assim confirmamos rapidamente a disponibilidade de atendimento.</p>' +
      '      <label class="cro-lead-field"><span>Cidade da obra</span><input type="text" name="lead_city" autocomplete="address-level2" placeholder="Ex.: Ribeirão Preto" required></label>' +
      '      <div class="cro-lead-modal__error" role="alert"></div>' +
      '      <div class="cro-lead-modal__actions"><button type="button" class="cro-lead-back" data-lead-back>Voltar</button><button type="submit" class="cro-lead-next">Continuar</button></div>' +
      '    </div>' +
      '    <div class="cro-lead-step" data-lead-step="3" hidden>' +
      '      <div class="cro-lead-modal__count">Passo 3 de 3</div>' +
      '      <h2>Para concluir, qual é seu e-mail?</h2>' +
      '      <p>Usaremos este dado para atendimento e medição da campanha.</p>' +
      '      <label class="cro-lead-field"><span>Seu melhor e-mail</span><input type="email" name="lead_email" autocomplete="email" placeholder="voce@empresa.com.br" required></label>' +
      '      <label class="cro-lead-consent"><input type="checkbox" name="lead_consent" required><span>Concordo com o uso do meu e-mail pela Top Locações e pelo Google Ads para atendimento e mensuração publicitária.</span></label>' +
      '      <div class="cro-lead-modal__error" role="alert"></div>' +
      '      <div class="cro-lead-modal__actions"><button type="button" class="cro-lead-back" data-lead-back>Voltar</button><button type="submit" class="cro-lead-finish">Abrir WhatsApp</button></div>' +
      '    </div>' +
      '    <button type="button" class="cro-lead-skip" data-lead-skip>Prefiro ir direto ao WhatsApp</button>' +
      '  </form>' +
      '</section>';
    document.body.appendChild(modal);

    modal.addEventListener("click", function (event) {
      var product = event.target.closest("[data-lead-product]");
      if (product) {
        leadAnswers.product = product.dataset.leadProduct;
        pushEvent("whatsapp_qualification_step", { step_number: 1, product_name: leadAnswers.product });
        showLeadStep(2);
        return;
      }
      if (event.target.closest("[data-lead-close]")) closeLeadModal("closed");
      if (event.target.closest("[data-lead-back]")) showLeadStep(Math.max(1, leadStep - 1));
      if (event.target.closest("[data-lead-skip]")) {
        pushEvent("whatsapp_qualification_skipped", { cta_location: pendingWhatsApp.location, step_number: leadStep });
        var pending = pendingWhatsApp;
        closeLeadModal("skipped");
        openWhatsApp(pending.element, pending.location);
      }
    });

    modal.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      var error = modal.querySelector('[data-lead-step="' + leadStep + '"] .cro-lead-modal__error');
      if (error) error.textContent = "";

      if (leadStep === 2) {
        var city = modal.querySelector('[name="lead_city"]');
        if (!city.value.trim()) {
          error.textContent = "Informe a cidade para continuar.";
          city.focus();
          return;
        }
        leadAnswers.city = city.value.trim();
        pushEvent("whatsapp_qualification_step", { step_number: 2, lead_city: leadAnswers.city });
        showLeadStep(3);
        return;
      }

      var email = modal.querySelector('[name="lead_email"]');
      var consent = modal.querySelector('[name="lead_consent"]');
      if (!email.checkValidity()) {
        error.textContent = "Informe um e-mail válido.";
        email.focus();
        return;
      }
      if (!consent.checked) {
        error.textContent = "Confirme o uso dos dados para continuar.";
        consent.focus();
        return;
      }

      leadAnswers.email = email.value.trim().toLowerCase();
      pushEvent("whatsapp_lead_capture", {
        conversion_type: "enhanced_lead",
        cta_location: pendingWhatsApp.location,
        product_name: leadAnswers.product,
        lead_city: leadAnswers.city,
        user_data: { email_address: leadAnswers.email }
      });
      var pending = pendingWhatsApp;
      var answers = Object.assign({}, leadAnswers);
      closeLeadModal("completed");
      openWhatsApp(pending.element, pending.location, answers);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeLeadModal("closed");
    });
    return modal;
  }

  function showLeadStep(step) {
    var modal = ensureLeadModal();
    leadStep = step;
    modal.querySelectorAll("[data-lead-step]").forEach(function (panel) {
      panel.hidden = Number(panel.dataset.leadStep) !== step;
    });
    modal.querySelectorAll(".cro-lead-modal__progress span").forEach(function (item, index) {
      item.classList.toggle("is-active", index < step);
    });
    var focusTarget = step === 1 ? modal.querySelector("[data-lead-product]") : modal.querySelector('[data-lead-step="' + step + '"] input');
    window.setTimeout(function () { if (focusTarget) focusTarget.focus(); }, 40);
  }

  function closeLeadModal(reason) {
    var modal = document.querySelector(".cro-lead-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("cro-lead-modal-open");
    pushEvent("whatsapp_qualification_close", { close_reason: reason, step_number: leadStep });
    if (leadReturnFocus && leadReturnFocus.focus) leadReturnFocus.focus();
  }

  function openLeadModal(element, location) {
    var modal = ensureLeadModal();
    pendingWhatsApp = { element: element, location: location };
    leadReturnFocus = element;
    leadAnswers = { product: "", city: "", email: "" };
    var city = modal.querySelector('[name="lead_city"]');
    var email = modal.querySelector('[name="lead_email"]');
    var consent = modal.querySelector('[name="lead_consent"]');
    city.value = "";
    email.value = "";
    consent.checked = false;
    modal.querySelectorAll(".cro-lead-modal__error").forEach(function (item) { item.textContent = ""; });
    modal.hidden = false;
    document.body.classList.add("cro-lead-modal-open");
    showLeadStep(1);
    pushEvent("whatsapp_qualification_start", { cta_location: location, product_context: productContext(element) });
  }

  function ctaLocation(element) {
    if (element.closest(".promo-bar")) return "promo_ticker";
    if (element.closest(".home-hero, .product-hero")) return "hero";
    if (element.closest(".product-card")) return "product_card";
    if (element.closest(".application-card")) return "application_card";
    if (element.closest(".site-footer")) return "footer";
    return "content";
  }

  function isConversionCta(element) {
    if (!element || element.closest("#product-form")) return false;
    if (element.closest("nav, .menu, .product-faq, .carousel-controls")) return false;
    if (element.closest(".promo-bar, .cro-hero-image-action, .cro-product-image-action, .product-card__budget-cta")) return true;
    if (element.matches('a[href*="wa.me"], .cro-whatsapp-float')) return true;

    var text = (element.textContent || element.getAttribute("aria-label") || "").trim().toLowerCase();
    return /orçamento|entrar em contato|falar no whatsapp|pedir orçamento|quero um orçamento/.test(text);
  }

  function routeConversions() {
    if (document.documentElement.dataset.croWhatsAppCapture === VERSION) return;
    document.documentElement.dataset.croWhatsAppCapture = VERSION;
    document.addEventListener("click", function (event) {
      var target = event.target.closest("a, button, [role='button']");
      if (!isConversionCta(target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openLeadModal(target, ctaLocation(target));
    }, true);
  }

  /*
   * Os complementos de conversão enriquecem nós renderizados pelo React.
   * Uma navegação completa evita que o reconciliador tente desmontar uma
   * árvore que recebeu atributos externos entre duas rotas da SPA.
   */
  function stabilizeInternalNavigation() {
    if (document.documentElement.dataset.croStableNavigation === VERSION) return;
    document.documentElement.dataset.croStableNavigation = VERSION;
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      var url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }
      if (url.origin !== window.location.origin || url.hash && url.pathname === window.location.pathname) return;
      if (!["/", "/balancim-eletrico", "/balancim-manual", "/obrigado"].includes(url.pathname)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(url.href);
    }, true);
  }

  function enhancePromo() {
    var bar = document.querySelector(".promo-bar");
    if (!bar || bar.dataset.croTicker === VERSION) return;
    var inner = bar.querySelector(".promo-bar__inner") || bar;
    var source = inner.querySelector(".promo-bar__text");
    var phrases = [
      "10% de desconto para novos clientes",
      "Entregamos na sua cidade",
      "Técnicos inclusos"
    ];
    var group = phrases.map(function (phrase) {
      return '<span class="cro-ticker__item">' + phrase + '</span><span class="cro-ticker__dot" aria-hidden="true">•</span>';
    }).join("");
    var ticker = document.createElement("div");
    ticker.className = "cro-ticker";
    ticker.setAttribute("aria-label", "10% de desconto para novos clientes. Entregamos na sua cidade. Técnicos inclusos.");
    ticker.innerHTML = '<div class="cro-ticker__track"><span class="cro-ticker__group">' + group + '</span><span class="cro-ticker__group" aria-hidden="true">' + group + '</span></div>';
    if (source) source.classList.add("cro-ticker-source");
    inner.appendChild(ticker);
    bar.dataset.croTicker = VERSION;
    bar.setAttribute("role", "link");
    bar.setAttribute("tabindex", "0");
    bar.setAttribute("aria-label", "Abrir WhatsApp: promoções e vantagens Top Locações");
    bar.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openWhatsApp(bar, "promo_ticker");
    });
  }

  function enhanceHeroTitle() {
    var title = document.querySelector(".home-hero__title");
    if (!title || title.dataset.croRotation === VERSION) return;
    var phrases = [
      "Locação de balancins em Ribeirão Preto e região",
      "Sua obra em altura com mais segurança e agilidade",
      "Balancim elétrico ou manual entregue na sua cidade"
    ];
    title.removeAttribute("role");
    title.removeAttribute("tabindex");
    title.classList.remove("cro-hero-title-action");
    var index = 0;
    title.classList.add("cro-headline-rotator");
    title.dataset.croHeadline = phrases[index];
    title.removeAttribute("aria-label");
    title.dataset.croRotation = VERSION;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.setInterval(function () {
      if (!document.body.contains(title)) return;
      title.classList.add("is-changing");
      window.setTimeout(function () {
        index = (index + 1) % phrases.length;
        title.dataset.croHeadline = phrases[index];
        title.classList.remove("is-changing");
      }, 240);
    }, ROTATION_MS);
  }

  function enhanceCtas() {
    document.querySelectorAll("a, button").forEach(function (element) {
      if (!isConversionCta(element) || element.closest("#product-form")) return;
      if (element.matches(".cro-hero-image-action, .cro-product-image-action")) {
        element.setAttribute("aria-label", "Falar com a Top Locações no WhatsApp");
        return;
      }
      element.classList.add("cro-whatsapp-primary");
      var text = (element.textContent || "").trim().toLowerCase();
      if (/solicitar orçamento|entrar em contato|pedir orçamento/.test(text)) {
        element.classList.add("cro-cta-relabel");
      }
      if (element.tagName === "A") {
        element.href = whatsAppUrl(element);
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }
      element.setAttribute("aria-label", "Falar com a Top Locações no WhatsApp");
    });

    document.querySelectorAll("#produtos .product-card").forEach(function (card) {
      var image = card.querySelector(".product-card__image-wrapper");
      var details = card.querySelector(".product-card__footer a");
      if (image) {
        image.classList.add("cro-product-image-action");
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-label", "Falar com a Top Locações no WhatsApp");
      }
      if (details) {
        details.classList.add("cro-whatsapp-primary", "cro-cta-relabel");
        details.href = whatsAppUrl(details);
        details.target = "_blank";
        details.rel = "noopener noreferrer";
        details.setAttribute("aria-label", "Falar com a Top Locações no WhatsApp");
      }
    });
  }

  function addWhatsAppFloat() {
    if (document.querySelector(".cro-whatsapp-float")) return;
    var link = document.createElement("a");
    link.className = "cro-whatsapp-float";
    link.href = whatsAppUrl(link);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Falar agora com a Top Locações no WhatsApp");
    link.innerHTML = '<img src="/assets/whatsapp-icon.png" width="64" height="64" alt="" aria-hidden="true"><span>Fale conosco</span>';
    document.body.appendChild(link);
  }

  function enhanceFormAsSecondary() {
    var section = document.querySelector("#product-form");
    if (!section || section.dataset.croSecondary === VERSION) return;
    section.dataset.croSecondary = VERSION;
    section.classList.add("cro-secondary-conversion");
  }

  function optimizeHeroImage() {
    var image = document.querySelector(".home-hero__image");
    if (!image || image.dataset.croResponsive === VERSION) return;
    image.src = "/assets/ImgHero-720.webp";
    image.srcset = "/assets/ImgHero-420.webp 420w, /assets/ImgHero-720.webp 720w";
    image.sizes = "(max-width: 480px) calc(100vw - 48px), (max-width: 900px) 520px, 543px";
    image.width = 1086;
    image.height = 1448;
    image.dataset.croResponsive = VERSION;
  }

  function standardizeContact() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
      link.href = whatsAppUrl(link);
    });
  }

  function optimizeMetadata() {
    var route = window.location.pathname.replace(/\/$/, "") || "/";
    var pages = {
      "/": {
        title: "Locação de balancins em Ribeirão Preto | Top Locações",
        description: "Locação de balancins elétricos e manuais em Ribeirão Preto e região, com entrega ágil e assistência técnica para obras e fachadas."
      },
      "/balancim-eletrico": {
        title: "Aluguel de balancim elétrico em Ribeirão Preto | Top Locações",
        description: "Alugue balancim elétrico em Ribeirão Preto e região para fachadas, manutenção predial e obras com maior produtividade e suporte técnico."
      },
      "/balancim-manual": {
        title: "Aluguel de balancim manual em Ribeirão Preto | Top Locações",
        description: "Locação de balancim manual em Ribeirão Preto e região para pintura, reformas, fachadas e serviços pontuais em altura."
      }
    };
    var data = pages[route];
    if (!data) return;
    document.title = data.title;

    var descriptions = document.querySelectorAll('meta[name="description"]');
    var description = descriptions[0] || document.createElement("meta");
    description.name = "description";
    description.content = data.description;
    if (!description.parentNode) document.head.appendChild(description);
    Array.prototype.slice.call(descriptions, 1).forEach(function (item) { item.remove(); });

    var canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = "https://locacoestop.com.br" + (route === "/" ? "/" : route);
    if (!canonical.parentNode) document.head.appendChild(canonical);

    ["og:title", "og:description", "og:url"].forEach(function (property) {
      var meta = document.querySelector('meta[property="' + property + '"]');
      if (!meta) return;
      meta.content = property === "og:title" ? data.title : property === "og:description" ? data.description : canonical.href;
    });
  }

  function addRevealEffects() {
    var targets = document.querySelectorAll("main section:not(.home-hero), .product-card, .application-card");
    targets.forEach(function (target) { target.classList.add("cro-reveal"); });
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(function (target) { target.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    targets.forEach(function (target) { observer.observe(target); });
  }

  function enhance() {
    scheduled = false;
    enhancePromo();
    enhanceHeroTitle();
    enhanceCtas();
    addWhatsAppFloat();
    enhanceFormAsSecondary();
    optimizeHeroImage();
    standardizeContact();
    optimizeMetadata();
    addRevealEffects();
    document.body.classList.add("cro-v3-ready");
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(enhance);
  }

  routeConversions();
  stabilizeInternalNavigation();
  var root = document.querySelector("#root");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener("pageshow", schedule);
  window.addEventListener("popstate", schedule);
  schedule();
})();
