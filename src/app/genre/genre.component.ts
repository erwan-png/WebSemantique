import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';

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

  genre: Genre = {
    name: '',
    bio: '',
    derivativeGenre: [],
    subGenre: [],
    fusionGenre: [],
    stylisticOriginGenre: []
  };
  redirectUrl = 'http://localhost:4200/recherche-genre/';
  url = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  nomGenre: string;
  listArtists: string[] = [];
  listBands: string[] = [];
  listSongs: string[] = [];


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
      '?genre foaf:name ?name .' +
      '?genre dbo:abstract ?bio .' +
      '?genre dbo:musicSubgenre ?subGenre.' +
      '?subGenre rdfs:label ?subGenreName .' +
      '?genre dbo:stylisticOrigin ?sOrigin .' +
      '?sOrigin rdfs:label ?sOriginName . ' +
      'optional{' +
      '?genre dbo:derivative ?dGenre .' +
      '?dGenre rdfs:label ?dGenreName .' +
      '?genre dbo:musicFusionGenre ?fGenre .' +
      '?fGenre rdfs:label ?fGenreName .' +
      'FILTER(lang(?dGenreName)="en" && lang(?fGenreName)="en" ) .' +
      '}' +
      'FILTER(?name = "' + this.nomGenre + '"@en && lang(?bio)="en" && lang(?subGenreName)="en" && lang(?sOriginName )="en") .' +
      '}';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(genreRequest) + '&format=json').subscribe((response) => {
      const genreName = (response as any).results.bindings[0].name.value;
      const abstract = (response as any).results.bindings[0].bio.value;
      const subGenreName = ((response as any).results.bindings[0].subGenreName.value).split('|');
      const dGenreName = ((response as any).results.bindings[0].dGenreName.value).split('|');
      const sOriginName = ((response as any).results.bindings[0].sOriginName.value).split('|');
      const fGenreName = ((response as any).results.bindings[0].fGenreName.value).split('|');
      console.log(subGenreName, dGenreName, sOriginName, fGenreName);
      this.genre = {
        name: genreName,
        bio: abstract,
        derivativeGenre: dGenreName,
        subGenre: subGenreName,
        fusionGenre: fGenreName,
        stylisticOriginGenre: sOriginName
      };
    });

    // Fetch related songs and artists info
    const similarArtistRequest =
      'select distinct \n' +
      '?artistsName \n' +
      'where {\n' +
      '?genre a dbo:Genre .\n' +
      '?genre rdfs:label ?name .\n' +
      '?artists a dbo:MusicalArtist .\n' +
      '?artists rdfs:label ?artistsName .\n' +
      '?artists dbo:genre ?genres .\n' +
      '?genres rdfs:label ?genresName .\n' +
      'FILTER(?name = "' + this.nomGenre + '"@en && ?genresName = "' + this.nomGenre + '"@en && lang(?artistsName)="en") .\n' +
      '}\n' +
      'LIMIT 10';
    const similarGroupRequest =
      'select distinct \n' +
      '?bandsName \n' +
      'where {\n' +
      '?genre a dbo:Genre .\n' +
      '?genre rdfs:label ?name .\n' +
      '?bands a dbo:Band .\n' +
      '?bands rdfs:label ?bandsName .\n' +
      '?bands dbo:genre ?genres .\n' +
      '?genres rdfs:label ?genresName .\n' +
      'FILTER(?name = "' + this.nomGenre + '"@en && ?genresName = "' + this.nomGenre + '"@en && lang(?bandsName)="en") .\n' +
      '}\n' +
      'LIMIT 10';
    const similarSinglesRequest =
      'select distinct \n' +
      '?singles \n' +
      'where {\n' +
      '?genre a dbo:Genre .\n' +
      '?genre rdfs:label ?name .\n' +
      '?single a dbo:Single.\n' +
      '?single rdfs:label ?singles.\n' +
      '?single dbo:genre ?singleGenre.\n' +
      '?singleGenre rdfs:label ?singleGenreName.\n' +
      'FILTER(?name = "' + this.nomGenre + '"@en && ?singleGenreName = "' + this.nomGenre + '"@en && lang(?singles)="en") .\n' +
      '}\n' +
      'LIMIT 10';
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(similarGroupRequest) + '&format=json').subscribe((response) => {
      const requests = (response as any).results.bindings;
      for (const request of requests){
        const bandName = request.bandsName.value;
        this.listBands.push(bandName);
      }
    });
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(similarArtistRequest) + '&format=json').subscribe((response) => {
      const requests = (response as any).results.bindings;
      for (const request of requests){
        const artistName = request.artistsName.value;
        this.listArtists.push(artistName);
      }
    });
    this.httpClient.get(this.url + '&query=' + encodeURIComponent(similarSinglesRequest) + '&format=json').subscribe((response) => {
      const requests = (response as any).results.bindings;
      for (const request of requests){
        const singleName = request.singles.value;
        this.listSongs.push(singleName);
      }
    });
  }

}
