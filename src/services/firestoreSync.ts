import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppData, SavedEstimation } from '../types';

function userDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'appData');
}

export async function loadFromFirestore(uid: string): Promise<AppData | null> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as AppData;
}

export async function saveToFirestore(uid: string, data: AppData): Promise<void> {
  // Strip undefined values — Firestore rejects them
  const serialized = JSON.parse(JSON.stringify(data)) as AppData;
  await setDoc(userDocRef(uid), serialized);
}

function newerEstimation(a: SavedEstimation, b: SavedEstimation): SavedEstimation {
  return a.updatedAt >= b.updatedAt ? a : b;
}

export function mergeAppData(local: AppData, cloud: AppData): AppData {
  const byId = new Map<string, SavedEstimation>();

  for (const e of cloud.estimationHistory) byId.set(e.id, e);
  for (const e of local.estimationHistory) {
    const existing = byId.get(e.id);
    byId.set(e.id, existing ? newerEstimation(e, existing) : e);
  }

  const estimationHistory = Array.from(byId.values())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Cloud wins for settings; merged history
  return { ...cloud, estimationHistory };
}
