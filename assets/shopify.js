(() => {
  var e;
  (e = (e) => {
    var t, o, n;
    (t = () => {
      const t = () => {
        "function" == typeof window.__InitPBApp
          ? window.__InitPBApp(
              Shopify.shop,
              e.handle,
              "#artwork-preview",
              "#personalized-form"
            )
          : setTimeout(t, 10);
      };
      t();
    }),
      (o = document.createElement("script")),
      (n = document.getElementsByTagName("script")[0]),
      (o.async = 1),
      (o.onload = o.onreadystatechange =
        function (e, n) {
          (n || !o.readyState || /loaded|complete/.test(o.readyState)) &&
            ((o.onload = o.onreadystatechange = null),
            (o = void 0),
            !n && t && setTimeout(t, 0));
        }),
      (o.src =
        "https://365dekorr.com/cdn/shop/t/328/assets/sdk.js?v=10916697728991260271700278076"),
      n.parentNode.insertBefore(o, n);
  }),
    fetch(`${window.location.origin}${window.location.pathname}.js`, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((e) => e.json())
      .then(e);
})();
