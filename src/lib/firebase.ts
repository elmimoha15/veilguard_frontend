import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';

/**
 * Single place that wires the Firebase client SDK to either the local emulator
 * or (later) production. Swapping environments is one env change — see
 * .env.example. Everything here is browser-safe and lazily initialized.
 */

const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-veilguard';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key';

// Full web config for the real project. authDomain is required for the Google /
// GitHub sign-in popups to work; appId/sender/bucket round out the SDK config.
// All fall back to project-derived defaults so emulator runs still work.
const firebaseConfig = {
  projectId: PROJECT_ID,
  apiKey: API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${PROJECT_ID}.firebaseapp.com`,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let emulatorsConnected = false;

function app(): FirebaseApp {
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(firebaseConfig);
  return _app;
}

export function auth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(app());
  if (USE_EMULATOR && !emulatorsConnected) connectEmulators();
  return _auth;
}

export function db(): Firestore {
  if (_db) return _db;
  // Force long-polling instead of the default WebChannel transport. WebChannel
  // trips a long-standing SDK bug ("INTERNAL ASSERTION FAILED: Unexpected state",
  // IDs ca9/b815) in the watch-stream aggregator, which crashes the app. Must run
  // before any getFirestore(); guarded so fast-refresh re-runs fall back cleanly.
  //
  // ignoreUndefinedProperties: an AppRecord for a URL-only app has no repo, so
  // fields like `githubRepo` are `undefined`. Firestore rejects any `undefined`
  // value in a write ("Unsupported field value: undefined"); this drops them
  // instead, so saving monitoring settings for a repo-less app succeeds.
  try {
    _db = initializeFirestore(app(), {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    });
  } catch {
    _db = getFirestore(app());
  }
  if (USE_EMULATOR && !emulatorsConnected) connectEmulators();
  return _db;
}

function connectEmulators(): void {
  if (emulatorsConnected) return;
  emulatorsConnected = true;
  const authUrl = process.env.NEXT_PUBLIC_AUTH_EMULATOR || 'http://localhost:9099';
  const [fsHost, fsPort] = (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR || 'localhost:8080').split(':');
  try {
    connectAuthEmulator(getAuth(app()), authUrl, { disableWarnings: true });
  } catch {
    /* already connected (fast refresh) */
  }
  try {
    connectFirestoreEmulator(getFirestore(app()), fsHost || 'localhost', Number(fsPort || 8080));
  } catch {
    /* already connected */
  }
}
