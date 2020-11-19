import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button'; 
import { MatRadioModule } from '@angular/material/radio'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RechercheComponent } from './recherche/recherche.component';
import { ArtisteComponent } from './artiste/artiste.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GenreComponent } from './genre/genre.component';
import { TriAlbumPipe } from './tri-album.pipe';
import {MatTableModule} from '@angular/material/table'; 
import { ChansonComponent } from './chanson/chanson.component';
import { FourOhFourComponent } from './four-oh-four/four-oh-four.component';

@NgModule({
  declarations: [
    AppComponent,
    RechercheComponent,
    ArtisteComponent,
    GenreComponent,
    TriAlbumPipe,
    ChansonComponent,
    FourOhFourComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatTableModule,
    MatRadioModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
