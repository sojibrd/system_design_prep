"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * `useState`-এর মতোই, কিন্তু মান `localStorage`-এ persist করে।
 *
 * `useEffect` + `setState` দিয়ে নয়, `useSyncExternalStore` দিয়ে লেখা —
 * localStorage একটা external store, React-এর নিজস্ব state নয়। এতে
 * cascading render হয় না (Next 16-এর `react-hooks/set-state-in-effect`
 * rule effect-ভিত্তিক লেখাটাকে error দেয়), আর hydration-ও নিরাপদ:
 * server ও hydration pass-এ `getServerSnapshot` থেকে `initialValue` আসে,
 * তারপর React নিজেই client snapshot-এ সুইচ করে।
 *
 * ui-rules.md §৫ — `localStorage` কখনো সরাসরি ছোঁবেন না, এই hook ব্যবহার করুন।
 */

/** key → শেষবার পড়া raw string ও তার parsed মান।
 *  `getSnapshot` প্রতিবার নতুন object ফেরালে React অসীম লুপে পড়ে,
 *  তাই raw string না বদলালে আগের reference-ই ফেরত দিই। */
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, onChange: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onChange);

  // অন্য ট্যাবে বদলালেও sync থাকি
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) onChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readSnapshot<T>(key: string, initialValue: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    // storage বন্ধ (private mode) — initialValue-তেই থাকি
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.parsed as T;

  let parsed: T = initialValue;
  if (raw !== null) {
    try {
      parsed = JSON.parse(raw) as T;
    } catch {
      // corrupt JSON — initialValue
    }
  }
  snapshotCache.set(key, { raw, parsed });
  return parsed;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // কলার সাধারণত literal দেয় (`[]`, `{}`) — প্রতি render-এ নতুন reference।
  // `getServerSnapshot` প্রতিবার নতুন object ফেরালে React অসীম লুপ ধরে ফেলে,
  // তাই প্রথম মানটাই ধরে রাখি।
  const initialRef = useRef(initialValue);

  const value = useSyncExternalStore(
    useCallback((onChange: () => void) => subscribe(key, onChange), [key]),
    useCallback(() => readSnapshot(key, initialRef.current), [key]),
    useCallback(() => initialRef.current, []),
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(readSnapshot(key, initialRef.current))
          : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // quota শেষ — লেখা হলো না, কিন্তু UI যেন আটকে না যায়
      }
      snapshotCache.set(key, {
        raw: JSON.stringify(resolved),
        parsed: resolved,
      });
      emit(key);
    },
    [key],
  );

  return [value, setValue] as const;
}

export default useLocalStorage;
