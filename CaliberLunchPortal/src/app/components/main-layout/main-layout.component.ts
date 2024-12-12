import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../guards/auth.guard';
import { UserDTOService } from '../../services/user.dto';
import { ChatService } from '../../services/chat.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  private hubConnection!: signalR.HubConnection;
  messages: { sender: string; text: string }[] = [];
  message: string = '';
  userPicture: string = ''; 
  userName: string = ''; 
  userEmail: string = ''; 
  userNameFull: string = ''; 
  userEmailFull: string = ''; 
  isAdmin : boolean = false;
  isChatWindowOpen = true;
  chatMessages: { text: string; isSent: boolean }[] = [];
  newMessage = '';

  constructor (private authGuard: AuthGuard, private userDTOService: UserDTOService, private chatService: ChatService){
    const userDto = this.userDTOService.getUserData();
    this.isAdmin = userDto.isAdmin;
    this.userPicture = userDto.userPicture || '';
    this.userNameFull = userDto.userName || '';
    this.userEmailFull = userDto.userEmail || '';
    this.userName = this.formatString(userDto.userName || '');
    this.userEmail = this.formatString(userDto.userEmail || '');
  }


  ngOnInit(): void {
    this.startConnection();
    this.addMessageListener();
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
      if (this.isAdmin) {
        // Admin sends message to a specific user (you might provide a way to select the target user)
        this.sendMessageToUser('rudradev.pd@caliberuniversal.com', this.message);
      } else {
        // Non-admin user sends message to admins
        this.hubConnection
          .invoke('SendMessageToAdmins', this.userEmailFull, this.message)
          .catch((err) => console.error(err));
      }
      this.message = ''; // Clear the input field
    }
  }
  
  
  sendMessageToAdmins(): void {
    if (this.message.trim()) {
      this.hubConnection
        .invoke('SendMessageToAdmins', this.userEmailFull, this.message)
        .catch((err) => console.error(err));
      this.message = ''; // Clear the input field
    }
  }
  
  sendMessageToUser(targetUser: string, adminMessage: string): void {
    if (adminMessage.trim()) {
      this.hubConnection
        .invoke('SendMessageToUser', targetUser, this.userEmailFull, adminMessage)
        .catch((err) => console.error(err));
    }
  }
  
  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://10.20.57.92:7231/chatHub?emailId=${this.userEmailFull}`)
      .configureLogging(signalR.LogLevel.Information)
      .build();
  
    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error: ', err));
  }
  

  private formatString(input: string): string {
    if (input.length > 17) {
      return input.slice(0, 15) + '..';
    }
    return input;
  }

  isAdminDropdownOpen = false;
  toggleAdminDropdown() {
    this.isAdminDropdownOpen = !this.isAdminDropdownOpen;
  }

  isRequestDropdownOpen = false;
  toggleRequestDropdown() {
    this.isRequestDropdownOpen = !this.isRequestDropdownOpen;
  }

  isComplaintDropdownOpen = false;
  toggleComplaintDropdown() {
    this.isComplaintDropdownOpen = !this.isComplaintDropdownOpen;
  }

  isSidebarCollapsed = false;
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleChatWindow(): void {
    this.isChatWindowOpen = !this.isChatWindowOpen;
  }


  LogOut(){
    this.authGuard.logOut();
  }
}
