import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-artiste',
  templateUrl: './artiste.component.html',
  styleUrls: ['./artiste.component.scss']
})
export class ArtisteComponent implements OnInit {

  nomArtiste: string;
  url = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  bio: string;
  nom: string;
  listeAlbum: Array<string> = [];


  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient) { }

  ngOnInit(): void {
    /* Initializing variables and request */
    this.nomArtiste = this.route.snapshot.params.nomArtiste;

    // Fetching artist personal data
    const artisteRequete: string =
      'select distinct ?name ?bio where {'
      + '?artiste a dbo:MusicalArtist .'
      + '?artiste foaf:name ?name .'
      + '?artiste dbo:abstract ?bio .'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en && lang(?bio)="en" ).'
      + '}';
    // Deserialization artist data into variables
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(artisteRequete) + '&format=json').subscribe((response) => {
        this.bio = (response as any).results.bindings[0].bio.value;
        this.nom = (response as any).results.bindings[0].name.value;
      }
    );

    // Fetching album name
    const albumListeRequete: string =
      'select distinct ?albumName where{'
      + '?album a dbo:Album .'
      + '?album foaf:name ?albumName .'
      + '?album dbo:artist ?artist .'
      + '?artist foaf:name ?name .'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en) .'
      + '} ';

    // Deserialization album list into variables
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(albumListeRequete) + '&format=json').subscribe((response) => {
      // this.listeAlbum.push((response as any).results.bindings.map(album => album.albumName.value));
       for (const album of (response as any).results.bindings){
         this.listeAlbum.push(album.albumName.value);
       }
      }
    );
    console.log(this.listeAlbum);
  }

}

