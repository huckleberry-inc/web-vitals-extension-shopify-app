const createWebVital = (document) => {
  const APP_PAGE_URL_REGEX = /^https:\/\/admin\.shopify\.com\/store\/.+\/apps\/.+$/;
  let card, vitals, appName;
  let previousUrl = document.location.href;

  const formatMetric = (metricName, value) =>
    `${metricName}: ${value?.toFixed(2) ?? "?"} ${metricName === "CLS" ? "" : "ms"}`;
  const getAppNameFromURL = () => document.location.href.split("/")[6];
  const isAppPage = () => APP_PAGE_URL_REGEX.test(document.location.href);
  const isSameApp = () => appName === getAppNameFromURL();

  const showCard = () => {
    card.style.opacity = 1;
  };
  const hideCard = () => {
    card.style.opacity = 0;
  };
  const resetCard = () =>
    vitals.forEach((vital) => {
      vital.list.innerText = formatMetric(vital.name);
    });

  const initializeCard = () => {
    card = document.createElement("div");
    card.style.position = "fixed";
    card.style.right = "15px";
    card.style.bottom = "15px";
    card.style.background = "#fff";
    card.style.boxShadow = "0rem 0.125rem 0.25rem rgba(31,33,36,.1), 0rem 0.0625rem 0.375rem rgba(31,33,36,.05)";
    card.style.padding = "16px";
    card.style.borderRadius = "0.5rem";

    const ul = document.createElement("ul");
    ul.style.margin = 0;
    ul.style.padding = 0;
    ul.style.listStyleType = "none";

    vitals = ["LCP", "FID", "CLS"].map((name) => {
      const list = document.createElement("li");
      list.style.color = "#1f2124";
      list.innerText = formatMetric(name);
      ul.appendChild(list);
      return { name, list };
    });

    card.appendChild(ul);
    document.body.appendChild(card);

    appName = getAppNameFromURL();
    isAppPage() ? showCard() : hideCard();
  };

  const observeChanges = () => {
    if (previousUrl === document.location.href) return;
    previousUrl = document.location.href;

    if (!isAppPage()) {
      resetCard();
      hideCard();
      return;
    }
    if (isSameApp()) return;
    appName = getAppNameFromURL();

    resetCard();
    showCard();
  };

  const handleWebVitalsMessage = (event) => {
    const webVitalTypes = [
      "APP::WEB_VITALS::LARGEST_CONTENTFUL_PAINT",
      "APP::WEB_VITALS::FIRST_INPUT_DELAY",
      "APP::WEB_VITALS::CUMULATIVE_LAYOUT_SHIFT",
    ];
    if (!webVitalTypes.includes(event.data.payload?.type)) return;

    const { metricName, value } = event.data.payload.payload;
    vitals.find(({ name }) => name === metricName).list.innerText = formatMetric(metricName, value);
  };

  return { initializeCard, observeChanges, handleWebVitalsMessage };
};

const vital = createWebVital(document);
vital.initializeCard();
new MutationObserver(vital.observeChanges).observe(document.body, {
  childList: true,
  subtree: true,
});
window.addEventListener("message", vital.handleWebVitalsMessage);
