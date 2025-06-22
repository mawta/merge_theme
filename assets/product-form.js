if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector('cart-notification') ||
          document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');

        if (document.querySelector('cart-drawer'))
          this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading-overlay__spinner').classList.remove(
          'hidden',
        );

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id),
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage =
                this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButton.querySelector('span').classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true },
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty'))
              this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading-overlay__spinner').classList.add(
              'hidden',
            );
          });
      }

      handleErrorMessage(errorMessage = false) {
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            '.product-form__error-message',
          );

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    },
  );
}

/* page product */
var btnConvertSizeCM = document.querySelectorAll(".btn-size-chart.cm");
var btnConvertSizeIN = document.querySelectorAll(".btn-size-chart.in");

btnConvertSizeCM.forEach(function (btn) {
  btn.addEventListener("click", function () {
    if (btn.classList.contains("is-active")) return;
    handleSizeChartCm()
  });
});

function handleSizeChartCm() {
  btnConvertSizeCM.forEach(function (btn) {
    btn.classList.add("is-active");
  });
  document.querySelectorAll(".data-size-chart").forEach(function (element) {
    let oldValue = element.getAttribute("old-value");
    if (!oldValue) {
      oldValue = parseFloat((element.textContent).replace("in", "").replace("cm", ""));
      element.setAttribute("old-value", oldValue);
    }

    element.textContent = `${(oldValue * 2.54).toFixed(2)} cm`;
  });

  btnConvertSizeIN.forEach(function (btn) {
    btn.classList.remove("is-active");
  });
}

btnConvertSizeIN.forEach(function (btn) {
  btn.addEventListener("click", function () {
    if (btn.classList.contains("is-active")) return;
    handleSizeChartIn()
  });
});

function handleSizeChartIn() {
  btnConvertSizeIN.forEach(function (btn) {
    btn.classList.add("is-active");
  });
  document.querySelectorAll(".data-size-chart").forEach(function (element) {
    let oldValue = element.getAttribute("old-value");
    if (!oldValue) {
      oldValue = parseFloat((element.textContent).replace("in", "").replace("cm", ""));
      element.setAttribute("old-value", oldValue);
      element.textContent = `${(oldValue / 2.54).toFixed(2)} in`;
    }

    element.textContent = `${oldValue} in`;
  });

  btnConvertSizeCM.forEach(function (btn) {
    btn.classList.remove("is-active");
  });
}

$("#preview-close, #preview-overlay").on("click", function (e) {
  if (
    window.innerWidth < 992 &&
    $(".cl-canvas-container").children(".canvas-wrapper").length <= 0
  ) {
    $(".cl-canvas-container").prepend($canvasWrapper);
  }
  e.preventDefault();
  $("#preview-container").toggleClass("hidden");
});


function check_valid() {
  $("form #customily-options .swatch-container").each(
    function () {
      var $checked = $(this).find('input[type="radio"]:checked');
      if ($checked.length) {
        $(this)
          .closest(".customily_option")
          .removeClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .hide();
      } else {
        $(this)
          .closest(".customily_option")
          .addClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .show();
      }
    }
  );

  $("form #customily-options select").each(function () {
    if ($(this).val()) {
      $(this)
        .closest(".customily_option")
        .removeClass("customily-required-error");
      $(this)
        .closest(".customily_option")
        .find(".customily-required-label span")
        .hide();
    } else {
      $(this).closest(".customily_option").addClass("customily-required-error");
      $(this)
        .closest(".customily_option")
        .find(".customily-required-label span")
        .show();
    }
  });

  $('form #customily-options input[type="text"]').each(
    function () {
      if ($(this).val().length) {
        $(this)
          .closest(".customily_option")
          .removeClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .hide();
      } else {
        $(this)
          .closest(".customily_option")
          .addClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .show();
      }
    }
  );

  $("form #customily-options .customily-file-input").each(
    function () {
      var $checked = $(this).find(".cl_remove-image").is(":visible");
      if ($checked) {
        $(this)
          .closest(".customily_option")
          .removeClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .hide();
      } else {
        $(this)
          .closest(".customily_option")
          .addClass("customily-required-error");
        $(this)
          .closest(".customily_option")
          .find(".customily-required-label span")
          .show();
      }
    }
  );
}
$("#btn-preview, #btn-preview-desktop").on("click", function (e) {
  e.preventDefault();
  check_valid();
  if ($(".customily_option").hasClass("customily-required-error")) {
    // alert(
    //   "Please check your design once again. Some required options have been left empty, unselected, or wrongly filled."
    // );
    $("#preview-container").hide();
    $(".customily-required-error input").first().focus();
    $(".customily-required-error")[0].scrollIntoView();
    $(".customily-required-error select").first().focus();
    return;
  }
  if (window.innerWidth < 992) {
    $canvasWrapper = $(".canvas-wrapper");
    $(".preview-image-wrap").html($canvasWrapper);
  } else {
    const canvas = document.getElementById("preview-canvas");
    const dataURL = canvas.toDataURL();
    $("#preview-img").attr("src", dataURL);
  }

  $("#preview-container").removeClass("hidden");
  $("#preview-container").show();
});

