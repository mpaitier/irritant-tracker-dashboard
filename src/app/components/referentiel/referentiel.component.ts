import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReferentielService, ReferentielItem } from '../../services/referentiel.service';

interface Section {
  titre: string;
  collection: string;
  items: ReferentielItem[];
  nouveauNom: string;         // Champ pour ajouter un nouvel élément
  itemEnEdition: string | null; // ID de l'item en cours d'édition
  nomEdition: string;         // Valeur du champ d'édition
  chargement: boolean;
}

@Component({
  selector: 'app-referentiel',
  templateUrl: './referentiel.component.html',
  styleUrls: ['./referentiel.component.css'],
})
export class ReferentielComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Popup de confirmation de suppression
  popupSuppression: {
    visible: boolean;
    collection: string;
    id: string;
    nom: string;
  } = { visible: false, collection: '', id: '', nom: '' };

  sections: Section[] = [
    {
      titre: 'Lieux',
      collection: 'locations',
      items: [],
      nouveauNom: '',
      itemEnEdition: null,
      nomEdition: '',
      chargement: true,
    },
    {
      titre: "Types d'anomalie",
      collection: 'irritant_type',
      items: [],
      nouveauNom: '',
      itemEnEdition: null,
      nomEdition: '',
      chargement: true,
    },
  ];

  constructor(private referentielService: ReferentielService) {}

  ngOnInit(): void {
    this.sections.forEach(section => {
      const sub = this.referentielService.getAll(section.collection).subscribe({
        next: items => {
          section.items = items;
          section.chargement = false;
        },
        error: err => {
          console.error(`Erreur chargement ${section.collection}`, err);
          section.chargement = false;
        }
      });
      this.subscriptions.push(sub);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // Ajoute un nouvel élément
  async ajouter(section: Section): Promise<void> {
    if (!section.nouveauNom.trim()) return;
    await this.referentielService.ajouter(section.collection, section.nouveauNom);
    section.nouveauNom = '';
  }

  // Active le mode édition pour un item
  activerEdition(section: Section, item: ReferentielItem): void {
    section.itemEnEdition = item.id;
    section.nomEdition = item.Nom;
  }

  // Annule l'édition
  annulerEdition(section: Section): void {
    section.itemEnEdition = null;
    section.nomEdition = '';
  }

  // Sauvegarde le renommage
  async sauvegarderEdition(section: Section): Promise<void> {
    if (!section.itemEnEdition || !section.nomEdition.trim()) return;
    await this.referentielService.renommer(
      section.collection,
      section.itemEnEdition,
      section.nomEdition
    );
    section.itemEnEdition = null;
    section.nomEdition = '';
  }

  // Ouvre la popup de confirmation
  demanderSuppression(collection: string, item: ReferentielItem): void {
    this.popupSuppression = {
      visible: true,
      collection,
      id: item.id,
      nom: item.Nom,
    };
  }

  // Confirme la suppression
  async confirmerSuppression(): Promise<void> {
    await this.referentielService.supprimer(
      this.popupSuppression.collection,
      this.popupSuppression.id
    );
    this.popupSuppression.visible = false;
  }

  // Annule la suppression
  annulerSuppression(): void {
    this.popupSuppression.visible = false;
  }
}