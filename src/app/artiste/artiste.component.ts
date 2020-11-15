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

export interface Artiste {
  name: string;
  bio: string;
  commentaire: string;
  nomNaissance: string;
  nbrEnfant: number;
  epouse: string;
  anneeNaissance: Date;
  genresMusicaux: string[];
  image: string;
}

export interface Band {
  name: string;
  bio: string;
  commentaire: string;
  anneeDebut: Date;
  lieuOrigine: string;
  villeOrigine: string;
  genresMusicaux: string[];
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

  artiste: Artiste = null;
  band: Band = null;
  artistesAssocies: any[];
  bandesAssocies: any[];
  albums: Array<Album> = [];
  albumsCharges: Promise<Boolean>;
  image: string;

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    const headersSpotify = new HttpHeaders({
      "Authorization": "Basic ZDYyOTQyNjA3MmRmNDI4ZTg5YzJkMDJmNjhiOTEyYWU6OTIzMTVmMGEzY2M1NGFiOTg0NWRlNGNhYTg5MGZjMTA=",
      "Content-Type": "application/x-www-form-urlencoded",
    });
    this.httpClient.post('https://accounts.spotify.com/api/token','grant_type=client_credentials', {headers:headersSpotify}).toPromise()
    .then((response) => {
      this.bearerToken = (response as any).access_token;
      this.headers = this.headers.append('Authorization',`Bearer ${this.bearerToken}`);
      return this.bearerToken;
    })
    .then(() => this.initialiserApplication())
    .catch((error) => console.log('Erreur',error));
    
  }
  initialiserApplication() {
    /* Initializing variables and request */
    this.nomArtiste = this.route.snapshot.params.nomArtiste;

    let nom: string[] = this.nomArtiste.split(' ');
    for(let mot of nom) {
      nom[nom.indexOf(mot)] = mot.charAt(0).toUpperCase() + mot.substring(1).toLowerCase();
    }
    this.nomArtiste = '';
    for(let mot of nom) {
      this.nomArtiste += mot;
      if(!(nom.indexOf(mot) === nom.length-1))
        this.nomArtiste += ' ';
    }

    const urlSpotifyArtist: string = 'https://api.spotify.com/v1/search?q=%20artist%3A'+ this.nomArtiste +'&type=artist&limit=1';
    //Fetch Image of artist : 
    this.httpClient.get(urlSpotifyArtist, {headers: this.headers})
    .subscribe((response) => {
      const urlImage = (response as any).artists.items[0]?.images[1]?.url;
      if(urlImage)
        this.image = urlImage;
    },
    (error) => console.log('Erreur : ' + error.message));

    // Fetching artist personal data
    const artisteRequete: string =
        'select distinct ?artiste ?name ?bio ?comment ?anneedebut ?lieuorigine ?villeorigine ?nomNaissance '
      + '?anneeNaissance ?nbenfants ?epouse GROUP_CONCAT(DISTINCT ?Genre_Music; SEPARATOR="|") AS ?genres '
      + 'where {'
      + '{'
      + '?artiste a dbo:Band .'
      + '?artiste foaf:name ?name .'
      + '?artiste dbo:abstract ?bio .'
      + '?artiste rdfs:comment ?comment.'
      + '?artiste dbo:activeYearsStartYear ?anneedebut.'
      + '?artiste dbo:genre ?Genre.'
      + '?Genre rdfs:label ?Genre_Music.'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en && lang(?bio)="en" && lang(?comment)="en" && lang(?Genre_Music)="en" ).'
      + 'optional{?artiste dbp:origin ?lieuorigine}.'
      + 'optional{?artiste dbo:hometown ?ville .'
      + '?ville foaf:name ?villeorigine .'
      + 'FILTER(lang(?villeorigine)="en"). }.'
      + '}'
      + 'UNION '
      + '{'
      + '?artiste a dbo:MusicalArtist .'
      + '?artiste foaf:name ?name .'
      + '?artiste dbo:abstract ?bio .'
      + '?artiste rdfs:comment ?comment.'
      + '?artiste dbo:birthDate ?anneeNaissance .'
      + '?album dbo:artist ?artiste.'
      + '?album dbo:genre ?genre_album.'
      + '?genre_album rdfs:label ?Genre_Music.'
      + 'FILTER(?name = "' + this.nomArtiste + '"@en && lang(?bio)="en" && lang(?comment)="en" && lang(?Genre_Music)="en").'
      + 'optional{?artiste dbo:birthName ?nomNaissance}.'
      + 'optional{?artiste dbp:spouse ?epouse}.'
      + 'optional{?artiste dbp:children ?nbenfants}.'
      + '}'
      + '}';

    // Deserialization artist data into variables
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(artisteRequete) + '&format=json').subscribe((response) => {
        const reponse = (response as any).results.bindings[0];
        if(reponse?.anneedebut) {
          this.band = {
            name: reponse.name.value,
            bio: reponse.bio.value,
            commentaire: reponse.comment.value,
            anneeDebut: reponse.anneedebut.value,
            lieuOrigine: reponse.lieuorigine?reponse.lieuorigine.value:null,
            villeOrigine: reponse.villeorigine?reponse.villeorigine.value:null,
            genresMusicaux: reponse.genres.value.split('|')
          };
        } else if (reponse?.anneeNaissance) {
          this.artiste = {
            name: reponse.name.value,
            bio: reponse.bio.value,
            commentaire: reponse.comment.value,
            nomNaissance: reponse.nomNaissance?reponse.nomNaissance.value:null,
            nbrEnfant: reponse.nbenfants?reponse.nbenfants.value:null,
            epouse: reponse.epouse?reponse.epouse.value:null,
            anneeNaissance: reponse.anneeNaissance.value,
            genresMusicaux: reponse.genres.value.split('|'),
            image: reponse.image?reponse.image:null
          };
        }
      }
    );

    //Fetching associated band and artist
    const associationRequete: string = 
        'select distinct '
      + 'GROUP_CONCAT(DISTINCT ?nameAssociatedArtist; SEPARATOR="|") AS ?nameAssociatedArtist '
      + 'GROUP_CONCAT(DISTINCT ?bandName; SEPARATOR="|") AS ?bandName '
      + 'where {'
      + '{'
      + '?groupe a dbo:Band .'
      + '?groupe foaf:name ?bandName .'
      + '?groupe dbo:associatedBand ?artisteAssocie .'
      + '?artisteAssocie foaf:name ?inputArtiste .'
      + 'FILTER(?inputArtiste = "Katy Perry"@en).'
      + '}'
      + 'UNION'
      + '{'
      + '?artiste a dbo:MusicalArtist .'
      + '?artiste foaf:name ?nameAssociatedArtist .'
      + '?artiste dbo:associatedBand ?artisteAssocie .'
      + '?artisteAssocie foaf:name ?inputArtiste .'
      + 'FILTER(?inputArtiste = "Katy Perry"@en).'
      + '}'
      + '}';

    this.httpClient.get(this.url + '&query=' + encodeURIComponent(associationRequete) + '&format=json').subscribe(
    (response) => {
      const reponse = (response as any).results.bindings[0];
      this.bandesAssocies = reponse.bandName.value.split('|').slice(0,10);
      this.artistesAssocies = reponse.nameAssociatedArtist.value.split('|').slice(0,10);
    });

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
          + 'FILTER(isLiteral(?title) && ?albumName = "' + albumName + '"@en && lang(?abstract)="en" && ?artiste = "'+ this.nomArtiste +'"@en).'
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
          + 'FILTER(?albumName = "' + albumName + '"@en && lang(?abstract)="en" && ?artiste = "' + this.nomArtiste +'"@en).'
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