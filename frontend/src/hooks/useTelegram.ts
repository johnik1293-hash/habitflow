import { useEffect, useMemo } from "react";
import WebApp from "@twa-dev/sdk";

export function useTelegram() {
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  const telegramUser = useMemo(() => WebApp.initDataUnsafe?.user, []);

  return {
    webApp: WebApp,
    telegramUser
  };
}

