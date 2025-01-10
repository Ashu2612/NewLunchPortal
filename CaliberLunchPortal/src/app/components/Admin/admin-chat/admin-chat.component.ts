import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chats/chat.service';
import { UserService } from '../../../services/users/user.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-admin-chat',
  standalone: true, // Ensure it's a standalone component
  imports: [CommonModule, FormsModule], // Add CommonModule here
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css'], // Corrected key name
})
export class AdminChatComponent  implements OnInit {
  private hubConnection!: signalR.HubConnection;
  messages: { sender: string; text: string }[] = [];
  message: string = '';
  users: any[] = [];
  chatHistory: any[] = [];
  selectedUser: any;
  currentUser: any;

  constructor(private chatService: ChatService, private userService: UserService) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUserData();
    this.fetchUsers();
    this.startConnection();
    this.addMessageListener();
  }
  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }
  selectUser(email: string): void {
    console.log('Here');
    this.selectedUser = this.users.find(user => user.email === email);
    console.log(this.selectedUser);
  }
  
  private addMessageListener(): void {
    this.hubConnection.on('ReceiveMessage', (sender, text) => {
      this.messages.push({
        sender: sender === 'You' ? 'You' : sender,
        text,
      });
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      if (this.currentUser.isAdmin) {
        // Admin sends message to a specific user (you might provide a way to select the target user)
        this.sendMessageToUser(this.selectedUser.email, this.message);
      } else {
        // Non-admin user sends message to admins
        this.hubConnection
          .invoke('SendMessageToAdmins', this.selectedUser.email, this.message)
          .catch((err) => console.error(err));
      }
      this.message = ''; // Clear the input field
    }
  }
  
  
  sendMessageToAdmins(): void {
    if (this.message.trim()) {
      this.hubConnection
        .invoke('SendMessageToAdmins', this.selectedUser.email, this.message)
        .catch((err) => console.error(err));
      this.message = ''; // Clear the input field
    }
  }
  
  sendMessageToUser(targetUser: string, adminMessage: string): void {
    if (adminMessage.trim()) {
      this.hubConnection
        .invoke('SendMessageToUser', targetUser, this.selectedUser.email, adminMessage)
        .catch((err) => console.error(err));
    }
  }
  
  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://10.20.57.92:7231/chatHub?email=${this.currentUser.userEmail}`)
      .configureLogging(signalR.LogLevel.Information)
      .build();
  
    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error: ', err));
  }
  
}
