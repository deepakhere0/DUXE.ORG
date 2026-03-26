import { NOTE_STATUS } from '../constants/status';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export class NotesService {
  constructor() {
    this.notesCollection = 'notes';
    this.universitiesCollection = 'universities';
    this.departmentsCollection = 'departments';
  }

  // Get notes with filters and pagination
  async getNotes(filters = {}, lastDoc = null, limitCount = 20) {
    try {
      let notesQuery = collection(db, this.notesCollection);
      const queryConstraints = [];

      // Always filter for approved notes
      queryConstraints.push(where('status', '==', NOTE_STATUS.APPROVED));

      // Apply filters
      if (filters.universityId) {
        queryConstraints.push(where('universityId', '==', filters.universityId));
      }

      if (filters.departmentId) {
        queryConstraints.push(where('departmentId', '==', filters.departmentId));
      }

      if (filters.semester) {
        queryConstraints.push(where('semester', '==', parseInt(filters.semester)));
      }

      // Add ordering
      queryConstraints.push(orderBy('createdAt', 'desc'));

      // Add pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }
      queryConstraints.push(limit(limitCount));

      // Build and execute query
      notesQuery = query(notesQuery, ...queryConstraints);
      const snapshot = await getDocs(notesQuery);

      const notes = [];
      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data(),
          _doc: doc // Keep reference for pagination
        });
      });

      return {
        notes,
        hasMore: snapshot.docs.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };

    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  }

  // Search notes with text query
  async searchNotes(searchQuery, filters = {}, lastDoc = null, limitCount = 20) {
    try {
      if (!searchQuery.trim()) {
        return this.getNotes(filters, lastDoc, limitCount);
      }

      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      let notesQuery = collection(db, this.notesCollection);
      const queryConstraints = [];

      // Always filter for approved notes
      queryConstraints.push(where('status', '==', NOTE_STATUS.APPROVED));

      // Apply additional filters
      if (filters.universityId) {
        queryConstraints.push(where('universityId', '==', filters.universityId));
      }

      if (filters.departmentId) {
        queryConstraints.push(where('departmentId', '==', filters.departmentId));
      }

      if (filters.semester) {
        queryConstraints.push(where('semester', '==', parseInt(filters.semester)));
      }

      // For now, we'll do client-side filtering for text search
      // In production, consider using Algolia or similar for better search
      queryConstraints.push(orderBy('createdAt', 'desc'));
      queryConstraints.push(limit(100)); // Get more docs for filtering

      notesQuery = query(notesQuery, ...queryConstraints);
      const snapshot = await getDocs(notesQuery);

      const allNotes = [];
      snapshot.forEach((doc) => {
        allNotes.push({
          id: doc.id,
          ...doc.data(),
          _doc: doc
        });
      });

      // Client-side text filtering
      const filteredNotes = allNotes.filter(note => {
        const searchableText = [
          note.title,
          note.courseCode,
          note.description,
          note.authorName,
          note.universityName,
          note.departmentName
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });

      // Apply pagination to filtered results
      const startIndex = lastDoc ? 
        filteredNotes.findIndex(note => note.id === lastDoc.id) + 1 : 0;
      const paginatedNotes = filteredNotes.slice(startIndex, startIndex + limitCount);

      return {
        notes: paginatedNotes,
        hasMore: startIndex + limitCount < filteredNotes.length,
        lastDoc: paginatedNotes[paginatedNotes.length - 1]
      };

    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  }

  // Get popular/trending notes
  async getPopularNotes(limitCount = 10) {
    try {
      const notesQuery = query(
        collection(db, this.notesCollection),
        where('status', '==', NOTE_STATUS.APPROVED),
        orderBy('downloads', 'desc'),
        orderBy('ratingAvg', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(notesQuery);
      const notes = [];

      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notes;
    } catch (error) {
      console.error('Error fetching popular notes:', error);
      return [];
    }
  }

  // Get recent notes
  async getRecentNotes(limitCount = 10) {
    try {
      const notesQuery = query(
        collection(db, this.notesCollection),
        where('status', '==', NOTE_STATUS.APPROVED),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(notesQuery);
      const notes = [];

      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notes;
    } catch (error) {
      console.error('Error fetching recent notes:', error);
      return [];
    }
  }

  // Download note (increment download count)
  async downloadNote(noteId) {
    try {
      const noteRef = doc(db, this.notesCollection, noteId);
      await updateDoc(noteRef, {
        downloads: increment(1)
      });

      // Get the updated note
      const noteSnap = await getDoc(noteRef);
      if (noteSnap.exists()) {
        return {
          id: noteSnap.id,
          ...noteSnap.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error downloading note:', error);
      throw new Error('Failed to download note');
    }
  }

  // Get note by ID
  async getNoteById(noteId) {
    try {
      const noteRef = doc(db, this.notesCollection, noteId);
      const noteSnap = await getDoc(noteRef);
      
      if (noteSnap.exists()) {
        return {
          id: noteSnap.id,
          ...noteSnap.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Failed to fetch note');
    }
  }

  // Get statistics
  async getNotesStats() {
    try {
      const [notesSnapshot, universitiesSnapshot, departmentsSnapshot] = await Promise.all([
        getDocs(query(collection(db, this.notesCollection), where('status', '==', NOTE_STATUS.APPROVED))),
        getDocs(query(collection(db, this.universitiesCollection), where('active', '==', true))),
        getDocs(query(collection(db, this.departmentsCollection), where('active', '==', true)))
      ]);

      // Calculate total downloads
      let totalDownloads = 0;
      notesSnapshot.forEach(doc => {
        const data = doc.data();
        totalDownloads += (data.downloads || 0);
      });

      return {
        totalNotes: notesSnapshot.size,
        totalUniversities: universitiesSnapshot.size,
        totalDepartments: departmentsSnapshot.size,
        totalDownloads
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalNotes: 0,
        totalUniversities: 0,
        totalDepartments: 0,
        totalDownloads: 0
      };
    }
  }

  // Get notes by university
  async getNotesByUniversity(universityId, limitCount = 20) {
    try {
      const notesQuery = query(
        collection(db, this.notesCollection),
        where('status', '==', NOTE_STATUS.APPROVED),
        where('universityId', '==', universityId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(notesQuery);
      const notes = [];

      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notes;
    } catch (error) {
      console.error('Error fetching notes by university:', error);
      return [];
    }
  }

  // Get notes by department
  async getNotesByDepartment(departmentId, limitCount = 20) {
    try {
      const notesQuery = query(
        collection(db, this.notesCollection),
        where('status', '==', NOTE_STATUS.APPROVED),
        where('departmentId', '==', departmentId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(notesQuery);
      const notes = [];

      snapshot.forEach((doc) => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notes;
    } catch (error) {
      console.error('Error fetching notes by department:', error);
      return [];
    }
  }

  // Get suggested indexes for Firestore
  getSuggestedIndexes() {
    return [
      // Basic filtering and sorting
      'Collection: notes, Fields: status ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, downloads DESC, ratingAvg DESC',
      
      // University filtering
      'Collection: notes, Fields: status ASC, universityId ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, universityId ASC, downloads DESC',
      
      // Department filtering
      'Collection: notes, Fields: status ASC, departmentId ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, departmentId ASC, downloads DESC',
      
      // Semester filtering
      'Collection: notes, Fields: status ASC, semester ASC, createdAt DESC',
      
      // Combined filtering
      'Collection: notes, Fields: status ASC, universityId ASC, departmentId ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, universityId ASC, departmentId ASC, semester ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, universityId ASC, semester ASC, createdAt DESC',
      'Collection: notes, Fields: status ASC, departmentId ASC, semester ASC, createdAt DESC',
      
      // Universities and departments
      'Collection: universities, Fields: active ASC, shortName ASC',
      'Collection: departments, Fields: active ASC, uniId ASC, name ASC'
    ];
  }
}

// Create a singleton instance
export const notesService = new NotesService();