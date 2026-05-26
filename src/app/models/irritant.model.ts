export interface Irritant {
  id?: string;
  nom: string;
  nomReel: string;
  uidAuteur: string;
  titre: string;
  lieu: string;
  type: string; 
  description: string;
  priorite: string;
  statut: string;
  date: string;
  photosUrls: string[];
  [key: string]: any; // Permet l'indexation dynamique sans erreur TS
}