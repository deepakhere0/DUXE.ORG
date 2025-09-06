// Lightweight analytics helpers
import { doc, setDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const ensureDb = () => { if (!db) throw new Error('Firebase not configured'); };

export const bumpNoteDownload = async (noteId) => {
  ensureDb();
  const ref = doc(db, 'notes', noteId);
  await updateDoc(ref, { downloads: increment(1), updatedAt: serverTimestamp() });
};

export const bumpToolUsage = async (toolKey) => {
  ensureDb();
  const ref = doc(db, 'analytics', `tool_${toolKey}`);
  await setDoc(ref, { key: toolKey, count: increment(1), updatedAt: serverTimestamp() }, { merge: true });
};

