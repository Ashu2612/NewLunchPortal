import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../guards/auth.guard';
import { UserDTOService } from '../../services/user.dto';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  userPicture: string = ''; 
  userName: string = ''; // Store the user's name
  userEmail: string = ''; // Store the user's email
  userNameFull: string = ''; // Store the user's email
  userEmailFull: string = ''; // Store the user's email
  constructor (private authGuard: AuthGuard, private userDTOService: UserDTOService){
    var userDto = this.userDTOService.getUserData();
    this.userPicture = userDto.userPicture || '';
    // Check if the userName exceeds 11 characters
    this.userNameFull = userDto.userName || '';
    this.userEmailFull = userDto.userEmail || '';
    
    this.userName = this.formatString(userDto.userName || '');

    // Check if the userEmail exceeds 11 characters
    this.userEmail = this.formatString(userDto.userEmail || '');

  }
  // Helper method to trim and add ellipsis if string exceeds 11 characters
  private formatString(input: string): string {
    if (input.length > 17) {
      return input.slice(0, 15) + '..';  // Take first 10 characters and append '...'
    }
    return input;  // Return the original string if it's within the limit
  }

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  LogOut(){
    this.authGuard.logOut();
  }
}
