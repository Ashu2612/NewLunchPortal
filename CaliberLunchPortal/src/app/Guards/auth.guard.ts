import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserDTOService } from '../Services/user.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private userDTOService: UserDTOService, private router: Router) {}

  canActivate(): boolean {
    if (this.userDTOService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
  logOut(): void{
    sessionStorage.clear();
    this.userDTOService.clearAllCookies();
    this.router.navigate(['/login']);
  }
}
