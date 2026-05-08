import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Overview, User } from "../types";

export function useAnalytics(user?: User) {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getOverview(user)
      .then(setOverview)
      .catch((error) => console.error("overview error", error));
  }, [user]);

  return { overview };
}

