import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

export interface Song{
  name: string;
  duration: number; // in sec
  bio: string;
  albums: string[];
  releaseDate: Date;
  genres: string[];
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
  chansons: Song[] = [];

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient,
              private router: Router) { }

  ngOnInit(): void {
    this.nomChanson = this.route.snapshot.params.nomChanson;
    const songRequest =
      'select distinct\n' +
      '?name\n' +
      '?duration\n' +
      '?bio\n' +
      '?date\n' +
      'GROUP_CONCAT(DISTINCT ?genres; SEPARATOR="|") as ?genres\n' +
      'GROUP_CONCAT(DISTINCT ?artists ; SEPARATOR="|") as ?artists \n' +
      'GROUP_CONCAT(DISTINCT ?writers ; SEPARATOR="|") as ?writers \n' +
      'GROUP_CONCAT(DISTINCT ?albums ; SEPARATOR="|") as ?albums \n' +
      'where {\n' +
      '{\n' +
      '?song a dbo:Song .\n' +
      '?song foaf:name ?name .\n' +
      '?song dbo:runtime ?duration .\n' +
      '?song dbo:abstract ?bio .\n' +
      'optional{' +
      '?song dbo:album ?al .' +
      '?al foaf:name ?albums .' +
      '}' +
      'optional{' +
      '?song dbo:releaseDate ?date .\n' +
      '}' +
      'optional{' +
      '?song dbo:genre ?g .\n' +
      '?g foaf:name ?genres .\n' +
      '}' +
      'optional{' +
      '?song dbo:artist ?ar .\n' +
      '?ar foaf:name ?artists . \n' +
      '}' +
      'optional{' +
      '?song dbo:writer ?w .\n' +
      '?w foaf:name ?writers .\n' +
      '}' +
      'FILTER(?name="' + this.nomChanson + '"@en && lang(?bio)="en") .\n' +
      '}' +
      'UNION\n' +
      '{\n' +
      '?song a dbo:Single .\n' +
      '?song foaf:name ?name .\n' +
      '?song dbo:runtime ?duration .\n' +
      '?song dbo:abstract ?bio .\n' +
      'optional{' +
      '?song dbo:album ?al .' +
      '?al foaf:name ?albums .' +
      '}' +
      'optional{' +
      '?song dbo:releaseDate ?date .\n' +
      '}' +
      'optional{' +
      '?song dbo:genre ?g .\n' +
      '?g foaf:name ?genres .\n' +
      '}' +
      'optional{' +
      '?song dbo:artist ?ar .\n' +
      '?ar foaf:name ?artists . \n' +
      '}' +
      'optional{' +
      '?song dbo:writer ?w .\n' +
      '?w foaf:name ?writers .\n' +
      '}' +
      'FILTER(?name="' + this.nomChanson + '"@en && lang(?bio)="en") .\n' +
      '}\n' +
      '}\n';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(songRequest) + '&format=json').subscribe((response) => {
      if ((response as any).results.bindings.length === 0){
        this.router.navigate(['not-found']);
      }
      const responsesBindings = (response as any).results.bindings;
      console.log(responsesBindings);
      for (const responseBinding of responsesBindings){
        const name = responseBinding.name.value;
        const bio = (responseBinding.bio !== '') ? responseBinding.bio.value : null;
        const artists = (responseBinding.artists.value !== '') ? responseBinding.artists.value.split('|') : null;
        const date = (responseBinding.date !== undefined) ? responseBinding.date.value : null;
        const duration = (responseBinding.duration !== undefined) ? responseBinding.duration.value : null;
        const genres = (responseBinding.genres.value !== '') ? responseBinding.genres.value.split('|') : null;
        const writers = (responseBinding.writers.value !== '') ? responseBinding.writers.value.split('|') : null;
        const albums = (responseBinding.albums.value !== '') ?  responseBinding.albums.value.split('|') : null;
        const chanson: Song = {
          name: name,
          duration: duration,
          bio: bio,
          albums: albums,
          releaseDate: date,
          genres: genres,
          artists: artists,
          writers: writers
        };
        this.chansons.push(chanson);
      }
    });
  }

}

