import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IrritantService } from '../../services/irritant.service';
import { Irritant } from '../../models/irritant.model';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent implements OnInit {
  colonnes = [
    { id: 'Annulé', label: 'Annulé', couleur: '#EF5350', tickets: [] as Irritant[] },
    { id: 'Ouvert', label: 'Ouvert', couleur: '#9E9E9E', tickets: [] as Irritant[] },
    { id: 'En attente', label: 'En attente', couleur: '#42A5F5', tickets: [] as Irritant[] },
    { id: 'En cours', label: 'En cours', couleur: '#FFA726', tickets: [] as Irritant[] },
    { id: 'Attente réponse', label: 'Attente réponse', couleur: '#AB47BC', tickets: [] as Irritant[] },
    { id: 'Fini', label: 'Fini', couleur: '#66BB6A', tickets: [] as Irritant[] },
  ];

  // Ticket sélectionné pour le popup
  ticketSelectionne: Irritant | null = null;

  get colonneIds(): string[] {
    return this.colonnes.map(c => c.id);
  }

  constructor(private irritantService: IrritantService) {}

  ngOnInit(): void {
    this.irritantService.getAll().subscribe(irritants => {
      this.colonnes.forEach(c => c.tickets = []);
      irritants.forEach(irritant => {
        const colonne = this.colonnes.find(c => c.id === irritant.statut);
        if (colonne) {
          colonne.tickets.push(irritant);
        } else {
          this.colonnes[1].tickets.push(irritant);
        }
      });
    });
  }
  
  drop(event: CdkDragDrop<Irritant[]>, nouvelleColonne: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const ticket = event.container.data[event.currentIndex];
      if (ticket.id) {
        this.irritantService.updateStatut(ticket.id, nouvelleColonne);
        ticket.statut = nouvelleColonne;
      }
    }
  }

  // Couleur en fonction de la priorité
  prioriteCouleur(priorite: string): string {
    const p = parseInt(priorite);
    if (p <= 3) return '#66BB6A';
    if (p <= 6) return '#FFA726';
    return '#EF5350';
  }

  // Ouvre le popup
  ouvrirTicket(ticket: Irritant): void {
    this.ticketSelectionne = ticket;
  }

  // Ferme le popup
  fermerTicket(): void {
    this.ticketSelectionne = null;
  }

  // Met à jour le statut depuis le popup
  onStatutChange(ticket: Irritant, nouveauStatut: string): void {
    ticket.statut = nouveauStatut;
  }
}