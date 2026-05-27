import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  getFirestore, collection, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environements/environements';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

export interface ReferentielItem {
  id: string;
  Nom: string;
}

@Injectable({ providedIn: 'root' })
export class ReferentielService {

  // Écoute une collection en temps réel
  getAll(collectionName: string): Observable<ReferentielItem[]> {
    return new Observable(observer => {
      const ref = collection(db, collectionName);
      const q = query(ref, orderBy('Nom'));

      const unsubscribe = onSnapshot(q, snapshot => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          Nom: d.data()['Nom'] as string,
        }));
        observer.next(items);
      }, error => observer.error(error));

      return () => unsubscribe();
    });
  }

  // Ajoute un élément
  async ajouter(collectionName: string, nom: string): Promise<void> {
    const ref = collection(db, collectionName);
    await addDoc(ref, { Nom: nom.trim() });
  }

  // Renomme un élément
  async renommer(collectionName: string, id: string, nouveauNom: string): Promise<void> {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { Nom: nouveauNom.trim() });
  }

  // Supprime un élément
  async supprimer(collectionName: string, id: string): Promise<void> {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
  }
}