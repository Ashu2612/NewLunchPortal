import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
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
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:7231/chatHub') // Adjust URL as needed
      .build();

    this.hubConnection.start().catch(err => console.error(err));
  }

  addReceiveMessageListener(callback: (senderId: number, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  sendMessage(senderId: number, receiverId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/chat/send`, { senderId, receiverId, message });
  }

  getChatHistory(userId: number, adminId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/chat/history/${userId}/${adminId}`);
  }
}
