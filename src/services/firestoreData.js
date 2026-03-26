// Firestore data model helpers and CRUD wrappers
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const col = (name) => collection(db, name);
const ref = (name, id) => doc(db, name, id);

const ensureDb = () => {
  if (!db) throw new Error('Firebase not configured');
};

// Generic helpers
export const createDoc = async (collectionName, data, id) => {
  ensureDb();
  const payload = { ...data };
  if (!payload.createdAt) payload.createdAt = serverTimestamp();
  if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
  if (id) {
    await setDoc(ref(collectionName, id), payload, { merge: true });
    return id;
  }
  const res = await addDoc(col(collectionName), payload);
  return res.id;
};

export const readDoc = async (collectionName, id) => {
  ensureDb();
  const snap = await getDoc(ref(collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateDocById = async (collectionName, id, data) => {
  ensureDb();
  await updateDoc(ref(collectionName, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteDocById = async (collectionName, id) => {
  ensureDb();
  await deleteDoc(ref(collectionName, id));
};

export const listDocs = async (collectionName, { filters = [], sort = null, take = 20 } = {}) => {
  ensureDb();
  let q = query(col(collectionName));
  filters.forEach((f) => {
    if (f) q = query(q, where(f.field, f.op || '==', f.value));
  });
  if (sort?.field) q = query(q, orderBy(sort.field, sort.dir || 'desc'));
  if (take) q = query(q, limit(take));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Collections
export const Users = {
  collection: 'users',
  async upsert(uid, data) {
    return createDoc(this.collection, { uid, ...data }, uid);
  },
  async get(uid) {
    return readDoc(this.collection, uid);
  },
  async update(uid, data) {
    return updateDocById(this.collection, uid, data);
  },
};

export const Universities = {
  collection: 'universities',
  async list() {
    return listDocs(this.collection, { sort: { field: 'name', dir: 'asc' }, take: 500 });
  },
};

export const Departments = {
  collection: 'departments',
  async listByUni(uniId) {
    return listDocs(this.collection, {
      filters: [{ field: 'uniId', value: uniId }],
      sort: { field: 'name', dir: 'asc' },
      take: 1000,
    });
  },
};

export const Notes = {
  collection: 'notes',
  async listApproved({
    queryText = '',
    universityId = '',
    departmentId = '',
    subject = '',
    semester = '',
  } = {}) {
    // Basic filtering; for full text, use an external service later
    const filters = [{ field: 'status', value: 'approved' }];
    if (universityId) filters.push({ field: 'universityId', value: universityId });
    if (departmentId) filters.push({ field: 'departmentId', value: departmentId });
    if (subject) filters.push({ field: 'subject', value: subject });
    if (semester) filters.push({ field: 'semester', value: semester });
    const docs = await listDocs(this.collection, {
      filters,
      sort: { field: 'createdAt', dir: 'desc' },
      take: 50,
    });
    return queryText
      ? docs.filter((d) => (d.title || '').toLowerCase().includes(queryText.toLowerCase()))
      : docs;
  },
  // ADD THESE NEW FUNCTIONS ↓↓↓
  async listPending(userId) {
    const filters = [
      { field: 'createdBy', value: userId },
      { field: 'status', value: 'pending' },
    ];
    return listDocs(this.collection, {
      filters,
      sort: { field: 'createdAt', dir: 'desc' },
      take: 100,
    });
  },
  async listByUser(userId) {
    const filters = [{ field: 'createdBy', value: userId }];
    return listDocs(this.collection, {
      filters,
      sort: { field: 'createdAt', dir: 'desc' },
      take: 100,
    });
  },
  async listForReview() {
    const filters = [{ field: 'status', value: 'pending' }];
    return listDocs(this.collection, {
      filters,
      sort: { field: 'createdAt', dir: 'desc' },
      take: 100,
    });
  },
  async listRejected(userId) {
    const filters = [
      { field: 'createdBy', value: userId },
      { field: 'status', value: 'rejected' },
    ];
    return listDocs(this.collection, {
      filters,
      sort: { field: 'createdAt', dir: 'desc' },
      take: 100,
    });
  },

  async incrementDownload(id) {
    ensureDb();
    await updateDoc(ref(this.collection, id), { downloads: increment(1) });
  },
};
// Note CRUD operations
export const createNote = async (noteData) => {
  return createDoc(Notes.collection, noteData);
};

export const getNoteById = async (noteId) => {
  return readDoc(Notes.collection, noteId);
};

export const updateNote = async (noteId, updates) => {
  return updateDocById(Notes.collection, noteId, updates);
};
export const deleteNote = async (noteId) => {
  return deleteDocById(Notes.collection, noteId);
};

export const getPendingNotes = async (userId) => {
  return Notes.listPending(userId);
};

export const getNotesForReview = async () => {
  return Notes.listForReview();
};

export const AIJobs = {
  collection: 'aiJobs',
  async create(job) {
    return createDoc(this.collection, { status: 'queued', ...job });
  },
  async update(id, data) {
    return updateDocById(this.collection, id, data);
  },
  async get(id) {
    return readDoc(this.collection, id);
  },
};

export const Internships = {
  collection: 'internships',
  async list() {
    return listDocs(this.collection, { sort: { field: 'postedAt', dir: 'desc' }, take: 100 });
  },
};

export const Videos = {
  collection: 'videos',
  async list() {
    return listDocs(this.collection, { sort: { field: 'postedAt', dir: 'desc' }, take: 100 });
  },
};

export const Analytics = {
  collection: 'analytics',
  async bumpCounter(key) {
    return createDoc(this.collection, { key }, key).catch(() => {});
    // We could move to a Cloud Function to avoid race conditions; here is a light attempt
  },
};
