import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  private hubConnection!: signalR.HubConnection;
  messages: { user: string; text: string }[] = [];
  message: string = '';
  user: string = `User-${Math.floor(Math.random() * 1000)}`;

  ngOnInit(): void {
    this.startConnection();
    this.addMessageListener();
  }

  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://10.20.57.92:7231/chatHub') // Replace with your backend URL
      .configureLogging(signalR.LogLevel.Trace)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error: ', err));
  }

  private addMessageListener(): void {
    console.log('here');
    this.hubConnection.on('ReceiveMessage', (user, text) => {
      this.messages.push({ user, text });
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.hubConnection
        .invoke('SendMessage', this.user, this.message)
        .catch((err) => console.error(err));
      this.message = '';
    }
  }
}

