import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserDTOService } from '../../services/user.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements AfterViewInit{

  private apiUrl = 'https://10.20.57.92:7231';
  showSignUpModal = false;
  newUserName = "";
  newEmailId = "";
  employeeId: string = '';

  closeModal(){
    this.showSignUpModal = !this.showSignUpModal;
  }
  constructor(private http: HttpClient, private router: Router, private userDTOService: UserDTOService) {
    // Listen for messages from the popup window after it closes
    window.addEventListener('message', (event) => {
      if (event.origin === this.apiUrl) {
          setTimeout(() => {
            const userData = event.data;
            console.log(userData);
              if (userData.IsAuthenticated) {
                console.log('came here');
                this.newUserName = userData.UserName;
                this.newEmailId = userData.UserEmail;
                userDTOService.storeUserData(userData.UserName, userData.UserEmail, userData.IsAuthenticated, userData.UserPicture);
                if(userData.UserExists){
                  localStorage.setItem('employeeId', userData.EmployeeId);
                  this.router.navigate(['/main-layout']);
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
    var userData = this.userDTOService.getUserData();
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
          localStorage.setItem('employeeId', this.employeeId),
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