import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { TimesheetData } from '../models/timesheet.model';

export interface SavedTimesheet extends TimesheetData {
  id: string;
  savedAt: Date;
  totalHours: number;
  totalPay: number;
  hourlyRate: number;
}

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;

  constructor() {
    // Reuse existing Firebase app instance if already initialised
    this.app = getApps().length
      ? getApps()[0]
      : initializeApp(environment.firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  /** Exchange Google One Tap credential for a Firebase Auth session */
  async signInWithGoogleCredential(idToken: string): Promise<string> {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(this.auth, credential);
    return result.user.uid;
  }

  /** Sign out of Firebase Auth */
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  // ── Calculation helpers ──────────────────────────────────────────────────

  private timeToMinutes(time: string): number {
    if (!time) return 0;
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  private calcPairMinutes(inTime: string, outTime: string): number {
    if (!inTime || !outTime) return 0;
    const diff = this.timeToMinutes(outTime) - this.timeToMinutes(inTime);
    return diff > 0 ? diff : 0;
  }

  private calcTotalMinutes(timesheet: TimesheetData): number {
    return timesheet.entries.reduce((total, entry) => {
      const pairs = [
        [entry.inTime1, entry.outTime1],
        [entry.inTime2, entry.outTime2],
        [entry.inTime3, entry.outTime3]
      ];
      return total + pairs.reduce((sum, [i, o]) => sum + this.calcPairMinutes(i, o), 0);
    }, 0);
  }

  /**
   * Save a timesheet under the signed-in user's collection.
   * Document ID is the employee's name (e.g. "John_Smith"), overwriting any
   * previous save for the same employee.
   */
  async saveTimesheet(userId: string, timesheet: TimesheetData, hourlyRate: number = 21): Promise<string> {
    const safeName = (timesheet.name ?? 'unknown').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const totalHours = parseFloat((this.calcTotalMinutes(timesheet) / 60).toFixed(2));
    const totalPay   = parseFloat((totalHours * hourlyRate).toFixed(2));

    const ref = doc(this.db, 'users', userId, 'timesheets', safeName);
    await setDoc(ref, {
      ...timesheet,
      totalHours,
      totalPay,
      hourlyRate,
      savedAt: Timestamp.now()
    });
    return safeName;
  }

  /**
   * Load all timesheets saved by the signed-in user.
   * Returns them sorted newest-first.
   */
  async loadTimesheets(userId: string): Promise<SavedTimesheet[]> {
    const col = collection(this.db, 'users', userId, 'timesheets');
    const snapshot = await getDocs(col);

    const results: SavedTimesheet[] = snapshot.docs.map(
      (d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data();
        return {
          ...(data as TimesheetData),
          id: d.id,
          savedAt: (data['savedAt'] as Timestamp).toDate(),
          totalHours: data['totalHours'] ?? 0,
          totalPay:   data['totalPay']   ?? 0,
          hourlyRate: data['hourlyRate'] ?? 21
        };
      }
    );

    // Newest first
    results.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
    return results;
  }

  /**
   * Delete a single saved timesheet by its document ID.
   */
  async deleteTimesheet(userId: string, timesheetId: string): Promise<void> {
    const ref = doc(this.db, 'users', userId, 'timesheets', timesheetId);
    await deleteDoc(ref);
  }
}
