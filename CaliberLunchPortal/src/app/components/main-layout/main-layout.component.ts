import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  constructor (private authGuard: AuthGuard){
    
  }
  LogOut(){
    this.authGuard.logOut();
  }
}
