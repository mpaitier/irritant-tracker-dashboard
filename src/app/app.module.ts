import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { StatsComponent } from './components/stats/stats.component';
import { RecentChangesComponent } from './components/recent-changes/recent-changes.component';
import { ReferentielComponent } from './components/referentiel/referentiel.component';

@NgModule({
  declarations: [
    AppComponent,
    KanbanComponent,
    StatsComponent,
    RecentChangesComponent,
    ReferentielComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}