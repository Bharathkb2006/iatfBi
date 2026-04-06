import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from './config.js';

const SYNC_COLLECTION = 'siteData';
const SYNC_KEYS = [
  'biIatfBannerTitle',
  'biContent',
  'biSupplyModuleData',
  'biQualityModuleData',
  'biMaintenanceModuleData',
  'biProductionModuleData',
  'biTechnicalModuleData',
];

function parseStored(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return raw;
  }
}

function stringifyStable(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function localRawForKey(key) {
  return window.localStorage.getItem(key);
}

function setLocalFromValue(key, value) {
  if (value == null) return;
  if (typeof value === 'string') {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.setItem(key, stringifyStable(value));
  }
}

async function pullFromFirestore(lastByKey) {
  const snap = await getDocs(collection(db, SYNC_COLLECTION));
  snap.forEach((d) => {
    const key = d.id;
    if (!SYNC_KEYS.includes(key)) return;
    const data = d.data() || {};
    if (typeof data.value === 'undefined') return;
    setLocalFromValue(key, data.value);
    lastByKey[key] = stringifyStable(parseStored(localRawForKey(key)));
  });
}

async function pushChangedToFirestore(lastByKey) {
  for (const key of SYNC_KEYS) {
    const raw = localRawForKey(key);
    const parsed = parseStored(raw);
    if (parsed == null) continue;
    const serialized = stringifyStable(parsed);
    if (lastByKey[key] === serialized) continue;
    await setDoc(
      doc(db, SYNC_COLLECTION, key),
      {
        value: parsed,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    lastByKey[key] = serialized;
  }
}

/**
 * Bi-directional sync layer:
 * - Initial: Firestore -> localStorage
 * - Ongoing: localStorage -> Firestore (captures admin iframe writes too)
 */
export function startLocalStorageFirestoreSync() {
  if (!firebaseReady || !db || typeof window === 'undefined') {
    return function noop() {};
  }

  let stopped = false;
  let inFlight = false;
  const lastByKey = {};

  const runSync = async () => {
    if (stopped || inFlight) return;
    inFlight = true;
    try {
      await pushChangedToFirestore(lastByKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Firebase Sync] push failed:', err);
    } finally {
      inFlight = false;
    }
  };

  pullFromFirestore(lastByKey)
    .then(runSync)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[Firebase Sync] initial pull failed:', err);
    });

  const intervalId = window.setInterval(runSync, 4000);

  return function stop() {
    stopped = true;
    window.clearInterval(intervalId);
  };
}

