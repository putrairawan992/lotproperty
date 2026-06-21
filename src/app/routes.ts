import { useState, useEffect } from "react";
import { Page, AdminPage } from "./types";
import { Home, Target, Building2, Users, Trophy, User } from "lucide-react";

// Helper to check current pathname and normalize it to our Page type
export function getPageFromUrl(): Page {
  const path = window.location.pathname.replace(/^\//, "");
  const validPages: Page[] = ["home", "quest", "listing", "prospect", "academy", "leaderboard", "profile", "notifications", "event", "attendance", "help"];
  if (validPages.includes(path as Page)) {
    return path as Page;
  }
  return "home"; // default
}

export function getAdminPageFromUrl(): AdminPage {
  const path = window.location.pathname.replace(/^\/admin\//, "");
  const validPages: AdminPage[] = ["dashboard", "agents", "commission", "hof", "academy", "events", "xp", "log"];
  if (validPages.includes(path as AdminPage)) {
    return path as AdminPage;
  }
  return "dashboard"; // default
}

export function useLocation() {
  const [path, setPath] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, "", to);
    setPath(window.location.pathname);
    setSearch(window.location.search);
    // Dispatch popstate event manually so other active hooks receive the updates
    window.dispatchEvent(new Event("popstate"));
  };

  const getQueryParam = (key: string) => {
    const params = new URLSearchParams(search);
    return params.get(key);
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    const newSearch = params.toString();
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
    window.history.pushState(null, "", newUrl);
    setPath(window.location.pathname);
    setSearch(window.location.search);
    window.dispatchEvent(new Event("popstate"));
  };

  return { path, search, navigate, getQueryParam, setQueryParam };
}

// Hook to bind internal tab state directly to query parameter
export function useTabQuery(
  paramName: string,
  defaultValue: string,
  onTabChange?: (val: string) => void
) {
  const { getQueryParam, setQueryParam } = useLocation();
  const currentVal = getQueryParam(paramName) || defaultValue;

  const setVal = (newVal: string) => {
    setQueryParam(paramName, newVal);
    if (onTabChange) {
      onTabChange(newVal);
    }
  };

  return [currentVal, setVal] as const;
}

export const PAGE_TITLE: Record<Page, string> = {
  home:          "Home",
  quest:         "Quest",
  listing:       "My Listing",
  prospect:      "Prospect",
  academy:       "Academy",
  leaderboard:   "Leaderboard",
  profile:       "Profile",
  notifications: "Notifications",
  event:         "Event Detail",
  attendance:    "Absensi",
  help:          "Help",
};

export const NAV_TABS = [
  { id: "home" as Page,        label: "Home",        icon: Home },
  { id: "quest" as Page,       label: "Quest",       icon: Target },
  { id: "listing" as Page,     label: "Listing",     icon: Building2 },
  { id: "prospect" as Page,    label: "Prospect",    icon: Users },
  { id: "profile" as Page,     label: "Profile",     icon: User },
];

export const DESKTOP_NAV_TABS = [
  { id: "home" as Page,        label: "Home",        icon: Home },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy },
  { id: "quest" as Page,       label: "Quest",       icon: Target },
  { id: "listing" as Page,     label: "Listing",     icon: Building2 },
  { id: "prospect" as Page,    label: "Prospect",    icon: Users },
  { id: "profile" as Page,     label: "Profile",     icon: User },
];
