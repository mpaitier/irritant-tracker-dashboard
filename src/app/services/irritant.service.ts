import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Irritant } from '../models/irritant.model';
import { Message } from '../models/message.model';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, updateDoc,
  orderBy, query, onSnapshot, addDoc
} from 'firebase/firestore';
import { environment } from '../../environements/environement';

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

  // Met à jour le statut et la date de modification
  async updateStatut(id: string, statut: string): Promise<void> {
    const ref = doc(db, 'irritants', id);
    await updateDoc(ref, {
      statut,
      updatedAt: new Date().toISOString(),
    });
  }

  // Écoute les messages d'un irritant en temps réel
  getMessages(irritantId: string): Observable<Message[]> {
    return new Observable((observer) => {
      const ref = collection(db, 'irritants', irritantId, 'messages');
      const q = query(ref, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        observer.next(messages);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  // Envoie un message
async envoyerMessage(irritantId: string, texte: string, auteur: string, uidAuteur: string): Promise<void> {
  const ref = collection(db, 'irritants', irritantId, 'messages');
  await addDoc(ref, {
    texte,
    auteur,
    uidAuteur,
    role: 'support',
    date: new Date().toISOString(),
  });
}
}