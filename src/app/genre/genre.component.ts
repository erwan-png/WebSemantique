import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";

export interface Genre {
  name: string;
  bio: string;
  derivativeGenre: string[];
  subGenre: string[];
  fusionGenre: string[];
  stylisticOriginGenre: string[];
}

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.scss']
})
export class GenreComponent implements OnInit {
  genre: Genre;
  redirect_url: string = 'http://localhost:4200/recherche-genre/';
  url: string = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  nomGenre: string;

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.nomGenre = this.route.snapshot.params.nomGenre;

    // Fetching genre base information
    const genreRequest =
      'select distinct ' +
      '?name ' +
      'GROUP_CONCAT(DISTINCT ?subGenreName; SEPARATOR="|") as ?subGenreName ' +
      'GROUP_CONCAT(DISTINCT ?dGenreName; SEPARATOR="|") as ?dGenreName ' +
      'GROUP_CONCAT(DISTINCT ?sOriginName; SEPARATOR="|") as ?sOriginName ' +
      'GROUP_CONCAT(DISTINCT ?fGenreName; SEPARATOR="|") as ?fGenreName ' +
      '?bio ' +
      'where {' +
      '?genre a dbo:Genre .' +
      '?genre rdfs:label ?name .' +
      '?genre dbo:abstract ?bio .' +
      'optional{' +
      '?genre dbo:derivative ?dGenre .' +
      '?dGenre rdfs:label ?dGenreName .' +
      '?genre dbo:stylisticOrigin ?sOrigin .' +
      '?sOrigin rdfs:label ?sOriginName . ' +
      '?genre dbo:musicFusionGenre ?fGenre .' +
      '?fGenre rdfs:label ?fGenreName .' +
      '?genre dbo:musicSubgenre ?subGenre.' +
      '?subGenre rdfs:label ?subGenreName .' +
      'FILTER(lang(?dGenreName)="en" && lang(?sOriginName)="en" && lang(?fGenreName)="en" && lang(?subGenreName)="en") .' +
      '}' +
      'FILTER(?name = "' + this.nomGenre + '"@en && lang(?bio)="en") .' +
      '}';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(genreRequest) + '&format=json').subscribe((response) => {
      const genreName = (response as any).results.bindings[0].name.value;
      const abstract = (response as any).results.bindings[0].bio.value;
      const subGenreName = ((response as any).results.bindings[0].subGenreName.value).split('|');
      const dGenreName = ((response as any).results.bindings[0].dGenreName.value).split('|');
      const sOriginName = ((response as any).results.bindings[0].sOriginName.value).split('|');
      const fGenreName = ((response as any).results.bindings[0].fGenreName.value).split('|');
      this.genre = {
        name: genreName,
        bio: abstract,
        derivativeGenre: dGenreName,
        subGenre: subGenreName,
        fusionGenre: fGenreName,
        stylisticOriginGenre: sOriginName
      }
    });
  }

}

