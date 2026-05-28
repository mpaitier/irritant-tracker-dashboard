import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, OnChanges, ViewChild, ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Irritant } from '../../models/irritant.model';
import { Message } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { IrritantService } from '../../services/irritant.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export class TicketDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ticket!: Irritant;
  @Output() fermer = new EventEmitter<void>();
  @Output() statutChange = new EventEmitter<string>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  nouveauMessage = '';
  envoi = false;
  private subscription: Subscription | null = null;

  statuts = [
    { id: 'Ouvert',             couleur: '#9E9E9E' },
    { id: 'En attente',         couleur: '#42A5F5' },
    { id: 'En cours',           couleur: '#FFA726' },
    { id: 'Attente de réponse', couleur: '#AB47BC' },
    { id: 'Fini',               couleur: '#66BB6A' },
    { id: 'Annulé',             couleur: '#EF5350' },
  ];

  constructor(
    private messageService: MessageService,
    private irritantService: IrritantService,
  ) {}

  ngOnInit(): void {
    this.chargerMessages();
  }

  ngOnChanges(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.chargerMessages();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private chargerMessages(): void {
    if (!this.ticket?.id) return;

    this.subscription = this.messageService.getMessages(this.ticket.id).subscribe({
      next: messages => {
        this.messages = messages.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setTimeout(() => this.scrollerEnBas(), 50);
      },
      error: err => console.error('Erreur messages :', err)
    });
  }

  private scrollerEnBas(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  async changerStatut(statut: string): Promise<void> {
    if (!this.ticket.id || statut === this.ticket.statut) return;
    await this.irritantService.updateStatut(this.ticket.id, statut);
    this.ticket.statut = statut;
    this.statutChange.emit(statut);
  }

  async envoyerMessage(): Promise<void> {
    if (!this.nouveauMessage.trim() || !this.ticket.id) return;

    this.envoi = true;

    await this.messageService.envoyerMessage(this.ticket.id, {
      texte: this.nouveauMessage.trim(),
      auteur: 'Support',
      uidAuteur: 'admin',
      role: 'support',
      date: new Date().toISOString(),
    });

    this.nouveauMessage = '';
    this.envoi = false;
    setTimeout(() => this.scrollerEnBas(), 100);
  }

  // Ouvre la photo dans un nouvel onglet
  ouvrirPhoto(url: string): void {
    window.open(url, '_blank');
  }

  couleurStatut(statut: string): string {
    return this.statuts.find(s => s.id === statut)?.couleur ?? '#9E9E9E';
  }

  couleurPriorite(priorite: string): string {
    const p = parseInt(priorite ?? '5');
    if (p <= 3) return '#66BB6A';
    if (p <= 6) return '#FFA726';
    return '#EF5350';
  }

  formaterDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formaterHeure(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  fermerPopup(): void {
    this.fermer.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.fermerPopup();
    }
  }
}