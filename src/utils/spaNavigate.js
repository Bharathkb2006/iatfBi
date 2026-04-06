/**
 * Used by legacy chart modules for "Back to IATF". When the React app sets
 * window.__BI_ROUTER_PUSH__, navigation stays in the SPA.
 */
export function goIatf() {
  const push = typeof window !== 'undefined' && window.__BI_ROUTER_PUSH__;
  if (typeof push === 'function') {
    push('/iatf');
  } else {
    window.location.assign('/iatf');
  }
}