function getCookieGlobal(key) {
  var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
  return keyValue
    ? keyValue[2]
    : null;
}
// if (getCookieGlobal('localization')) {
//   document.querySelectorAll(".shipping-country").forEach(function (element) {
//     element.innerText = getCookieGlobal('localization');
//   })
// }

const classClosePhoto = [".closed-photo-image", ".upload_image_guidelines", ".closed-bg-photo"]
classClosePhoto.forEach(function (nameClass) {
  var element = document.querySelector(nameClass);
  if (element) {
    element.addEventListener("click", function () {
      document.querySelector(".modal-custom-image").classList.toggle("hidden");
      document.querySelector(".closed-bg-photo").classList.toggle("hidden");
    });
  }
});

const classPhotoGift = [".photo-gift", ".closed-photo-gift", ".closed-bg-photo-gift"]
classPhotoGift.forEach(function (nameClass) {
  var element = document.querySelector(nameClass);
  if (element) {
    element.addEventListener("click", function () {
      document.querySelector(".modal-photo-gift").classList.toggle("hidden");
      document.querySelector(".closed-bg-photo-gift").classList.toggle("hidden");
    });
  }
});

$(document).on("click", "body", function (e) {
  if (
    e.target.closest(".customily-file-input") &&
    document.querySelectorAll(".cl_remove-image").length
  )
    callLoop(e.target.closest(".customily-file-input"));
});

function callLoop(selector) {
  if (!selector) return;
  let buttonRemove = selector.querySelector(".cl_remove-image");

  buttonRemove.style.display == "none"
    ? selector.classList.remove("arnLabel-show")
    : selector.classList.add("arnLabel-show");

  setTimeout(() => {
    callLoop(selector);
  }, 1000);
}
$(function () {
  if ($("#customily-options:not([style*='display: none;'])").length) {
    const timerRemoveLoadingPreview = setInterval(function () {
      if (
        $(
          "#customily-options:not([style*='display: none;']) ~.product-form__buttons #customily-cart-btn:not(.running)"
        ).length
      ) {
        $("#btn-preview-desktop").removeClass("ld-custom");
        $("#btn-preview").removeClass("ld-custom");
        clearInterval(timerRemoveLoadingPreview);
      }
    }, 100);
  }

  var btnBuy = $("#preview-container button[type='submit']");
  btnBuy.on("click", function () {
    $(this).addClass("ld-over-inverse running");
    $(this).append("<div class='ld ld-cycle ld-ring'></div>");
  });
});
$("#js-save-properties-product-preview").on("click", function (e) {
  $("#customily-cart-btn-preview").addClass("ld-custom")
  $("#customily-cart-btn").trigger("click");
});
/* end page product */

$(document).ready(function () {
  if ($(window).width() < 798) {
    $(".date-time-new").on("click", function () {
      $(".new-shipping ~.modal-shipping .wt-grid").toggleClass("box-hover-shipping");
    });

    $(document).click(function(e) {
      var container = $(".date-time-new");
    
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".new-shipping ~.modal-shipping .wt-grid").addClass("box-hover-shipping");
      }
    });

  } else {
    $(".date-time-new").hover(
      function () {
        $(".new-shipping ~.modal-shipping .wt-grid").toggleClass("box-hover-shipping");
      },
      function () {
        $(".new-shipping ~.modal-shipping .wt-grid").toggleClass("box-hover-shipping");
      }
    );
  }

});


