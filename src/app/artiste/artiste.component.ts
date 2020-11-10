import {Component, OnInit, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';


export interface Album {
  name: string;
  abstract: string;
  genre: string;
  releaseDate: Date;
  titles: string;
}


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
  albums: Array<Album> = [];


  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient) {
  }

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
      }
    );

    // Fetching album data
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
        const listeAlbum = (response as any).results.bindings.map(album => album.albumName.value);
        for (const albumName of listeAlbum) {
          // album data
          const albumDataRequest: string =
            'select distinct ?abstract GROUP_CONCAT(DISTINCT ?genreName; SEPARATOR="|") as ?genreName ?releaseDate GROUP_CONCAT(DISTINCT ?title; SEPARATOR="|") as ?titles where'
            + '{'
            + '{'
            + '?album a dbo:Album .'
            + '?album foaf:name ?albumName .'
            + '?album dbo:abstract ?abstract .'
            + '?album dbo:genre ?genre .'
            + '?genre rdfs:label ?genreName .'
            + '?album dbo:releaseDate ?releaseDate .'
            + '?album dbp:title ?title .'
            + 'FILTER(isLiteral(?title) && ?albumName = "' + albumName + '"@en && lang(?abstract)="en" && lang(?genreName)="en").'
            + '}'
            + 'UNION'
            + '{'
            + '?album a dbo:Album .'
            + '?album foaf:name ?albumName .'
            + '?album dbo:abstract ?abstract .'
            + '?album dbo:genre ?genre .'
            + '?genre rdfs:label ?genreName .'
            + '?album dbo:releaseDate ?releaseDate .'
            + '?album dbp:title ?titleType .'
            + '?titleType a dbo:Single .'
            + '?titleType foaf:name ?title.'
            + 'FILTER(?albumName = "' + albumName + '"@en && lang(?abstract)="en" && lang(?genreName)="en").'
            + '}'
            + '}';
          let resume: string;
          let genre: string;
          let releaseDate: Date;
          let titles: string;
          this.httpClient.get(this.url + '&query=' + encodeURIComponent(albumDataRequest) + '&format=json').subscribe((response) => {
              if (!((response as any).results.bindings[0] === undefined)) {
                resume = (response as any).results.bindings[0].abstract.value;
                genre = (response as any).results.bindings[0].genreName.value;
                releaseDate = (response as any).results.bindings[0].releaseDate.value;
                titles = (response as any).results.bindings[0].titles.value;
                const album: Album = {
                  name: albumName,
                  abstract: resume,
                  genre: genre,
                  releaseDate: releaseDate,
                  titles: titles
                };
                this.albums.push(album);
              }
            }
          );
        }
      }
    );
  }

}

