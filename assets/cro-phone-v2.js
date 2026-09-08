(function () {
  "use strict";

  var CRO_VERSION = "mobile-conversion-v1";
  var PHONE_ERROR_ID = "cro-whatsapp-error";
  var PHONE_ERROR_TEXT = "Informe um WhatsApp válido com DDD.";
  var scheduled = false;

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

  function getFormSection() {
    return document.querySelector("#product-form");
  }

  function getForm() {
    var section = getFormSection();
    return section && section.querySelector("form");
  }

  function scrollToForm() {
    var section = getFormSection();
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindFormPath(element, details, ariaLabel) {
    if (!element || element.dataset.croFormPath === CRO_VERSION) return;

    element.dataset.croFormPath = CRO_VERSION;
    element.classList.add("cro-hero-inline-action");
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", ariaLabel || "Ir para o formulário de orçamento");

    function activate() {
      pushEvent("cro_cta_click", details);
      scrollToForm();
    }

    element.addEventListener("click", activate);
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  }

  function benefitNameFromText(text) {
    var normalized = String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (normalized.indexOf("entrega rapida") !== -1) return "entrega_rapida";
    if (normalized.indexOf("whatsapp") !== -1) return "atendimento_whatsapp";
    if (normalized.indexOf("sem compromisso") !== -1) return "orcamento_sem_compromisso";
    return "outro_beneficio";
  }

  function enhanceHeroPaths() {
    if (window.location.pathname !== "/") return;

    var hero = document.querySelector(".home-hero");
    if (!hero) return;

    bindFormPath(
      hero.querySelector(".home-hero__subtitle"),
      { cta_location: "hero_subtitle", cta_type: "text" },
      "Ir para o formulário de orçamento pela descrição da locação"
    );

    hero.querySelectorAll(".home-hero__microbenefit").forEach(function (item) {
      var benefitName = benefitNameFromText(item.textContent);
      bindFormPath(
        item,
        {
          cta_location: "hero_microbenefit",
          cta_type: "benefit",
          benefit_name: benefitName,
        },
        "Ir para o formulário de orçamento"
      );
    });
  }

  function normalizeBrazilPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");

    // Autofill pode entregar +55/55. Remova o DDI antes de limitar a 11 dígitos.
    if (digits.length > 11 && digits.indexOf("55") === 0) {
      digits = digits.slice(2);
    }

    return digits.slice(0, 11);
  }

  function formatBrazilPhone(value) {
    var digits = normalizeBrazilPhone(value);

    if (!digits) return "";
    if (digits.length <= 2) return "(" + digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10) {
      return (
        "(" +
        digits.slice(0, 2) +
        ") " +
        digits.slice(2, 6) +
        "-" +
        digits.slice(6)
      );
    }

    return (
      "(" +
      digits.slice(0, 2) +
      ") " +
      digits.slice(2, 7) +
      "-" +
      digits.slice(7)
    );
  }

  function isValidBrazilMobile(value) {
    var digits = normalizeBrazilPhone(value);
    return /^[1-9]\d9\d{8}$/.test(digits);
  }

  function setNativeInputValue(input, value, dispatchInput) {
    if (!input) return false;
    if (input.value === value) return false;

    var descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    );

    if (!descriptor || !descriptor.set) return false;

    descriptor.set.call(input, value);

    if (dispatchInput) {
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    return true;
  }

  function getPhoneField(input) {
    return input && input.closest(".product-form__field");
  }

  function clearPhoneError(input) {
    var field = getPhoneField(input);
    if (!field) return;

    field.classList.remove("cro-phone-field--invalid");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");

    var error = field.querySelector(".cro-phone-error");
    if (error) error.remove();
  }

  function showPhoneError(input) {
    var field = getPhoneField(input);
    if (!field) return;

    field.classList.add("cro-phone-field--invalid");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", PHONE_ERROR_ID);

    var error = field.querySelector(".cro-phone-error");
    if (!error) {
      error = document.createElement("p");
      error.id = PHONE_ERROR_ID;
      error.className = "product-form__error cro-phone-error";
      field.appendChild(error);
    }
    error.textContent = PHONE_ERROR_TEXT;
  }

  function syncPhoneInput(input, dispatchInput) {
    if (!input) return false;

    var formatted = formatBrazilPhone(input.value);
    var changed = setNativeInputValue(input, formatted, dispatchInput);

    if (isValidBrazilMobile(formatted)) {
      clearPhoneError(input);
    }

    return changed;
  }

  function ensureCountrySelector(input) {
    var field = getPhoneField(input);
    if (!field) return;

    field.classList.add("cro-phone-field");
    input.classList.add("cro-phone-input");

    var selector = field.querySelector(".cro-phone-country");
    if (!selector) {
      selector = document.createElement("select");
      selector.className = "cro-phone-country";
      selector.setAttribute("aria-label", "País e código telefônico");
      selector.setAttribute("title", "Brasil (+55)");

      var option = document.createElement("option");
      option.value = "+55";
      option.textContent = "Brasil +55";
      option.selected = true;
      selector.appendChild(option);

      field.insertBefore(selector, input);
    }
  }

  function trackInvalidPhoneOnce(input, source) {
    if (input.dataset.croPhoneInvalidTracked === "true") return;
    input.dataset.croPhoneInvalidTracked = "true";
    pushEvent("cro_form_validation_error", {
      form_id: "product-form",
      field_name: "whatsapp",
      error_type: "invalid_phone",
      validation_source: source,
    });
  }

  function enhancePhoneField() {
    var form = getForm();
    if (!form) return;

    var input = form.querySelector('input[name="whatsapp"]');
    if (!input) return;

    ensureCountrySelector(input);

    input.setAttribute("autocomplete", "tel-national");
    input.setAttribute("inputmode", "tel");
    input.setAttribute("enterkeyhint", "next");
    input.setAttribute("aria-label", "WhatsApp com DDD");
    input.removeAttribute("maxlength");

    if (input.dataset.croPhoneEnhanced !== CRO_VERSION) {
      input.dataset.croPhoneEnhanced = CRO_VERSION;

      // Capture ocorre antes do onChange delegado do React.
      // Assim +55 é removido ANTES do bundle original aplicar slice(0, 11).
      input.addEventListener(
        "input",
        function () {
          input.dataset.croPhoneInvalidTracked = "false";
          syncPhoneInput(input, false);
        },
        true
      );

      input.addEventListener(
        "change",
        function () {
          syncPhoneInput(input, true);
          if (input.value && !isValidBrazilMobile(input.value)) {
            showPhoneError(input);
          }
        },
        true
      );

      input.addEventListener("blur", function () {
        syncPhoneInput(input, true);
        if (input.value && !isValidBrazilMobile(input.value)) {
          showPhoneError(input);
        } else if (isValidBrazilMobile(input.value)) {
          clearPhoneError(input);
        }
      });

      input.addEventListener("focus", function () {
        window.setTimeout(function () {
          syncPhoneInput(input, true);
        }, 80);
        window.setTimeout(function () {
          syncPhoneInput(input, true);
        }, 350);
      });

      input.addEventListener("invalid", function (event) {
        event.preventDefault();
        showPhoneError(input);
        trackInvalidPhoneOnce(input, "native_required");
        input.focus({ preventScroll: true });
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    if (form.dataset.croPhoneGuard !== CRO_VERSION) {
      form.dataset.croPhoneGuard = CRO_VERSION;

      // Registrar antes do submit CRO original. Em telefone inválido, interrompe
      // o evento antes do React/Firebase e antes da conversão pendente.
      form.addEventListener(
        "submit",
        function (event) {
          var currentInput = form.querySelector('input[name="whatsapp"]');
          if (!currentInput) return;

          var changed = syncPhoneInput(currentInput, true);
          var valid = isValidBrazilMobile(currentInput.value);

          if (!valid) {
            event.preventDefault();
            event.stopImmediatePropagation();

            try {
              window.sessionStorage.removeItem("toploc_cro_lead_pending");
            } catch (error) {
              // Nunca interromper UX por falha de storage.
            }

            showPhoneError(currentInput);
            trackInvalidPhoneOnce(currentInput, "submit");
            currentInput.focus({ preventScroll: true });
            currentInput.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }

          clearPhoneError(currentInput);

          // Se o submit revelou um autofill ainda não sincronizado com o React,
          // aguarde o evento input atualizar o state e submeta novamente.
          if (changed) {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.setTimeout(function () {
              if (form.isConnected) form.requestSubmit();
            }, 0);
          }
        },
        true
      );
    }

    // Cobertura para autofill que atualiza DOM sem disparar input imediatamente.
    window.setTimeout(function () {
      if (input.isConnected) syncPhoneInput(input, true);
    }, 150);
    window.setTimeout(function () {
      if (input.isConnected) syncPhoneInput(input, true);
    }, 700);
  }

  function sanitizeThankYouWhatsAppTracking() {
    if (window.location.pathname !== "/obrigado") return;

    var link = document.querySelector(".cro-whatsapp-cta");
    if (!link || link.dataset.croPrivacySanitized === CRO_VERSION) return;

    // Clonar remove o listener antigo que enviava o número no dataLayer.
    var clone = link.cloneNode(true);
    clone.dataset.croPrivacySanitized = CRO_VERSION;
    clone.addEventListener("click", function () {
      pushEvent("cro_whatsapp_click", {
        cta_location: "thank_you",
      });
    });
    link.replaceWith(clone);
  }

  // Proteção temporária: se o CTA for clicado no intervalo entre a criação pelo
  // cro-v1.js e a sanitização, bloqueie o listener antigo sem impedir o link.
  document.addEventListener(
    "click",
    function (event) {
      var target = event.target && event.target.closest
        ? event.target.closest(".cro-whatsapp-cta")
        : null;

      if (!target || target.dataset.croPrivacySanitized === CRO_VERSION) return;

      pushEvent("cro_whatsapp_click", {
        cta_location: "thank_you",
      });
      event.stopImmediatePropagation();
    },
    true
  );

  function enhance() {
    scheduled = false;
    enhanceHeroPaths();
    enhancePhoneField();
    sanitizeThankYouWhatsAppTracking();
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(enhance);
  }

  window.addEventListener("pageshow", scheduleEnhance);
  window.addEventListener("popstate", scheduleEnhance);

  var root = document.querySelector("#root");
  if (root) {
    new MutationObserver(scheduleEnhance).observe(root, {
      childList: true,
      subtree: true,
    });
  }

  scheduleEnhance();
})();
