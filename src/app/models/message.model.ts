export interface Message {
  id: string;
  texte: string;
  auteur: string;
  uidAuteur: string;
  role: string; // 'employe' ou 'support'
  date: string;
}