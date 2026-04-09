import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const EDGE_THRESHOLD = 30; // px from left edge to start
const MIN_SWIPE_DISTANCE = 80; // px to trigger back
const MAX_VERTICAL = 60; // max vertical movement allowed

/**
 * Hook that adds swipe-from-left-edge-to-go-back gesture on mobile.
 */
export function useSwipeBack(enabled = true) {
  const navigate = useNavigate();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    if (touch.clientX <= EDGE_THRESHOLD) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = Math.abs(touch.clientY - touchStart.current.y);
    touchStart.current = null;

    if (dx >= MIN_SWIPE_DISTANCE && dy <= MAX_VERTICAL) {
      navigate(-1);
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
}
