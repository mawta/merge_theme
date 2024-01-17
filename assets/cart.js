function getCookieByCart(key) {
  var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
  return keyValue ? keyValue[2] : null;
}
class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems =
        this.closest("cart-items") || this.closest("cart-drawer-items");
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status") ||
      document.getElementById("CartDrawer-LineItemStatus");

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);
    this.addEventListener("change", debouncedOnChange.bind(this));
    this.getImagePreview();
    //this.loadAllThumbnailImage();
    document.querySelector(".icon-closed").addEventListener("click", (e) => {
      e.preventDefault();
      this.handleCloseModal();
    });
    document
      .querySelector(".overlay-modal-preview")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCloseModal();
      });
  }

  handleOpenModalClick = (imgKey) => {
    const modalImg = document.querySelector(
      ".wrapper-modal-preview .preview-img-modal .so-featured-image"
    );
    //modalImg.classList.add("image-loading");
    modalImg.style.display = "none";

    const imgEl = document.querySelector(`div[data-key="${imgKey}"] img`);

    //   if (!urlImg) {
    //     urlImg = $(this).find("img").attr("data-backup-src");
    //   }
    //   if (!urlImg) {
    //     urlImg = $(this).find("img").attr("src");
    //   }
    const imageItem = tfxCart.items.find((item) => item.key === imgKey);
    var imgSrc = imageItem.properties["_customily-preview"];
    const thumId = imageItem.properties["_customily-thumb-id"];
    if (!imgSrc && imgEl.preview) {
      imgSrc = imgEl.preview.src;
    } else if (!imgSrc) {
      imgSrc = imgEl.dataset.backupSrc;
    }
    if (imgSrc && imgSrc.includes("cdn.medzt.com")) {
      modalImg.src = imgSrc;
    } else if (modalImg.dataset.key != imgKey) {
      imgSrc += "?" + new Date().getTime();
      //modalImg.classList.add("image-loading");
      modalImg.addEventListener("load", function () {
        modalImg.dataset.key = imgKey;
        //modalImg.classList.remove("image-loading");
      });
      modalImg.addEventListener("error", function () {
        modalImg.onerror = null;
        setTimeout(function () {
          modalImg.src = imgEl.src;
        }, 500);
      });
      modalImg.src = imgSrc;
    } else {
      modalImg.src = imgSrc;
    }

    const modalItem = document.querySelector(".wrapper-modal-preview");
    modalItem.classList.toggle("is-open");
    // modalImg.classList.remove("image-loading");
    modalImg.style.display = "block";
  };

  handleCloseModal = () => {
    const modalItem = document.querySelector(".wrapper-modal-preview");
    modalItem.classList.toggle("is-open");
  };

  getImagePreview() {
    const allCartItemImages = document.querySelectorAll(".cart-item__media");

    const allCartItemTrigger = Array.from(
      document.querySelectorAll(".trigger-design")
    );

    /*allCartItemTrigger.forEach((element) => {
      const src = element.src;
      const key = element.getAttribute("data-key");
      var listenerPaste = element.hasOwnProperty("isEvent");
      if (!listenerPaste) {
        element.addEventListener("click", () =>
          this.handleOpenModalClick(key, src)
        );
        element.isEvent = true;
      }
    });*/

    allCartItemImages.forEach((element) => {
      const imgTag = element.querySelector("img");
      const src = element.src;
      const key = element.getAttribute("data-key");
      var listenerPaste = element.hasOwnProperty("isEvent");
      if (!listenerPaste) {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          this.handleOpenModalClick(key);
        });
        element.isEvent = true;
      }
    });
  }
  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "cart-items") {
          return;
        }
        this.onCartUpdate();
      }
    );
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name"),
      event.target.dataset.quantityVariantId
    );
  }

  onCartUpdate() {
    if (this.tagName === "CART-DRAWER-ITEMS") {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const selectors = ["cart-drawer-items", ".cart-drawer__footer"];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const sourceQty = html.querySelector("cart-items");
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents-right",
      },
    ];
  }
  loadAllThumbnailImage() {
    var allCartItemImg = document.querySelectorAll(
      ".cart-item__media .cart-item__image-container img"
    );
    allCartItemImg.forEach((element) => {
      element.addEventListener("load", function () {
        console.log("that preview was loaded");
      });
      element.addEventListener("error", function () {
        element.onerror = null;
        const parrent = element.closest(".cart-item__media");
        const key = parrent.getAttribute("data-key");
        const cartItem = tfxCart.items.find((item) => item.key === key);
        var properties = cartItem.properties;
        var thumbImageId = properties.find(
          (p) => p[0] == "_customily-thumb-id"
        );
        var thumbImage = properties.find((p) => p[0] == "_customily-thumb");
        if (thumbImageId && thumbImageId[1]) {
          var id = thumbImageId[1].split("_thumb-id-")[1];
          var data = localStorage.getItem("customily-shopify-thumbs-" + id);
          if (data && Date.now() - data.timestamp < 2592e6) {
            var base64 = JSON.parse(data).image;
            setTimeout(function () {
              element.src = base64;
            }, 1000);
          }
        } else if (thumbImage && thumbImage[1]) {
          element.src = thumbImage[1];
        }
      });
    });
  }
  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const totalItem = parsedState.item_count;
        if (totalItem == 0) {
          document
            .querySelector(".itemCart.page-count")
            .classList.add("hidden");
          document.querySelector(".cart-countdown").classList.add("hidden");
        } else {
          const isMany = totalItem > 1 ? true : false;
          let totalItemCart = "";
          if (isMany) {
            totalItemCart = `${totalItem} Items in your cart`;
          } else {
            totalItemCart = `${totalItem} Item in your cart`;
          }

          document.querySelector(".itemCart.page-count").innerText =
            totalItemCart;
        }
        const quantityElement =
          document.getElementById(`Quantity-${line}`) ||
          document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll(".cart-item");

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute("value");
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle("is-empty", parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector("cart-drawer");
        const cartFooter = document.getElementById("main-cart-footer");

        if (cartFooter)
          cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
        if (cartDrawerWrapper)
          cartDrawerWrapper.classList.toggle(
            "is-empty",
            parsedState.item_count === 0
          );

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document
              .getElementById(section.id)
              .querySelector(section.selector) ||
            document.getElementById(section.id);
          var newHtml = this.getSectionHTML(
            parsedState.sections[section.section],
            section.selector
          );

          if (
            quantity > 0 &&
            elementToReplace.classList.contains("js-contents")
          ) {
            var contentOld =
              elementToReplace.querySelectorAll(".cart-item-content");

            var contentNew = newHtml.querySelectorAll(".cart-item-content");
            contentOld.forEach(function (element, index) {
              element.innerHTML = contentNew[index].innerHTML;
            });
          } else {
            elementToReplace.innerHTML = newHtml.innerHTML;
            //
            this.getImagePreview();
          }
        });

        const updatedValue = parsedState.items[line - 1]
          ? parsedState.items[line - 1].quantity
          : undefined;
        let message = "";
        if (
          items.length === parsedState.items.length &&
          updatedValue !== parseInt(quantityElement.value)
        ) {
          if (typeof updatedValue === "undefined") {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace(
              "[quantity]",
              updatedValue
            );
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) ||
          document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(
                cartDrawerWrapper,
                lineItem.querySelector(`[name="${name}"]`)
              )
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper.querySelector(".drawer__inner-empty"),
            cartDrawerWrapper.querySelector("a")
          );
        } else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper,
            document.querySelector(".cart-item__name")
          );
        }

        const currency = getCookieByCart("currency");
        if (Currency && currency) {
          Currency.convertAll(
            "USD",
            currency,
            ".money",
            "money_with_currency_format"
          );
        }

        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: "cart-items",
          cartData: parsedState,
          variantId: variantId,
        });
      })
      .catch(() => {
        this.querySelectorAll(".loading-overlay").forEach((overlay) =>
          overlay.classList.add("hidden")
        );
        const errors =
          document.getElementById("cart-errors") ||
          document.getElementById("CartDrawer-CartErrors");
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) ||
      document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError)
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  enableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.add("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading-overlay`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading-overlay`
    );
    const totalItemElements = document.querySelectorAll('.js-contents-right .loading-overlay');
  

    [...cartItemElements, ...cartDrawerItemElements,...totalItemElements].forEach((overlay) =>
      overlay.classList.remove("hidden")
    );

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.remove("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading-overlay`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading-overlay`
    );
    const totalItemElements = document.querySelectorAll(
      `.js-contents-right .loading-overlay`
    );

    cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
    cartDrawerItemElements.forEach((overlay) =>
      overlay.classList.add("hidden")
    );
    totalItemElements.forEach((overlay) =>
      overlay.classList.add("hidden")
    );
  }
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          "change",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, {
              ...fetchConfig(),
              ...{ body },
            });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

function initCartCountdown(duration, element) {
  let timer = duration,
    minutes,
    seconds;

  const interval = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    element.find("b").html(`${minutes}:${seconds} minutes`);

    if (--timer < 0) {
      timer = duration;
      clearInterval(interval);
      element
        .find("p")
        .html(
          "Forgot one final step? Place your order now and make the payment right away!"
        );
    }
  }, 1000);
}

$(document).ready(function () {
  const tenMinutes = 60 * 10;
  const $cartCountdownElement = $(".cart-countdown");
  initCartCountdown(tenMinutes, $cartCountdownElement);
});

const utmSource = getCookieByCart("_shopify_sa_p");
const imgCart = document.querySelector(".cart-item img");
if ((utmSource && getUTMAttributes) || imgCart) {
  var utm_attributes = getUTMAttributes();
  if (
    (utm_attributes &&
      (utm_attributes.utm_source == "tiktok" ||
        utm_attributes.utm_source == "Tiktok")) ||
    (imgCart && imgCart.src.includes("customily"))
  ) {
    var script = document.createElement("script");
    script.src =
      "https://cdn.customily.com/shopify/static/customily.shopify.script.unified.js";
    script.defer = true;
    document.body.appendChild(script);
  }
}
