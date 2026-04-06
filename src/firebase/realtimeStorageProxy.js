import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from './config.js';

const COLLECTION = 'siteData';
const MANAGED_KEYS = new Set([
  'biIatfBannerTitle',
  'biContent',
  'biSupplyModuleData',
  'biQualityModuleData',
  'biMaintenanceModuleData',
  'biProductionModuleData',
  'biTechnicalModuleData',
  'biAdminLoggedIn',
]);

function serialize(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function hydrateValue(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') return raw;
  return serialize(raw);
}

function installProxyIntoWindow(targetWindow, state) {
  if (!targetWindow || targetWindow.__biStorageProxyInstalled) return;
  const storage = targetWindow.localStorage;
  const originalGet = storage.getItem.bind(storage);
  const originalSet = storage.setItem.bind(storage);
  const originalRemove = storage.removeItem.bind(storage);
  const originalClear = storage.clear.bind(storage);

  storage.getItem = function patchedGetItem(key) {
    if (!MANAGED_KEYS.has(String(key))) return originalGet(key);
    return state.cache.has(key) ? state.cache.get(key) : null;
  };

  storage.setItem = function patchedSetItem(key, value) {
    const normalizedKey = String(key);
    const normalizedValue = String(value);
    if (!MANAGED_KEYS.has(normalizedKey)) {
      return originalSet(normalizedKey, normalizedValue);
    }
    state.cache.set(normalizedKey, normalizedValue);
    state.queueWrite(normalizedKey, normalizedValue);
    state.notify(normalizedKey, targetWindow);
  };

  storage.removeItem = function patchedRemoveItem(key) {
    const normalizedKey = String(key);
    if (!MANAGED_KEYS.has(normalizedKey)) return originalRemove(normalizedKey);
    state.cache.delete(normalizedKey);
    state.queueWrite(normalizedKey, null);
    state.notify(normalizedKey, targetWindow);
  };

  storage.clear = function patchedClear() {
    // Keep scope limited: only clear managed app keys through proxy.
    MANAGED_KEYS.forEach((key) => {
      state.cache.delete(key);
      state.queueWrite(key, null);
      state.notify(key, targetWindow);
    });
    return originalClear();
  };

  targetWindow.__biStorageProxyInstalled = true;
  state.windows.add(targetWindow);
}

function triggerUiRefresh(win, key) {
  if (!win) return;
  if (key === 'biSupplyModuleData' && typeof win.updateSupplyModule === 'function') win.updateSupplyModule();
  if (key === 'biQualityModuleData' && typeof win.updateQualityModule === 'function') win.updateQualityModule();
  if (key === 'biMaintenanceModuleData' && typeof win.updateMaintenanceModule === 'function') win.updateMaintenanceModule();
  if (key === 'biProductionModuleData' && typeof win.updateProductionModule === 'function') win.updateProductionModule();
  if (key === 'biTechnicalModuleData' && typeof win.updateTechnicalModule === 'function') win.updateTechnicalModule();
}

export function startRealtimeStorageProxy() {
  if (!firebaseReady || !db || typeof window === 'undefined') {
    return function noop() {};
  }

  const pendingWrites = new Map();
  const state = {
    cache: new Map(),
    windows: new Set(),
    queueWrite: (key, value) => {
      pendingWrites.set(key, value);
    },
    notify: (key, sourceWindow) => {
      state.windows.forEach((win) => {
        if (!win || win.closed) return;
        const current = state.cache.get(key) ?? null;
        try {
          // Broadcast key updates for React pages that need state refresh.
          win.dispatchEvent(new CustomEvent('bi-storage-updated', { detail: { key, value: current } }));
        } catch (e) {
          // ignore
        }
        triggerUiRefresh(win, key);
        if (win !== sourceWindow && win.document && win.document.body && key === 'biIatfBannerTitle') {
          const el = win.document.getElementById('iatfBannerDisplay');
          if (el && current) el.textContent = current;
        }
      });
    },
  };

  installProxyIntoWindow(window, state);
  window.__biInstallStorageProxyInto = (targetWindow) => installProxyIntoWindow(targetWindow, state);

  let stopped = false;
  let writing = false;

  const flushWrites = async () => {
    if (stopped || writing || pendingWrites.size === 0) return;
    writing = true;
    try {
      const entries = Array.from(pendingWrites.entries());
      pendingWrites.clear();
      for (const [key, value] of entries) {
        await setDoc(
          doc(db, COLLECTION, key),
          {
            value,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Firebase Proxy] write failed:', err);
    } finally {
      writing = false;
    }
  };

  const writeTimer = window.setInterval(flushWrites, 800);

  const unsubscribe = onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const key = change.doc.id;
        if (!MANAGED_KEYS.has(key)) return;
        const data = change.doc.data() || {};
        const incoming = hydrateValue(data.value);
        if (incoming == null) {
          state.cache.delete(key);
        } else {
          state.cache.set(key, incoming);
        }
        state.notify(key, null);
      });
    },
    (err) => {
      // eslint-disable-next-line no-console
      console.error('[Firebase Proxy] snapshot failed:', err);
    }
  );

  return function stop() {
    stopped = true;
    window.clearInterval(writeTimer);
    unsubscribe();
    delete window.__biInstallStorageProxyInto;
  };
}

