import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  getFirestore, collection, onSnapshot,
  addDoc, query, orderBy, doc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environements/environements';
import { Message } from '../models/message.model';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

@Injectable({ providedIn: 'root' })
export class MessageService {

  // Écoute les messages d'un irritant en temps réel
  getMessages(irritantId: string): Observable<Message[]> {
    return new Observable(observer => {
      const ref = collection(db, 'irritants', irritantId, 'messages');
      const q = query(ref, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as Message[];
        observer.next(messages);
      }, error => observer.error(error));

      return () => unsubscribe();
    });
  }

  // Envoie un message dans la sous-collection
  async envoyerMessage(irritantId: string, message: Omit<Message, 'id'>): Promise<void> {
    const ref = collection(db, 'irritants', irritantId, 'messages');
    await addDoc(ref, message);
  }
}