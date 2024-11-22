import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { UserDTOService } from '../../services/user.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements AfterViewInit{

  private apiUrl = 'https://localhost:7231';

  constructor(private http: HttpClient, private router: Router, private userDTOService: UserDTOService) {
    // Listen for messages from the popup window after it closes
    window.addEventListener('message', (event) => {
      if (event.origin === this.apiUrl) {
          const data = event.data;
          setTimeout(() => {
              const userData = this.getUserDataFromCookies();
              if (userData.userName) {
                userDTOService.storeUserData(userData.userName, userData.userEmail, userData.isAuthenticated, data.UserPicture);
            this.router.navigate(['/main-layout']);
                  this.showToastAlert(`Logged in as ${userData.userName}`, '#5ad192');
              }
          }, 500); // Delay to ensure cookies are set before fetching them
      }
    });
  }
  ngAfterViewInit() {
    const video = document.getElementById('animation-video') as HTMLVideoElement;
    if (video) {
      video.muted = true; // Ensure the video is muted for autoplay
      video.playbackRate = 1.8;
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
  
  getUserDataFromCookies(): any {
    let userName = this.getCookie('UserName');
    let userEmail = this.getCookie('UserEmail');
    let isAuthenticated = 'true';

    // Decode the values to handle special characters and spaces
    if (userName) userName = decodeURIComponent(userName);
    if (userEmail) userEmail = decodeURIComponent(userEmail);

    return { isAuthenticated, userName, userEmail };
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