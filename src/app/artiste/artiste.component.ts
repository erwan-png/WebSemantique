import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface PhotoAlbum {
  url: string,
  album: string
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
  bearerToken: string = 'BQCsTFUncNiz3bzsUeAyHuiLLGblqjiEugKW2crM2W4meAAN1oOP_WsqKi31UCLo9_3uVv6Z-ZFzS-n8kOs';
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.bearerToken}`,
    'Accept': 'application/json'
  });
  photosAlbums: PhotoAlbum[] = [];

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
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(albumListeRequete) + '&format=json')
    .subscribe((response) => {
      this.listeAlbum = ((response as any).results.bindings.map((album)=> album.albumName.value));
      for(let album of this.listeAlbum)
      this.getImagesOfAlbum(album,this.nomArtiste);
      }
    );
  }

  // Get image
  getImagesOfAlbum(albumNom: string, artisteNom: string) {
    const urlImage: string = 'https://api.spotify.com/v1/search?q=album%3A'+ albumNom +'%20artist%3A'+ artisteNom +'&type=album&limit=1';
    this.httpClient.get(urlImage, {headers: this.headers})
    .subscribe((response) => {
        const urlImage = (response as any).albums.items[0]?.images[1].url
        if(urlImage)
          this.photosAlbums.push({url: urlImage, album: albumNom});
      }
    );
  }

}

