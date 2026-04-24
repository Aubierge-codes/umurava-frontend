"use client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: (
            listener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
            }) => void
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-gis="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGis = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google sign-in."));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export async function requestGoogleCredential(clientId: string): Promise<string> {
  if (!clientId) {
    throw new Error("Missing Google client ID.");
  }

  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    const gis = window.google?.accounts?.id;
    if (!gis) {
      reject(new Error("Google sign-in is unavailable."));
      return;
    }

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    gis.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          finish(() => resolve(response.credential as string));
        } else {
          finish(() => reject(new Error("Google did not return a credential.")));
        }
      },
    });

    gis.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
        finish(() => reject(new Error("Google sign-in was closed or could not be shown.")));
      }
    });

    window.setTimeout(() => {
      finish(() => reject(new Error("Google sign-in timed out.")));
    }, 120000);
  });
}
