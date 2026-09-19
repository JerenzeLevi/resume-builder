"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeData, sampleResume } from "./resume-types";

const STORAGE_KEY = "resume-creator:data";

export function useResumeStorage() {
  const [data, setData] = useState<ResumeData>(sampleResume);
  const [loaded, setLoaded] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ResumeData>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
        setData({
          ...sampleResume,
          ...parsed,
          template: parsed.template ?? "clean-columns",
          font: parsed.font ?? "calibri",
        });
      }
    } catch {
      // ignore corrupt storage
    } finally {
      hydrated.current = true;
      setLoaded(true);
    }
  }, []);

  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedAt(Date.now());
    } catch {
      // storage full or unavailable — ignore
    }
  }, [data]);

  const reset = useCallback((next: ResumeData) => setData(next), []);

  return { data, setData, reset, loaded, savedAt };
}
