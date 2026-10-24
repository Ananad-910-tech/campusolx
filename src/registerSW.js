
export function registerCampusOLXServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      if (import.meta.env.PROD) {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((error) => {
            console.error("Service worker registration failed:", error);
          });
      }
    });
  }
}
