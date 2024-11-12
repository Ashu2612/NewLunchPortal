import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
//import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent{

  private apiUrl = 'https://localhost:7231';

  constructor(private http: HttpClient) {
    // Listen for messages from the popup window after it closes
    window.addEventListener('message', (event) => {
      if (event.origin === this.apiUrl) {
          const data = event.data;
          console.log('Data received from popup:', data);
  
          setTimeout(() => {
              const userData = this.getUserDataFromCookies();
              console.log('User Data from Cookies:', userData);
              if (userData.userName) {
                  this.showToastAlert(`Logged in as ${userData.userName}`, '#5ad192');
              }
          }, 500); // Delay to ensure cookies are set before fetching them
      }
    });
  }
  // Open a new window on top of the current window
  openLoginModal() {
    const popupWidth = 600;
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
          console.log('Popup window closed');
          // Optionally, you can fetch user data from cookies here if needed
          const userData = this.getUserDataFromCookies();
          if (userData.userName) {
            this.showToastAlert(`Logged in as ${userData.userName}`, '#5ad192');
          }
        }
      }, 1000);
    } else {
      console.error('Popup window could not be opened. Please check if popups are blocked.');
    }
  }
  
  fetchUserData() {
    console.log('Fetching user data...');
   this.http.get<any>(`${this.apiUrl}/identity/userdto`, { withCredentials: true }).subscribe(
    (data) => {
      if (!data.isAuthenticated) {
        this.showToastAlert(`Logged in as ${data.userName}`, '#5ad192');
      } else {
        this.showToastAlert('Authentication Failed!', '#f55427');
      }
    },
    (error) => {
      console.error('Error fetching user data:', error);
      Swal.fire('Error', 'Could not retrieve user data', 'error');
    }
   );
  }
  getUserDataFromCookies(): any {
    const userName = this.getCookie('UserName');
    const userEmail = this.getCookie('UserEmail');
    console.log('UserName from cookies:', userName);  // Debug log
    console.log('UserEmail from cookies:', userEmail);  // Debug log
    return { userName, userEmail };
}

getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;
        console.log(`${name} cookie value:`, cookieValue);  // Debug log
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
