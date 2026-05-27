import { Component, OnInit } from '@angular/core';
import { IrritantService } from '../../services/irritant.service';
import { Irritant } from '../../models/irritant.model';
import { Message } from '../../models/message.model';

interface IrritantAvecMessages extends Irritant {
  dernierMessage?: Message;
}

@Component({
  selector: 'app-recent-changes',
  templateUrl: './recent-changes.component.html',
  styleUrls: ['./recent-changes.component.css'],
})
export class RecentChangesComponent implements OnInit {
  recentIrritants: IrritantAvecMessages[] = [];
  nouveauMessage: { [id: string]: string } = {};

  constructor(private irritantService: IrritantService) {}

  ngOnInit(): void {
    this.irritantService.getAll().subscribe((irritants) => {
      this.recentIrritants = [];

      irritants.forEach((irritant) => {
        this.irritantService.getMessages(irritant.id!).subscribe((messages) => {
          if (messages.length === 0) return;

          // Trie tous les messages par date
          const sorted = [...messages].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Si le dernier message est du support → ticket traité, on n'affiche pas
          if (sorted[0].role === 'support') {
            const idx = this.recentIrritants.findIndex(i => i.id === irritant.id);
            if (idx !== -1) this.recentIrritants.splice(idx, 1);
            return;
          }

          // Sinon le dernier message est de l'employé → on affiche
          const dernierMessage = sorted[0];
          const item: IrritantAvecMessages = { ...irritant, dernierMessage };

          const idx = this.recentIrritants.findIndex(i => i.id === irritant.id);
          if (idx !== -1) {
            this.recentIrritants[idx] = item;
          } else {
            this.recentIrritants.push(item);
          }

          this.recentIrritants = this.recentIrritants
            .sort((a, b) => new Date(b.dernierMessage!.date).getTime() - new Date(a.dernierMessage!.date).getTime())
            .slice(0, 5);
        });
      });
    });
  }

  formaterDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }) + ' · ' + d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  couleurStatut(statut: string): string {
    const map: Record<string, string> = {
      'Ouvert': '#9E9E9E',
      'En attente': '#42A5F5',
      'En cours': '#FFA726',
      'Attente de réponse': '#AB47BC',
      'Fini': '#66BB6A',
      'Annulé': '#EF5350',
    };
    return map[statut] ?? '#9E9E9E';
  }

  couleurRole(role: string): string {
    return role === 'support' ? '#5c35d4' : '#42A5F5';
  }

  async envoyer(irritantId: string): Promise<void> {
    const texte = this.nouveauMessage[irritantId]?.trim();
    if (!texte) return;
    await this.irritantService.envoyerMessage(irritantId, texte, 'Admin', 'admin');
    this.nouveauMessage[irritantId] = '';
  }
}