import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';

export interface Song{
  name: string;
  duration: number; // in sec
  bio: string;
  releaseDate: Date;
  genres: string[];
  relatedAlbum: string [];
  artists: string [];
  writers: string;
}
@Component({
  selector: 'app-chanson',
  templateUrl: './chanson.component.html',
  styleUrls: ['./chanson.component.scss']
})
export class ChansonComponent implements OnInit {
  url = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  redirectGenreUrl = 'http://localhost:4200/recherche-genre/';
  redirectArtisteUrl = 'http://localhost:4200/recherche-artiste/';
  nomChanson: string;
  chanson: Song;

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.nomChanson = this.route.snapshot.params.nomChanson;
    const songRequest =
      'select distinct\n' +
      '?name\n' +
      '?duration\n' +
      '?bio\n' +
      '?date\n' +
      'GROUP_CONCAT(DISTINCT ?album; SEPARATOR="|") as ?album\n' +
      'GROUP_CONCAT(DISTINCT ?genres; SEPARATOR="|") as ?genres\n' +
      'GROUP_CONCAT(DISTINCT ?artists ; SEPARATOR="|") as ?artists \n' +
      'GROUP_CONCAT(DISTINCT ?writers ; SEPARATOR="|") as ?writers \n' +
      'where {\n' +
      '?song a dbo:Song .\n' +
      '?song foaf:name ?name .\n' +
      '?song dbo:runtime ?duration .\n' +
      '?song dbo:abstract ?bio .\n' +
      '?song dbo:releaseDate ?date .\n' +
      '?song dbo:genre ?g .\n' +
      '?g foaf:name ?genres .\n' +
      '?song dbo:artist ?ar .\n' +
      '?ar foaf:name ?artists . \n' +
      '?song dbo:writer ?w .\n' +
      '?w foaf:name ?writers .\n' +
      '?al a dbo:Album .\n' +
      '?al foaf:name ?album .\n' +
      '?al dbp:title ?titles .\n' +
      '?titles foaf:name ?titleName .\n' +
      'FILTER(?name="' + this.nomChanson + '"@en && ?titleName="' + this.nomChanson + '"@en && lang(?bio)="en") .\n' +
      '}';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(songRequest) + '&format=json').subscribe((response) => {
      const name = (response as any).results.bindings[0].name.value;
      const bio = (response as any).results.bindings[0].bio.value;
      const artists = ((response as any).results.bindings[0].artists.value).split('|');
      const date = (response as any).results.bindings[0].date.value;
      const duration = (response as any).results.bindings[0].duration.value;
      const genres = ((response as any).results.bindings[0].genres.value).split('|');
      const writers = ((response as any).results.bindings[0].writers.value).split('|');
      let albums = [''];
      if ((response as any).results.bindings[0].album !== undefined){
        albums = ((response as any).results.bindings[0].album.value).split('|');
      }
      this.chanson = {
        name: name,
        duration: duration,
        bio: bio,
        releaseDate: date,
        genres: genres,
        relatedAlbum: albums,
        artists: artists,
        writers: writers
      };
      console.log(this.chanson.relatedAlbum);
    });
  }

}

