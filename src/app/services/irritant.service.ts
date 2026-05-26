import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Irritant } from '../models/irritant.model';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, updateDoc,
  orderBy, query, onSnapshot
} from 'firebase/firestore';
import { environment } from '../../environements/environements';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

@Injectable({ providedIn: 'root' })
export class IrritantService {

  // Récupère tous les irritants en temps réel
  getAll(): Observable<Irritant[]> {
    return new Observable((observer) => {
      const ref = collection(db, 'irritants');
      const q = query(ref, orderBy('date', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const irritants = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Irritant[];
        observer.next(irritants);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  async updateStatut(id: string, statut: string): Promise<void> {
    const ref = doc(db, 'irritants', id);
    await updateDoc(ref, { statut });
  }
}