import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../services/users/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements AfterViewInit{

  private apiUrl = 'https://10.60.35.171:8231';
  showSignUpModal = false;
  newUserName = "";
  newEmailId = "";
  employeeId: string = '';

  userId: string = '';
  password: string = '';

  closeModal(){
    this.showSignUpModal = !this.showSignUpModal;
  }
  constructor(private http: HttpClient, private router: Router, private userService: UserService) {
    // Listen for messages from the popup window after it closes
    window.addEventListener('message', (event) => {
      if (event.origin === this.apiUrl) {
          setTimeout(() => {
            const userData = event.data;
              if (userData.IsAuthenticated) {
                this.newUserName = userData.UserName;
                this.newEmailId = userData.UserEmail;
                userService.storeUserData(userData.UserName, userData.UserEmail, userData.IsAuthenticated, userData.UserPicture, userData.IsAdmin);
                if(userData.UserExists === "true"){
                  debugger;
                  if(userData.IsAdmin){
                    this.router.navigate(['/admin-layout']);
                  }
                  else{
                    this.router.navigate(['/main-layout']);
                  }
                  this.showToastAlert(`Logged in as ${userData.UserName}`, '#5ad192');
                }else{
                  this.showSignUpModal = true;
                }
              }
              else{
                this.showToastAlert(`Login Failed !`, '#ff5b5b');
              }
          }, 500); // Delay to ensure cookies are set before fetching them
      }
    });
  }
  dummyLogin(userId: string, password: string): void {
    if(userId === 'caliber' && password === 'password'){
 this.userService.storeUserData('Caliber Technologies', 'caliberuniversal.com', 'true', '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', 'false');
    this.router.navigate(['/main-layout']);
    }else{
      this.showToastAlert(`Login Failed !`, '#ff5b5b');
    }
  }
  ngAfterViewInit() {
    const video = document.getElementById('animation-video') as HTMLVideoElement;
    if (video) {
      video.muted = true; // Ensure the video is muted for autoplay
      video.playbackRate = 3;
      video.play().catch((error) => {
        console.error('Autoplay failed:', error);
      });
    } else {
      console.error('Video element not found');
    }
}
  // Open a new window on top of the current window
  openLoginModal() {
    const popupWidth = 630;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;

    // Replace this URL with your actual Microsoft login URL
    const popupUrl = `${this.apiUrl}/Identity/LoginWithMicrosoftAccount`;
    const popupWindow = window.open(
      popupUrl,
      'MicrosoftLoginPopup',
      `width=${popupWidth},height=${popupHeight},left=${leftPosition},top=${topPosition},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popupWindow) {
      popupWindow.focus(); // Ensure the new window is brought to the front

      // Check if the popup window is closed
      const checkPopupClosed = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(checkPopupClosed);
        }
      }, 1000);
    } else {
      console.error('Popup window could not be opened. Please check if popups are blocked.');
    }
  }
  insertEmployee(): void {
    var userData = this.userService.getUserData();
    console.log(userData);
    const user = {
      EmployeeId: this.employeeId, // reading from textbox
      Name: this.newUserName,
      Email: this.newEmailId, 
      DiplayPic: userData.userPicture, // reading the user display pic
      IsAdmin: false //Initially set to normal user
    };
  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    this.http.put(`${this.apiUrl}/Users/InsertEmployeeDetails`, user, { headers })
      .subscribe({
        next: (response) =>  { this.router.navigate(['/main-layout']),
          this.showToastAlert(`Logged in as ${userData.userName}`, '#5ad192')},
        error: (error) => console.error('Error:', error)
      });
  }

  getUserDataFromCookies(): any {
    let userName = this.getCookie('UserName');
    let userEmail = this.getCookie('UserEmail');
    let userPicture = this.getCookie('UserPicture');
    let userExists = this.getCookie('UserExists');
    let isAuthenticated = this.getCookie('IsAuthenticated');
    // Decode the values to handle special characters and spaces
    if (userName) userName = decodeURIComponent(userName);
    if (userEmail) userEmail = decodeURIComponent(userEmail);

    return { isAuthenticated, userName, userEmail, userExists, userPicture };
}

getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;
        return cookieValue;
    }
    return null;
}

showToastAlert(message:string, alertColor:string) {
  Swal.fire({
    title: message,
    toast: true,
    position: 'top',
    timer: 3000,
    background: alertColor,
    showConfirmButton: true,
    color: '#fff',
    customClass: {
      popup: 'slim-toast' 
    }
  });
}

}