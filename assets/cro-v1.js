(function () {
  "use strict";

  var CRO_VERSION = "mobile-conversion-v1";
  var SUCCESS_WINDOW_MS = 30 * 60 * 1000;
  var OFFICIAL_WHATSAPP = "5516992631992";
  var OFFICIAL_WHATSAPP_DISPLAY = "(16) 99263-1992";
  var scheduled = false;
  var formVisibilityObserver = null;
  var formViewObserver = null;

  function pushEvent(eventName, details) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      Object.assign(
        {
          event: eventName,
          cro_version: CRO_VERSION,
          page_path: window.location.pathname,
        },
        details || {}
      )
    );
  }

  function scrollToElement(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getForm() {
    return document.querySelector("#product-form");
  }

  function clearPendingLead() {
    try {
      window.sessionStorage.removeItem("toploc_cro_lead_pending");
    } catch (error) {
      // A medição não pode interferir no formulário.
    }
  }

  function announce(message) {
    var region = document.querySelector("#cro-status");
    if (!region) {
      region = document.createElement("div");
      region.id = "cro-status";
      region.className = "cro-sr-only";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    region.textContent = "";
    window.setTimeout(function () {
      region.textContent = message;
    }, 30);
  }

  function setNativeSelectValue(select, value) {
    if (!select) return false;
    var optionExists = Array.prototype.some.call(select.options, function (option) {
      return option.value === value;
    });
    if (!optionExists) return false;

    var setter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      "value"
    ).set;
    setter.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function preselectProduct(productName, source, shouldScroll) {
    var formSection = getForm();
    var select = formSection && formSection.querySelector('select[name="product"]');
    if (!select || !setNativeSelectValue(select, productName)) return;

    pushEvent("cro_product_selected", {
      product_name: productName,
      interaction_source: source,
    });
    announce(productName + " selecionado. O formulário de orçamento está pronto.");

    if (shouldScroll !== false) {
      window.requestAnimationFrame(function () {
        scrollToElement(formSection);
      });
    }
  }

  function buildTrustStrip() {
    var section = document.createElement("section");
    section.className = "cro-trust";
    section.setAttribute("aria-label", "Confiança Top Locações");
    section.innerHTML =
      '<div class="container">' +
      '  <div class="cro-trust__grid">' +
      '    <div class="cro-trust__item"><strong class="cro-trust__number">8</strong><span class="cro-trust__label">anos de mercado</span></div>' +
      '    <div class="cro-trust__item"><strong class="cro-trust__number">+800</strong><span class="cro-trust__label">obras entregues</span></div>' +
      '    <div class="cro-trust__item"><span class="cro-trust__icon" aria-hidden="true">✓</span><span class="cro-trust__label">equipamentos revisados</span></div>' +
      "  </div>" +
      "</div>";
    return section;
  }

  function reorderHome() {
    var home = document.querySelector(".home");
    if (!home || home.dataset.croOrder === CRO_VERSION) return;
    // A ordem visual agora é definida no CSS antes da primeira pintura.
    // Mover seções depois do carregamento era a origem do CLS elevado.
    home.dataset.croOrder = CRO_VERSION;
    home.classList.add("home--cro-v1");
  }

  function bindAction(element, callback) {
    if (!element) return;
    element.addEventListener("click", callback);
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        callback();
      }
    });
  }

  function enhanceHero() {
    var hero = document.querySelector(".home-hero");
    if (!hero) return;

    var title = hero.querySelector(".home-hero__title");
    var primary = hero.querySelector(".home-hero__actions .btn-primary");
    var secondary = hero.querySelector(".home-hero__actions .btn-secondary");
    var imageContainer = hero.querySelector(".home-hero__image-container");

    if (title && !title.dataset.croTitleAction) title.dataset.croTitleAction = CRO_VERSION;

    if (primary && !primary.dataset.croEnhanced) {
      primary.dataset.croEnhanced = CRO_VERSION;
      primary.addEventListener("click", function () {
        pushEvent("cro_cta_click", { cta_location: "hero", cta_type: "primary" });
      });
    }

    if (secondary && !secondary.dataset.croEnhanced) {
      secondary.dataset.croEnhanced = CRO_VERSION;
      secondary.addEventListener("click", function () {
        pushEvent("cro_cta_click", { cta_location: "hero", cta_type: "secondary" });
      });
    }

    if (imageContainer && !imageContainer.dataset.croImageAction) {
      imageContainer.dataset.croImageAction = CRO_VERSION;
      imageContainer.classList.add("cro-hero-image-action");
      imageContainer.setAttribute("role", "button");
      imageContainer.setAttribute("tabindex", "0");
      imageContainer.setAttribute("aria-label", "Falar com a Top Locações no WhatsApp");
      imageContainer.addEventListener("click", function () {
        pushEvent("cro_cta_click", { cta_location: "hero_image", cta_type: "primary" });
      });
    }
  }

  function productNameFromCard(card) {
    var title = card.querySelector(".product-card__title");
    var text = title ? title.textContent.toLowerCase() : "";
    if (text.indexOf("elétrico") !== -1 || text.indexOf("eletrico") !== -1) {
      return "Balancim elétrico";
    }
    if (text.indexOf("manual") !== -1) return "Balancim manual";
    return null;
  }

  function enhanceProductCards() {
    document.querySelectorAll("#produtos .product-card").forEach(function (card) {
      if (card.dataset.croEnhanced === CRO_VERSION) return;

      var productName = productNameFromCard(card);
      var imageWrapper = card.querySelector(".product-card__image-wrapper");
      var footer = card.querySelector(".product-card__footer");
      var detailLink = footer && footer.querySelector("a");
      if (!productName || !imageWrapper || !footer || !detailLink) return;

      imageWrapper.dataset.croProductName = productName;
      detailLink.dataset.croProductName = productName;
      card.dataset.croEnhanced = CRO_VERSION;
    });
  }

  function enhanceForm() {
    var formSection = getForm();
    var form = formSection && formSection.querySelector("form");
    if (!form || form.dataset.croEnhanced === CRO_VERSION) return;

    var attributes = {
      name: { autocomplete: "name", enterkeyhint: "next" },
      email: { autocomplete: "email", inputmode: "email", enterkeyhint: "next" },
      whatsapp: { autocomplete: "tel", inputmode: "tel", enterkeyhint: "next" },
      city: { autocomplete: "address-level2", enterkeyhint: "next" },
    };

    Object.keys(attributes).forEach(function (fieldName) {
      var input = form.querySelector('[name="' + fieldName + '"]');
      if (!input) return;
      Object.keys(attributes[fieldName]).forEach(function (attribute) {
        input.setAttribute(attribute, attributes[fieldName][attribute]);
      });
    });

    var started = false;
    var completedFields = {};

    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      pushEvent("cro_form_start", { form_id: "product-form" });
    });

    form.addEventListener("change", function (event) {
      var field = event.target;
      var fieldName = field && field.name;
      if (!fieldName || !field.value || completedFields[fieldName]) return;
      completedFields[fieldName] = true;
      pushEvent("cro_form_field_completed", {
        form_id: "product-form",
        field_name: fieldName,
      });
    });

    form.addEventListener(
      "submit",
      function () {
        try {
          window.sessionStorage.setItem(
            "toploc_cro_lead_pending",
            JSON.stringify({ timestamp: Date.now(), sourcePath: window.location.pathname })
          );
        } catch (error) {
          // A medição não pode impedir o envio do formulário.
        }

        pushEvent("cro_form_submit_attempt", { form_id: "product-form" });

        window.setTimeout(function () {
          var validationErrors = form.querySelectorAll(
            ".product-form__field .product-form__error"
          ).length;
          if (validationErrors > 0) {
            clearPendingLead();
            pushEvent("cro_form_validation_error", {
              form_id: "product-form",
              error_count: validationErrors,
            });
          }
        }, 50);
      },
      true
    );

    var errorObserver = new MutationObserver(function () {
      var serverError = Array.prototype.find.call(
        form.querySelectorAll(":scope > .product-form__error"),
        function (element) {
          return element.textContent.trim().length > 0;
        }
      );
      if (serverError && !form.dataset.croServerErrorTracked) {
        form.dataset.croServerErrorTracked = "true";
        clearPendingLead();
        pushEvent("cro_form_submit_error", { form_id: "product-form" });
      }
    });
    errorObserver.observe(form, { childList: true, subtree: true });

    if (formViewObserver) formViewObserver.disconnect();
    formViewObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || form.dataset.croViewTracked) return;
          form.dataset.croViewTracked = "true";
          pushEvent("cro_form_view", { form_id: "product-form" });
          formViewObserver.disconnect();
        });
      },
      { threshold: 0.25 }
    );
    formViewObserver.observe(formSection);

    form.dataset.croEnhanced = CRO_VERSION;
  }

  function preselectProductFromRoute() {
    var form = getForm();
    if (!form || form.dataset.croRoutePreselected === window.location.pathname) return;

    var productName = null;
    if (window.location.pathname === "/balancim-eletrico") {
      productName = "Balancim elétrico";
    } else if (window.location.pathname === "/balancim-manual") {
      productName = "Balancim manual";
    }

    if (productName) {
      form.dataset.croRoutePreselected = window.location.pathname;
      preselectProduct(productName, "product_page", false);
    }
  }

  function addStickyCta() {
    var existing = document.querySelector(".cro-sticky-cta");
    if (existing) existing.remove();
    document.body.classList.remove("cro-has-sticky-cta");
    if (formVisibilityObserver) formVisibilityObserver.disconnect();
  }

  function standardizeWhatsAppNumber() {
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (link) {
      try {
        var url = new URL(link.href);
        if (url.hostname === "wa.me") {
          url.pathname = "/" + OFFICIAL_WHATSAPP;
          link.href = url.toString();
        }
      } catch (error) {
        // Um link inválido não deve interromper o restante da página.
      }

      link.setAttribute("aria-label", OFFICIAL_WHATSAPP_DISPLAY + " — WhatsApp da Top Locações");
    });
  }

  function enhanceThankYou() {
    return;
  }

  function trackConfirmedLead() {
    if (window.location.pathname !== "/obrigado") return;
    var pending = null;
    try {
      pending = JSON.parse(window.sessionStorage.getItem("toploc_cro_lead_pending") || "null");
    } catch (error) {
      pending = null;
    }
    if (!pending || Date.now() - pending.timestamp > SUCCESS_WINDOW_MS) return;

    pushEvent("cro_lead_submit_success", {
      form_id: "product-form",
      submission_source_path: pending.sourcePath,
    });
    clearPendingLead();
  }

  function enhance() {
    scheduled = false;
    standardizeWhatsAppNumber();
    trackConfirmedLead();
    enhanceThankYou();
    if (window.location.pathname === "/") {
      reorderHome();
      enhanceHero();
      enhanceProductCards();
    }
    enhanceForm();
    preselectProductFromRoute();
    addStickyCta();
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(enhance);
  }

  ["pushState", "replaceState"].forEach(function (methodName) {
    var original = window.history[methodName];
    window.history[methodName] = function () {
      var result = original.apply(this, arguments);
      scheduleEnhance();
      return result;
    };
  });

  window.addEventListener("popstate", scheduleEnhance);
  window.addEventListener("pageshow", scheduleEnhance);

  var root = document.querySelector("#root");
  if (root) {
    new MutationObserver(scheduleEnhance).observe(root, {
      childList: true,
      subtree: true,
    });
  }

  scheduleEnhance();
})();
