import { Routes } from '@angular/router';
import { EnigmaPageComponent } from './features/enigma/enigma-page/enigma-page.component';
import { FinalComponent } from './features/final/final/final.component';

export const routes: Routes = [
  { path: '', redirectTo: 'enigma/1', pathMatch: 'full' },
  { path: 'enigma/:id', component: EnigmaPageComponent },
  { path: 'final', component: FinalComponent }
];
