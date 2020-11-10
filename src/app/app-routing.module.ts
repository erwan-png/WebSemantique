import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtisteComponent } from './artiste/artiste.component';
import { RechercheComponent } from './recherche/recherche.component';


const routes: Routes = [
  { path: '', component: RechercheComponent},
  { path: 'recherche', component: RechercheComponent},
  { path:'recherche-artiste/:nomArtiste', component: ArtisteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