document.querySelector(".product-media-modal").addEventListener('click', function (event) {
  const element = event.target;
  const children = document.querySelector('.product-media-modal__content.color-background-1.gradient');

  const isOpen = document.querySelector(".product-media-modal[open]")

  if (isOpen) {
    if (!children.contains(element)) {
      document.querySelector(".product-media-modal__toggle").click();
    }
  }

});


const keySaveProperties = "add-to-cart";
function setLocalStorageItem(key, value, ttl) {
  if (!key) {
    return;
  }
  const now = new Date();
  const item = {
    value,
    expiry: ttl ? now.getTime() + ttl * 3600000 : null,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getLocalStorageItem(key) {
  if (!key) {
    return;
  }
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

const dataPropertiesCache = getLocalStorageItem(keySaveProperties);
const productId = $(".product_form.init").attr("data-product-id");
// handle addToCart
function addToCart() {
  const urlCurrent = window.location.href;

  if (
    urlCurrent.includes("fri13062202vupg") ||
    urlCurrent.includes("dog09062202nght") ||
    urlCurrent.includes("matching-shirts")
  ) {
    return;
  }
  const getFieldsForm = $("form[action='/cart/add']").serializeArray();

  var urlCustomization;
  getFieldsForm.forEach((field) => {
    
    if (field.name === "properties[_customily-customization-url]") {
      urlCustomization = field.value;
    }
  });

  if (!urlCustomization) {
    return;
  }

  const variantID = new URL(urlCustomization).searchParams.get("variant");
  const item = {
    variantID,
    productId,
    urlCustomization,
  };

  if (dataPropertiesCache) {
    const indexProductAdd = dataPropertiesCache.findIndex(
      (item) => item.productId === productId
    );
    if (indexProductAdd !== -1) {
      dataPropertiesCache.splice(indexProductAdd, 1, item);
    } else {
      dataPropertiesCache.push(item);
    }
    setLocalStorageItem(keySaveProperties, dataPropertiesCache, 2);
  } else {
    const initListAddToCart = [item];
    setLocalStorageItem(keySaveProperties, initListAddToCart, 2);
  }
}

function syncLoaddingAddToCart() {
  const timerLoading = setInterval(() => {
    if (
      $("#customily-cart-btn").hasClass("disable-pointer-events") ||
      $("#customily-cart-btn").attr("disabled")
    ) {
      $("#customily-cart-btn-preview").addClass("ld-custom");
    } else {
      $("#customily-cart-btn-preview").removeClass("ld-custom");
      clearInterval(timerLoading);
    }
  }, 100);
}

const waitUntilElementExists = (option, selector, callback) => {
  const el = document.querySelector(selector);

  if (el) {
    return callback(option, selector);
  }
  setTimeout(function () {
    waitUntilElementExists(option, selector, callback);
  }, 200);
};
function FillDataOptionCustomily(option, selector) {
  const el = document.querySelector(selector);
  if (option.type === "Dropdown") {
    el.value = option.value;
    el.dispatchEvent(new Event("change"));
  } else if (option.type === "Swatch") {
    const els = document.querySelectorAll(selector);
    for (const i of els) {
      if (i.value === option.value) {
        i.checked = true;
        i.dispatchEvent(new Event("change"));
        return;
      }
    }
  } else if (option.type === "Text Input") {
    el.value = option.value;
    const eventOnChange = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(eventOnChange);
    return;
  } else if (option.type === "Checkbox") {
    if (option.value === "true") {
      el.checked = true;
      el.dispatchEvent(new Event("change"));
    }
  }
}
function setCheckedInput(indexItem, arrVariant) {
  var divStyle = $(`[data-option-index="${indexItem}"] input`);
  var dataVariant = arrVariant[indexItem];
  divStyle.each(function () {
    if ($(this).val() == dataVariant.trim()) {
      $(this).attr("checked", true);
      $(this).prop("checked", true);
      var swatchElement = $(this).next();
      var swatchValue = swatchElement.data("value").toString();
      $(swatchElement)
        .siblings('input[value="' + swatchValue.replace(/\"/g, '\\"') + '"]')
        .prop("checked", true)
        .trigger("change");
      var JSONData = $(swatchElement).parents(".product_form").data("product");
      var productSection = ".product-" + productId + " .js-product_section";
      var swatchOptions = $(swatchElement)
        .parents(".product_form")
        .find(".swatch_options .swatch");
      if (swatchOptions.length > 1) {
        Shopify.linkOptionSelectors(JSONData, productSection);
      }
    } else {
      $(this).removeAttr("checked", true);
      $(this).prop("checked", false);
    }
  });
}
function getShareCustomily() {
  var cacheProductCurrent = dataPropertiesCache.find(function (element) {
    return element.productId === productId;
  });
  const { urlCustomization, variantID } = cacheProductCurrent;

  var optionSelected;
  $(".multi_select option").each(function () {
    if ($(this).val() == variantID) {
      $(this).attr("selected", "selected");
      $(this).prop("selected", "selected");
      optionSelected = $(this).text();
    }
  });
  if (optionSelected) {
    var arrVariant = optionSelected.split("/");
    setCheckedInput(0, arrVariant);
    setCheckedInput(1, arrVariant);
    setCheckedInput(2, arrVariant);
  }
  if (urlCustomization) {
    const urlParams = new URLSearchParams(urlCustomization);
    var customizationId = urlParams.get("customizationId");
    if (!customizationId) {
      const indexCut = urlCustomization.lastIndexOf("=");
      customizationId = urlCustomization.slice(
        indexCut + 1,
        urlCustomization.length
      );
    }
    if (window.engraver && window.engraver.getSharedCustomization) {
      window.engraver
        .getSharedCustomization(customizationId)
        .then(async (res) => {
          const { CustomizationData } = res;
          const customizationData = JSON.parse(CustomizationData);
          const { options } = customizationData;
          for (const option of options) {
            const { sortId, type } = option;
            const sortIdDom = `[sort-id="${sortId}"]`;
            var checkVisuallyHiddenElement = document.querySelector(sortIdDom);
            if (checkVisuallyHiddenElement?.attributes["visually-hidden"]) {
              continue;
            }

            var tagName;
            if (
              type === "Swatch" ||
              type === "Checkbox" ||
              type === "Text Input"
            ) {
              tagName = "input";
            }
            if (type === "Dropdown") {
              tagName = "select";
            }

            if (!tagName) {
              continue;
            }
            const el = sortIdDom + " " + tagName;
            waitUntilElementExists(option, el, FillDataOptionCustomily);
          }
        });
    }
  }
}

$(window).on("load", function () {
  const isProductDetailPage = document.querySelector(
    ".product__info-wrapper.grid__item"
  );

  if (!isProductDetailPage) {
    return;
  }

  const urlCurrent = window.location.href;

  if (
    urlCurrent.includes("fri13062202vupg") ||
    urlCurrent.includes("dog09062202nght") ||
    urlCurrent.includes("matching-shirts")
  ) {
    return;
  }

  //  filter product current in cache
  if (dataPropertiesCache) {
    var cacheProductCurrent = dataPropertiesCache.find(function (element) {
      return element.productId === productId;
    });
  }

  if (!cacheProductCurrent) {
    return;
  }

  if($(".notification-shipping").hasClass('hidden')){
    // modalConfirm("getShareCustomily");
  }
 
});
function closeModalConfirm() {
  $("#wrapper-modal-confirm").removeClass("is-open");
}

$(".handle-cancel-confirm-modal, .overlay-modal-confirm,.btn-closed-reorder").on(
  "click",
  function () {
    $("#js-btn-customzize").click();
    closeModalConfirm();
  }
);
$(".handle-ok-confirm-modal").on("click", function () {
  var redirect = $(this).attr("redirect");
  if (redirect == "getShareCustomily") {
    getShareCustomily();
  } else {
    handleConfirmRemoveCart(redirect);
  }
  closeModalConfirm();
});

function initOpenModal() {
  $("#wrapper-modal-confirm").addClass("is-open");
}

function modalConfirm(redirect) {
  initOpenModal();

  $(".handle-ok-confirm-modal").attr("redirect", redirect);
}
var getThisElementHandle; // class name element btn trigger modal
function handleConfirmRemoveCart(redirect) {
  const cartItem = {
    lineID: $(getThisElementHandle).parents("[data-cart-item]").data("line-id"),
    quantity: 0,
    $element: $(getThisElementHandle).parents("[data-cart-item]"),
  };

  cartItem.$element.addClass("animated fadeOutLeft");

  updateCartItem(cartItem, redirect);
}
