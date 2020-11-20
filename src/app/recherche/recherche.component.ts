import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recherche',
  templateUrl: './recherche.component.html',
  styleUrls: ['./recherche.component.scss']
})
export class RechercheComponent implements OnInit {

  typeRecherche: string = 'artiste';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    let texte = form.value['entreeUtilisateur'];

    if(this.typeRecherche === 'artiste' ) 
      this.router.navigate(['recherche-artiste', texte] );
    else if(this.typeRecherche === 'genre' ) 
      this.router.navigate(['recherche-genre', texte] );
    else if(this.typeRecherche === 'chanson' ) 
      this.router.navigate(['recherche-chanson', texte] );
  }

  getLabel() : string{
    if(this.typeRecherche == 'artiste')
      return 'Entrez le nom d\'un artiste :';
    else if(this.typeRecherche == 'genre')
      return 'Cherchez un genre de musique :';
    else if(this.typeRecherche == 'chanson')
      return 'Cherchez une chanson :';
  }

}
