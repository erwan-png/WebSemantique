import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Album {
  name: string;
  abstract: string;
  genres: string[];
  releaseDate: Date;
  titles: string[];
  urlPhoto: string;
}

export interface Artist {
  name: string;
}

@Component({
  selector: 'app-artiste',
  templateUrl: './artiste.component.html',
  styleUrls: ['./artiste.component.scss']
})
export class ArtisteComponent implements OnInit {

  nomArtiste: string;
  url: string = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  //Bearer Token for Spotify app (used for getting image of albums and artist)
  bearerToken: string = 'BQDw-0ktIm1lqSIuvYx-dAA3rlwS10UfBObTUMPV6NoAwVk7WCHNlyH7Ec_aG1IPSSzjoKXf3GNMUI67txc';
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.bearerToken}`,
    'Accept': 'application/json'
  });

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
        const urlSpotify: string = 'https://api.spotify.com/v1/search?q=album%3A'+ albumName +'%20artist%3A'+ this.nomArtiste +'&type=album&limit=1';
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
        let genres: string [];
        let releaseDate: Date;
        let titles: string[];
        this.httpClient.get(this.url + '&query=' + encodeURIComponent(albumDataRequest) + '&format=json').subscribe((response) => {
          if (!((response as any).results.bindings[0] === undefined)) {
            resume = (response as any).results.bindings[0].abstract.value;
            genres = ((response as any).results.bindings[0].genreName.value).split('|');
            releaseDate = (response as any).results.bindings[0].releaseDate.value;
            titles = ((response as any).results.bindings[0].titles.value).split('|');
            const album: Album = {
              name: albumName,
              abstract: resume,
              genres: genres,
              releaseDate: releaseDate,
              titles: titles,
              urlPhoto: ''
            };
            //fetch Image : 
            this.httpClient.get(urlSpotify, {headers: this.headers})
            .subscribe((response) => {
              const urlImage = (response as any).albums.items[0]?.images[1].url;
              if(urlImage)
                album.urlPhoto = urlImage;
              this.albums.push(album);
            });
          }
        });
      }
    });
  }

}

