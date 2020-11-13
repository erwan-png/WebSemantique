import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Album {
  name: string;
  abstract: string;
  genres: string[];
  releaseDate: Date;
  titles: string[];
  urlPhoto: string;
  extraitMusique: SafeResourceUrl;
}

export interface Artist {
  name: string;
  bio: string;
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
  bearerToken: string;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  bio: string;
  nom: string;
  imageArtiste: string;
  albums: Array<Album> = [];
  albumsCharges: Promise<Boolean>;

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    const headersSpotify = new HttpHeaders({
      "Authorization": "Basic ZDYyOTQyNjA3MmRmNDI4ZTg5YzJkMDJmNjhiOTEyYWU6OTIzMTVmMGEzY2M1NGFiOTg0NWRlNGNhYTg5MGZjMTA=",
      "Content-Type": "application/x-www-form-urlencoded",
    });
    this.httpClient.post('https://accounts.spotify.com/api/token','grant_type=client_credentials', {headers:headersSpotify}).toPromise().then((response) => {
      this.bearerToken = (response as any).access_token;
      this.headers = this.headers.append('Authorization',`Bearer ${this.bearerToken}`);
      return this.bearerToken;
    })
    .then((value) => this.initialiserApplication())
    .catch((error) => console.log('Erreur',error));
    
  }
  initialiserApplication() {
    /* Initializing variables and request */
    this.nomArtiste = this.route.snapshot.params.nomArtiste;

    const urlSpotifyArtist: string = 'https://api.spotify.com/v1/search?q=%20artist%3A'+ this.nomArtiste +'&type=artist&limit=1';
    //Fetch Image of artist : 
    this.httpClient.get(urlSpotifyArtist, {headers: this.headers})
    .subscribe((response) => {
      const urlImage = (response as any).artists.items[0]?.images[1].url;
      if(urlImage)
        this.imageArtiste = urlImage;
    },
    (error) => console.log('Erreur : ' + error.message));

    // Fetching artist personal data
    const artisteRequete: string =
      'select distinct ?name ?bio where {'
      + '{'
      + '?artiste a dbo:MusicalArtist .'
      + '?artiste foaf:name ?name .'
      + '?artiste dbo:abstract ?bio .'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en && lang(?bio)="en" ).'
      + '}'
      + 'UNION'
      + '{'
      + '?artiste a dbo:Band .'
      + '?artiste foaf:name ?name .'
      + '?artiste dbo:abstract ?bio .'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en && lang(?bio)="en" ).'
      + '}'
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
      //console.log(listeAlbum);
      let acc:number = 0;
      for (const albumName of listeAlbum) {
        const urlSpotifyAlbum: string = 'https://api.spotify.com/v1/search?q=album%3A'+ albumName +'%20artist%3A'+ this.nomArtiste +'&type=album&limit=1';
        // album data
        const albumDataRequest: string =
          'select distinct ?abstract GROUP_CONCAT(DISTINCT ?genreName; SEPARATOR="|") as ?genreName ?releaseDate GROUP_CONCAT(DISTINCT ?title; SEPARATOR="|") as ?titles where'
          + '{'
          + '{'
          + '?album a dbo:Album .'
          + '?album foaf:name ?albumName .'
          + '?album dbo:abstract ?abstract .'
          + '?album dbo:releaseDate ?releaseDate .'
          + '?album dbp:title ?title .'
          + '?album dbo:artist ?ar .'
          + '?ar foaf:name ?artiste .'
          + 'FILTER(isLiteral(?title) && ?albumName = "' + albumName + '"@en && lang(?abstract)="en" && ?artiste = "'+ this.nomArtiste +'@en").'
          + 'optional {'
          + '?album dbo:genre ?genre .'
          + '?genre rdfs:label ?genreName .'
          + 'FILTER(lang(?genreName)="en") .'
          + '}.'
          + '}'
          + 'UNION'
          + '{'
          + '?album a dbo:Album .'
          + '?album foaf:name ?albumName .'
          + '?album dbo:abstract ?abstract .'
          + '?album dbo:releaseDate ?releaseDate .'
          + '?album dbp:title ?titleType .'
          + '?titleType a dbo:Single .'
          + '?titleType foaf:name ?title.'
          + '?album dbo:artist ?ar .'
          + '?ar foaf:name ?artiste .'
          + 'FILTER(?albumName = "' + albumName + '"@en && lang(?abstract)="en" && ?artiste = "' + this.nomArtiste +'@en").'
          + 'optional{'
          + '?album dbo:genre ?genre .'
          + '?genre rdfs:label ?genreName .'
          + 'FILTER(lang(?genreName)="en") .'
          + '}.'
          + '}'
          + '}';

        let resume: string;
        let genres: string [];
        let releaseDate: Date;
        let titles: string[];
        acc++;

        this.httpClient.get(this.url + '&query=' + encodeURIComponent(albumDataRequest) + '&format=json').subscribe((response) => {
          console.log(albumName,response)
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
              urlPhoto: '',
              extraitMusique: ''
            };
            //Fetch Images of album : 
            this.httpClient.get(urlSpotifyAlbum, {headers: this.headers})
            .subscribe((response) => {
              const urlImage = (response as any).albums.items[0]?.images[1].url;
              const extrait = (response as any).albums.items[0]?.id;
              if(urlImage)
                album.urlPhoto = urlImage;
              this.albums.push(album);
              if(extrait)
                album.extraitMusique = this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed/album/'+extrait);
              if(listeAlbum.length === acc && !this.albumsCharges) {
                this.albumsCharges = Promise.resolve(true);
              }
            },
            (error) => console.log('Erreur : ' + error.message));
          }
        });
      }
    });
  }
}

