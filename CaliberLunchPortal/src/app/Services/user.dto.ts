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

    isAdmin(): boolean {
      return sessionStorage.getItem('isAdmin') === 'true';
    }
  
    // Method to get user data from session storage
    getUserData(): { userName: string | null, userEmail: string | null, userPicture: string | null, isAuthenticated: boolean, isAdmin : boolean } {
      const userName = sessionStorage.getItem('userName');
      const userEmail = sessionStorage.getItem('userEmail');
      const userPicture = sessionStorage.getItem('userPicture');
      const isAuthenticated = this.isAuthenticated();
      const isAdmin = this.isAdmin();
  
      return {
        userName: userName ? decodeURIComponent(userName) : null,
        userEmail: userEmail ? decodeURIComponent(userEmail) : null,
        userPicture: userPicture ? decodeURIComponent(userPicture) : null,
        isAuthenticated: isAuthenticated,
        isAdmin : isAdmin
      };
    }
  
    // Method to store user data in session storage
    storeUserData(userName: string , userEmail: string, isAuthenticated : any, userPicture : any, isAdmin : any): void {
        sessionStorage.setItem('isAuthenticated', isAuthenticated);
        sessionStorage.setItem('isAdmin', isAdmin);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userEmail', userEmail);
        sessionStorage.setItem('userPicture', userPicture);
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