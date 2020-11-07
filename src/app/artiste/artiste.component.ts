import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-artiste',
  templateUrl: './artiste.component.html',
  styleUrls: ['./artiste.component.scss']
})
export class ArtisteComponent implements OnInit {

  nomArtiste: string;
  url: string = 'http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org';
  bio: string;
  nom: string;
  
  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.nomArtiste = this.route.snapshot.params['nomArtiste'];
    //this.nomArtiste = this.nomArtiste.charAt(0).toUpperCase() + this.nomArtiste.substring(1).toLowerCase();
    const requete: string 
      ='select distinct ?name ?bio where {'
      +'?artiste a dbo:MusicalArtist .'
      +'?artiste foaf:name ?name .'
      +'?artiste dbo:abstract ?bio .'
      +'FILTER(?name = "'+this.nomArtiste+'"@en && lang(?bio)="en" ).'
      +'}';

    /*console.log('URL : ' + this.url+"&query="+encodeURIComponent(requete)+"&format=json");
    console.log('Nom : ' + this.nomArtiste)*/
    this.httpClient.get(this.url+"&query="+encodeURIComponent(requete)+"&format=json")
    .subscribe(
      (response) => {
        //console.log((response as any).results.bindings[0]);
        this.bio = (response as any).results.bindings[0].bio.value;
        this.nom = (response as any).results.bindings[0].name.value;
        console.log(this.nom,this.bio);
      }
    );
  }

}

