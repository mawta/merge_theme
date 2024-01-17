var LOCAL_STORAGE_WISHLIST_KEY = 'shopify-wishlist';
var LOCAL_STORAGE_DELIMITER = ',';
var BUTTON_ACTIVE_CLASS = 'active';
var GRID_LOADED_CLASS = 'loaded';

var selectors = {
  button: '[button-wishlist]',
  grid: '[grid-wishlist]',
  productCard: '.product-card',
};

$("document").ready(function() {
  initButtons();
  initGrid();
});

$(document).on('shopify-wishlist:updated', function(event) {
  console.log('[Shopify Wishlist] Wishlist Updated ✅', event.detail.wishlist);
  initGrid();
});

$(document).on('shopify-wishlist:init-product-grid', function(event) {
  console.log('[Shopify Wishlist] Wishlist Product List Loaded ✅', event.detail.wishlist);
});

$(document).on('shopify-wishlist:init-buttons', function(event) {
  console.log('[Shopify Wishlist] Wishlist Buttons Loaded ✅', event.detail.wishlist);
});

var fetchProductCardHTML = function(handle) {
  var productTileTemplateUrl = `/products/${handle}?view=card`;
  return fetch(productTileTemplateUrl)
    .then((res) => res.text())
    .then((res) => {
      var text = res;
      var parser = new DOMParser();
      var htmlDocument = parser.parseFromString(text, 'text/html');
      var productCard = htmlDocument.documentElement.querySelector(selectors.productCard);
      return productCard.outerHTML;
    })
    .catch((err) => console.error(`[Shopify Wishlist] Failed to load content for handle: ${handle}`, err));
};

var setupGrid = async function(grid) {
  var wishlist = getWishlist();
  var requests = wishlist.map(fetchProductCardHTML);
  var responses = await Promise.all(requests);
  var wishlistProductCards = responses.join('');
  grid.html(wishlistProductCards);
  grid.addClass(GRID_LOADED_CLASS);
  initButtons();

  var event = new CustomEvent('shopify-wishlist:init-product-grid', {
    detail: { wishlist: wishlist }
  });
  document.dispatchEvent(event);
};

var setupButtons = function(buttons) {
  buttons.each(function() {
    var productHandle = $(this).data('product-handle') || false;
    if (!productHandle) return console.error('[Shopify Wishlist] Missing `data-product-handle` attribute. Failed to update the wishlist.');

    if (wishlistContains(productHandle)) $(this).addClass(BUTTON_ACTIVE_CLASS);

    $(this).on('click', function() {
      updateWishlist(productHandle);
      $(this).toggleClass(BUTTON_ACTIVE_CLASS);
    });
  });
};

var initGrid = function() {
  var grid = $(selectors.grid);
  if (grid.length) setupGrid(grid);
};

var initButtons = function() {
  var buttons = $(selectors.button);
  if (buttons.length) setupButtons(buttons);
  else return;
  
  var event = new CustomEvent('shopify-wishlist:init-buttons', {
    detail: { wishlist: getWishlist() }
  });
  document.dispatchEvent(event);
};

var getWishlist = function() {
  var wishlist = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY) || false;
  if (wishlist) return wishlist.split(LOCAL_STORAGE_DELIMITER);
  return [];
};

var setWishlist = function(array) {
  var wishlist = array.join(LOCAL_STORAGE_DELIMITER);
  if (array.length) localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, wishlist);
  else localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY);

  var event = new CustomEvent('shopify-wishlist:updated', {
    detail: { wishlist: array }
  });
  document.dispatchEvent(event);

  return wishlist;
};

var updateWishlist = function(handle) {
  var wishlist = getWishlist();
  var indexInWishlist = wishlist.indexOf(handle);
  if (indexInWishlist === -1) wishlist.unshift(handle);
  else wishlist.splice(indexInWishlist, 1);
  return setWishlist(wishlist);
};

var wishlistContains = function(handle) {
  var wishlist = getWishlist();
  return wishlist.includes(handle);
};

var resetWishlist = function() {
  return setWishlist([]);
};