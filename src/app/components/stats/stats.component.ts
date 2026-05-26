import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { IrritantService } from '../../services/irritant.service';
import { Irritant } from '../../models/irritant.model';

Chart.register(...registerables);

const COULEURS_STATUT: Record<string, string> = {
  'Ouvert': '#9E9E9E', 'En attente': '#42A5F5', 'En cours': '#FFA726',
  'Fini': '#66BB6A', 'Annulé': '#EF5350',
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  // standalone: true et imports: [...] supprimés
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  
  private subscription: Subscription | null = null;
  private chart: Chart | null = null;
  private irritants: Irritant[] = [];

  axeActuel: 'lieu' | 'type' = 'lieu';
  chargement = true;
  erreur = false;

  constructor(private irritantService: IrritantService) {}

  ngOnInit(): void {
    this.subscription = this.irritantService.getAll().subscribe({
      next: (data) => {
        this.irritants = data;
        this.chargement = false;
        if (this.chart) this.mettreAJourChart();
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
      }
    });
  }

  ngAfterViewInit(): void {
    this.creerChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription?.unsubscribe();
  }

  changerAxe(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.axeActuel = target.value as 'lieu' | 'type';
    this.mettreAJourChart();
  }

  private construireDatasets() {
    const labels = [...new Set(this.irritants.map(i => i[this.axeActuel] as string))].sort();
    const statuts = [...new Set(this.irritants.map(i => i.statut))];

    const datasets = statuts.map(statut => ({
      label: statut,
      data: labels.map(lbl => this.irritants.filter(i => i[this.axeActuel] === lbl && i.statut === statut).length),
      backgroundColor: COULEURS_STATUT[statut] ?? '#9E9E9E',
      borderRadius: 4,
    }));
    return { labels, datasets };
  }

  private creerChart(): void {
    const { labels, datasets } = this.construireDatasets();
    this.chart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });
  }

  private mettreAJourChart(): void {
    if (!this.chart) return;
    const { labels, datasets } = this.construireDatasets();
    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets;
    this.chart.update();
  }
}