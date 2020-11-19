import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
              private sanitizer: DomSanitizer,
              private router: Router) {
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
    const nomInitial = this.route.snapshot.params.nomArtiste;
    this.nomArtiste = nomInitial;

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

    // Deserialization artist data into variables
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(this.getRequete(this.nomArtiste)) + '&format=json').subscribe((response) => {
        const reponse = (response as any).results.bindings[0];
        if(reponse) {
          const type = reponse?.labelType.value;
          if(type === 'Band') {
            this.band = {
              name: reponse.name.value,
              bio: reponse.bio.value,
              anneeDebut: reponse.anneedebut.value,
              lieuOrigine: reponse.lieuorigine?reponse.lieuorigine.value:null,
              villeOrigine: reponse.villeorigine?reponse.villeorigine.value:null,
              genresMusicaux: reponse.genres?.value.split('|')
            };
          } else if (type === 'musical artist') {
            this.artiste = {
              name: reponse.name.value,
              bio: reponse.bio.value,
              nomNaissance: reponse.nomNaissance?reponse.nomNaissance.value:null,
              nbrEnfant: reponse.nbenfants?reponse.nbenfants.value:null,
              epouse: reponse.epouse?reponse.epouse.value:null,
              anneeNaissance: reponse.anneeNaissance.value,
              genresMusicaux: reponse.genres?.value.split('|'),
              image: reponse.image?reponse.image:null
            };
          }
          this.pousuivreInitialisation();
        } else {
          this.nomArtiste = nomInitial;
          this.httpClient.get(this.url + '&query=' + encodeURIComponent(this.getRequete(this.nomArtiste)) + '&format=json').subscribe((response_bis) => {
            const reponse_bis = (response_bis as any).results.bindings[0];
            if(reponse_bis) {
              const type = reponse_bis?.labelType.value;
              if(type === 'Band') {
                this.band = {
                  name: reponse_bis.name.value,
                  bio: reponse_bis.bio.value,
                  anneeDebut: reponse_bis.anneedebut.value,
                  lieuOrigine: reponse_bis.lieuorigine?reponse_bis.lieuorigine.value:null,
                  villeOrigine: reponse_bis.villeorigine?reponse_bis.villeorigine.value:null,
                  genresMusicaux: reponse_bis.genres?.value.split('|')
                };
              } else if (type === 'musical artist') {
                this.artiste = {
                  name: reponse_bis.name.value,
                  bio: reponse_bis.bio.value,
                  nomNaissance: reponse_bis.nomNaissance?reponse_bis.nomNaissance.value:null,
                  nbrEnfant: reponse_bis.nbenfants?reponse_bis.nbenfants.value:null,
                  epouse: reponse_bis.epouse?reponse_bis.epouse.value:null,
                  anneeNaissance: reponse_bis.anneeNaissance?.value,
                  genresMusicaux: reponse_bis.genres?.value.split('|'),
                  image: reponse_bis.image?reponse_bis.image:null
                };
              }
              this.pousuivreInitialisation();
            } else {
              this.router.navigate(['not-found']);
            }
          });
        }
      }
    );
  }

  pousuivreInitialisation() {

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
      + 'FILTER(?inputArtiste = "'+ this.nomArtiste +'"@en).'
      + '}'
      + 'UNION'
      + '{'
      + '?artiste a dbo:MusicalArtist .'
      + '?artiste foaf:name ?nameAssociatedArtist .'
      + '?artiste dbo:associatedBand ?artisteAssocie .'
      + '?artisteAssocie foaf:name ?inputArtiste .'
      + 'FILTER(?inputArtiste = "'+ this.nomArtiste +'"@en).'
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

  getRequete(nomArtiste: string): string {
    return 'select distinct ?artiste ?labelType ?name ?bio ?anneedebut ?lieuorigine ?villeorigine ?nomNaissance '
    + '?anneeNaissance ?nbenfants ?epouse GROUP_CONCAT(DISTINCT ?Genre_Music; SEPARATOR="|") AS ?genres '
    + 'where {'
    + '{'
    + '?artiste a dbo:Band .'
    + '?artiste rdf:type ?typeAr .'
    + '?typeAr rdfs:label ?labelType .'
    + '?artiste foaf:name ?name .'
    + '?artiste dbo:abstract ?bio .'
    + '?artiste dbo:activeYearsStartYear ?anneedebut.'
    + 'FILTER(?name = "' + nomArtiste + '"@en && ?labelType = "Band"@en && lang(?bio)="en" ).'
    + 'optional {?artiste dbo:genre ?Genre.'
    + '?Genre rdfs:label ?Genre_Music.'
    + 'FILTER(lang(?Genre_Music)="en").}'
    + 'optional{?artiste dbp:origin ?lieuorigine}.'
    + 'optional{?artiste dbo:hometown ?ville .'
    + '?ville foaf:name ?villeorigine .'
    + 'FILTER(lang(?villeorigine)="en"). }.'
    + '}'
    + 'UNION '
    + '{'
    + '?artiste a dbo:MusicalArtist .'
    + '?artiste rdf:type ?typeAr .'
    + '?typeAr rdfs:label ?labelType .'
    + '?artiste foaf:name ?name .'
    + '?artiste dbo:abstract ?bio .'
    + 'FILTER(?name = "' + nomArtiste + '"@en && ?labelType = "musical artist"@en && lang(?bio)="en").'
    + 'optional{?artiste dbo:birthDate ?anneeNaissance .}.'
    + 'optional{?artiste dbo:birthName ?nomNaissance}.'
    + 'optional{?artiste dbp:spouse ?epouse}.'
    + 'optional{?artiste dbp:children ?nbenfants}.'
    + 'optional{?album a dbo:Album .'
    + '?album dbo:artist ?artiste.'
    + '?album dbo:genre ?genre_album.'
    + '?genre_album rdfs:label ?Genre_Music.'
    + 'FILTER(lang(?Genre_Music)="en")}'
    + '}'
    + '}';
  }
} 