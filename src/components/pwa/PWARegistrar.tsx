"use client";

import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";

export function PWARegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          if (registration.active?.scriptURL.endsWith(SERVICE_WORKER_URL)) {
            void registration.unregister();
          }
        }
      });
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
          scope: "/",
        });
      } catch (error) {
        console.error("Failed to register service worker", error);
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
