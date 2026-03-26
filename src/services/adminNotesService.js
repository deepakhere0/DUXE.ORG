import { NOTE_STATUS } from '../constants/status';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export class AdminNotesService {
  constructor() {
    this.notesCollection = 'notes';
    this.universitiesCollection = 'universities';
    this.departmentsCollection = 'departments';
  }

  // Get all pending notes for admin review
  async getPendingNotes() {
    try {
      const notesQuery = query(
        collection(db, this.notesCollection),
        where('status', '==', NOTE_STATUS.PENDING),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(notesQuery);
      const pendingNotes = [];

      for (const docSnapshot of snapshot.docs) {
        const noteData = { id: docSnapshot.id, ...docSnapshot.data() };

        // Enrich with university and department names
        noteData.universityName = await this.getUniversityName(noteData.universityId);
        noteData.departmentName = await this.getDepartmentName(noteData.departmentId);

        pendingNotes.push(noteData);
      }

      return pendingNotes;
    } catch (error) {
      console.error('Error fetching pending notes:', error);
      throw new Error('Failed to fetch pending notes');
    }
  }

  // Approve a note with optional metadata updates
  async approveNote(noteId, updatedData = {}) {
    try {
      const noteRef = doc(db, this.notesCollection, noteId);

      // Prepare update data
      const updateData = {
        status: NOTE_STATUS.APPROVED,
        approvedAt: serverTimestamp(),
        reviewedBy: updatedData.reviewedBy || null,
        ...updatedData,
      };

      // Remove any undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(noteRef, updateData);

      // Return updated note
      const updatedNote = await getDoc(noteRef);
      return { id: updatedNote.id, ...updatedNote.data() };
    } catch (error) {
      console.error('Error approving note:', error);
      throw new Error('Failed to approve note');
    }
  }

  // Reject a note by deleting it from Firestore
  async rejectNote(noteId, reason = null) {
    try {
      const noteRef = doc(db, this.notesCollection, noteId);

      // Optionally, you could move to a 'rejected' collection for audit trail
      if (reason) {
        // Log rejection reason before deletion
        await updateDoc(noteRef, {
          status: NOTE_STATUS.REJECTED,
          rejectedAt: serverTimestamp(),
          rejectionReason: reason,
        });
      }

      // Delete the note
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      console.error('Error rejecting note:', error);
      throw new Error('Failed to reject note');
    }
  }

  // Get all universities for dropdown
  async getUniversities() {
    try {
      const universitiesQuery = query(
        collection(db, this.universitiesCollection),
        where('active', '==', true),
        orderBy('shortName', 'asc')
      );

      const snapshot = await getDocs(universitiesQuery);
      const universities = [];

      snapshot.forEach((doc) => {
        universities.push({ id: doc.id, ...doc.data() });
      });

      return universities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  }

  // Get departments by university for dropdown
  async getDepartmentsByUniversity(universityId) {
    try {
      const departmentsQuery = query(
        collection(db, this.departmentsCollection),
        where('uniId', '==', universityId),
        where('active', '==', true),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(departmentsQuery);
      const departments = [];

      snapshot.forEach((doc) => {
        departments.push({ id: doc.id, ...doc.data() });
      });

      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Get all departments for dropdown
  async getAllDepartments() {
    try {
      const departmentsQuery = query(
        collection(db, this.departmentsCollection),
        where('active', '==', true),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(departmentsQuery);
      const departments = [];

      snapshot.forEach((doc) => {
        departments.push({ id: doc.id, ...doc.data() });
      });

      return departments;
    } catch (error) {
      console.error('Error fetching all departments:', error);
      return [];
    }
  }

  // Helper function to get university name
  async getUniversityName(universityId) {
    if (!universityId) return 'Unknown University';

    try {
      const universityRef = doc(db, this.universitiesCollection, universityId);
      const universityDoc = await getDoc(universityRef);

      if (universityDoc.exists()) {
        return universityDoc.data().shortName || universityDoc.data().name;
      }
      return 'Unknown University';
    } catch (error) {
      console.error('Error fetching university name:', error);
      return 'Unknown University';
    }
  }

  // Helper function to get department name
  async getDepartmentName(departmentId) {
    if (!departmentId) return 'Unknown Department';

    try {
      const departmentRef = doc(db, this.departmentsCollection, departmentId);
      const departmentDoc = await getDoc(departmentRef);

      if (departmentDoc.exists()) {
        return departmentDoc.data().shortName || departmentDoc.data().name;
      }
      return 'Unknown Department';
    } catch (error) {
      console.error('Error fetching department name:', error);
      return 'Unknown Department';
    }
  }

  // Get note statistics for admin dashboard
  async getNoteStats() {
    try {
      const [pendingQuery, approvedQuery, rejectedQuery] = await Promise.all([
        getDocs(
          query(collection(db, this.notesCollection), where('status', '==', NOTE_STATUS.PENDING))
        ),
        getDocs(
          query(collection(db, this.notesCollection), where('status', '==', NOTE_STATUS.APPROVED))
        ),
        getDocs(
          query(collection(db, this.notesCollection), where('status', '==', NOTE_STATUS.REJECTED))
        ),
      ]);

      return {
        pending: pendingQuery.size,
        approved: approvedQuery.size,
        rejected: rejectedQuery.size,
        total: pendingQuery.size + approvedQuery.size + rejectedQuery.size,
      };
    } catch (error) {
      console.error('Error fetching note stats:', error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }

  // Bulk approve multiple notes
  async bulkApproveNotes(noteIds, reviewedBy) {
    try {
      const promises = noteIds.map((noteId) => this.approveNote(noteId, { reviewedBy }));

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error bulk approving notes:', error);
      throw new Error('Failed to bulk approve notes');
    }
  }

  // Bulk reject multiple notes
  async bulkRejectNotes(noteIds, reason) {
    try {
      const promises = noteIds.map((noteId) => this.rejectNote(noteId, reason));

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error bulk rejecting notes:', error);
      throw new Error('Failed to bulk reject notes');
    }
  }
}

// Create singleton instance
export const adminNotesService = new AdminNotesService();
