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
  writers: string[];
}
@Component({
  selector: 'app-chanson',
  templateUrl: './chanson.component.html',
  styleUrls: ['./chanson.component.scss']
})
export class ChansonComponent implements OnInit {
  url = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  nomChanson: string;
  chansons: Array<Song> = [];

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
      'GROUP_CONCAT(DISTINCT ?artists ; SEPARATOR="|") as ?artists\n' +
      'GROUP_CONCAT(DISTINCT ?writers ; SEPARATOR="|") as ?writers\n' +
      'where {\n' +
      '{\n' +
      '?song a dbo:Song .\n' +
      '?song foaf:name ?name .\n' +
      '?song dbo:runtime ?duration .\n' +
      '?song dbo:abstract ?bio .\n' +
      '?al a dbo:Album .\n' +
      '?al foaf:name ?album .\n' +
      '?al dbp:title ?titles .\n' +
      '?titles foaf:name ?titleName .\n' +
      '?song dbo:genre ?g .\n' +
      '?g foaf:name ?genres .\n' +
      '?song dbo:artist ?ar .\n' +
      '?ar foaf:name ?artists .\n' +
      '?song dbo:releaseDate ?date .\n' +
      'optional{\n' +
      '?song dbo:writer ?w .\n' +
      '?w foaf:name ?writers .\n' +
      '}\n' +
      'FILTER(?name="' + this.nomChanson + '"@en && ?titleName="' + this.nomChanson + '"@en && lang(?bio)="en") .\n' +
      '}\n' +
      'UNION\n' +
      '{\n' +
      '?song a dbo:Single .\n' +
      '?song foaf:name ?name .\n' +
      '?song dbo:runtime ?duration .\n' +
      '?song dbo:abstract ?bio .\n' +
      '?al a dbo:Album .\n' +
      '?al foaf:name ?album .\n' +
      '?al dbp:title ?titles .\n' +
      '?titles foaf:name ?titleName .\n' +
      '?song dbo:genre ?g .\n' +
      '?g foaf:name ?genres .\n' +
      '?song dbo:artist ?ar .\n' +
      '?ar foaf:name ?artists .\n' +
      '?song dbo:releaseDate ?date .\n' +
      'optional{\n' +
      '?song dbo:writer ?w .\n' +
      '?w foaf:name ?writers .\n' +
      '}\n' +
      'FILTER(?name="' + this.nomChanson + '"@en && ?titleName="' + this.nomChanson + '"@en && lang(?bio)="en") .\n' +
      '}\n' +
      '}';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(songRequest) + '&format=json').subscribe((response) => {
      console.log(response);
      const resultsSize = (response as any).results.bindings.length;
      for (let i = 0; i < resultsSize; i++){
        let name = '';
        if ((response as any).results.bindings[i].name !== undefined){
          name = (response as any).results.bindings[i].name.value;
        }
        let bio = '';
        if ((response as any).results.bindings[i].bio !== undefined){
          bio = (response as any).results.bindings[i].bio.value;
        }
        let artists: string[] = [];
        if ((response as any).results.bindings[i].artists !== undefined){
          artists = ((response as any).results.bindings[i].artists.value).split('|');

        }
        let date: Date;
        if ((response as any).results.bindings[i].date !== undefined){
          date = (response as any).results.bindings[i].date.value;
        }
        let duration: number;
        if ((response as any).results.bindings[i].duration !== undefined){
          duration = (response as any).results.bindings[i].duration.value;
        }
        let genres: string[] = [];
        if ((response as any).results.bindings[i].genres !== undefined){
          genres = (response as any).results.bindings[i].genres.value;
        }
        let writers: string[] = [];
        if ((response as any).results.bindings[i].writers !== undefined){
          writers = ((response as any).results.bindings[i].writers.value).split('|');
        }
        let albums: string[] = [] ;
        if ((response as any).results.bindings[i].album !== undefined){
          albums = ((response as any).results.bindings[i].album.value).split('|');
        }
        const chanson: Song = {
          name,
          duration,
          bio,
          releaseDate: date,
          genres,
          relatedAlbum: albums,
          artists,
          writers
        };
        this.chansons.push(chanson);
      }
      console.log(this.chansons);
    });
  }

}

