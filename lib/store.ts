"use client";
import { useEffect, useState } from "react";
import { Data, seed } from "./model";
import { isDemoData } from "./storage-data";
const key = "repdesk:demo:v1";
export function useDemo() {
  const [data, setData] = useState<Data | null>(null),
    [warning, setWarning] = useState("");
  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(key);
        const d = raw ? JSON.parse(raw) : seed();
        if (!isDemoData(d)) throw Error();
        setData(d);
      } catch {
        setData(seed());
        setWarning(
          "Stored demo data could not be loaded. Sample data restored.",
        );
      }
    }
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  function save(d: Data) {
    try {
      localStorage.setItem(key, JSON.stringify(d));
      setData(d);
      return true;
    } catch {
      setWarning(
        "Browser storage is unavailable. Enable it to save this demo.",
      );
      return false;
    }
  }
  return { data, save, warning, reset: () => save(seed()) };
}
