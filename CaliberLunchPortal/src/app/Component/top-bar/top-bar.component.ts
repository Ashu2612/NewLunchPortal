import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../Guards/auth.guard';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  template: `
    <nav class="top-menu">
      <a routerLink="/home" routerLinkActive="active">Home</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
      <a routerLink="/contact" routerLinkActive="active">Contact</a>
    </nav>
  `,
  imports: [RouterModule] ,
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  constructor(private authGuard: AuthGuard) {
    this
  }
LogOut(){
  this.authGuard.logOut();
}

}
