import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // This makes the service available throughout the app
})

export class UserDTOService {

    constructor() {}
  
    // Method to check if the user is authenticated
    isAuthenticated(): boolean {
      return sessionStorage.getItem('isAuthenticated') === 'true';
    }
  
    // Method to get user data from session storage
    getUserData(): { userName: string | null, userEmail: string | null, isAuthenticated: boolean } {
      const userName = sessionStorage.getItem('userName');
      const userEmail = sessionStorage.getItem('userEmail');
      const isAuthenticated = this.isAuthenticated();
  
      return {
        userName: userName ? decodeURIComponent(userName) : null,
        userEmail: userEmail ? decodeURIComponent(userEmail) : null,
        isAuthenticated: isAuthenticated
      };
    }
  
    // Method to store user data in session storage
    storeUserData(userName: string, userEmail: string, isAuthenticated : any): void {
        sessionStorage.setItem('isAuthenticated', isAuthenticated);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userEmail', userEmail);
      }
  
    clearAllCookies() {
        // Get all cookies
        const cookies = document.cookie.split(";");
    
        // Loop through each cookie and delete it
        cookies.forEach((cookie) => {
            const cookieName = cookie.split("=")[0].trim(); // Extract the cookie name
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`; // Delete the cookie
        });
    }
  }