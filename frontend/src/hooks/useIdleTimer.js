import { useEffect, useRef } from "react";

/**
 * Minimal "useIdleTimer" hook for totem.
 * Triggers onIdle after `timeoutMs` of no user interaction.
 */
export function useIdleTimer({ timeoutMs, onIdle, onActive, enabled = true }) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (onIdleRef.current && timeoutMs) {
        timerRef.current = window.setTimeout(() => onIdleRef.current?.(), timeoutMs);
      }
    };

    const handleActivity = () => {
      onActiveRef.current?.();
      reset();
    };

    const events = ["pointerdown", "pointermove", "touchstart", "touchmove", "keydown", "wheel"];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    reset();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [timeoutMs, enabled]);
}

