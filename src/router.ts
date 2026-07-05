import { useSyncExternalStore } from "react";

export type Route =
  | { name: "home" }
  | { name: "lectures" }
  | { name: "lecture"; id: number }
  | { name: "review" }
  | { name: "review-item"; slug: string }
  | { name: "lab" };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "");
  const lecture = path.match(/^\/lecture\/(\d+)$/);
  if (lecture) return { name: "lecture", id: Number(lecture[1]) };
  const reviewItem = path.match(/^\/review\/([a-z0-9-]+)$/);
  if (reviewItem) return { name: "review-item", slug: reviewItem[1] };
  if (path === "/lectures") return { name: "lectures" };
  if (path === "/review") return { name: "review" };
  if (path === "/lab") return { name: "lab" };
  return { name: "home" };
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot() {
  return window.location.hash;
}

// useSyncExternalStore is the React 18 way to read an external source (the URL
// hash) and re-render when it changes.
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot);
  return parseRoute(hash);
}
