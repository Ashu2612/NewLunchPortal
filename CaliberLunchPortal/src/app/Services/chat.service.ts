import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://localhost:7231';
  private hubConnection!: HubConnection;

  constructor(private http: HttpClient) {}

  startConnection(): void {
    // Retrieve the user's email from local storage or other secure storage
    const userEmail = localStorage.getItem('email'); // Replace this with your actual email retrieval logic
    console.log(userEmail);
    if (!userEmail) {
      console.error('User email is required to establish the connection.');
      return;
    }
  
    // Initialize the SignalR connection
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://localhost:7231/chatHub?email=${encodeURIComponent(userEmail)}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets, // Use WebSockets explicitly
        withCredentials: false // Typically false unless cookies are required
      })
      .withAutomaticReconnect() // Automatically reconnect if the connection drops
      .build();
  
    // Start the connection and handle errors
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection established successfully.'))
      .catch(err => console.error('Error starting SignalR connection:', err));
  
    // Handle connection closure
    this.hubConnection.onclose(err => {
      console.error('SignalR connection closed. Attempting to reconnect...', err);
    });
  }
  

  addReceiveMessageListener(callback: (senderId: number, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', (senderId: number, message: string) => {
      callback(senderId, message);
    });
  }
  
  sendMessage(senderId: number, receiverId: number, message: string): Observable<any> {
    console.log('Here came');
    return this.http.post(`${this.apiUrl}/api/chat/send`, { senderId, receiverId, message });
  }

  getChatHistory(userId: number, adminId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/chat/history/${userId}/${adminId}`);
  }
}
