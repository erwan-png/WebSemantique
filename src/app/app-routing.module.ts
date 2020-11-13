import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtisteComponent } from './artiste/artiste.component';
import { RechercheComponent } from './recherche/recherche.component';
import { GenreComponent } from './genre/genre.component';
import {ChansonComponent} from './chanson/chanson.component';


const routes: Routes = [
  { path: '', component: RechercheComponent},
  { path: 'recherche', component: RechercheComponent},
  { path: 'recherche-artiste/:nomArtiste', component: ArtisteComponent },
  { path: 'recherche-genre/:nomGenre', component: GenreComponent },
  { path: 'recherche-chanson/:nomChanson', component: ChansonComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
