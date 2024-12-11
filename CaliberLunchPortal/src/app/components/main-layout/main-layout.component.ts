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
  messages: { user: string; text: string }[] = [];
  message: string = '';
  userPicture: string = ''; 
  userName: string = ''; 
  userEmail: string = ''; 
  userNameFull: string = ''; 
  userEmailFull: string = ''; 
  isChatWindowOpen = true;
  chatMessages: { text: string; isSent: boolean }[] = [];
  newMessage = '';

  constructor (private authGuard: AuthGuard, private userDTOService: UserDTOService, private chatService: ChatService){
    const userDto = this.userDTOService.getUserData();
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
    this.hubConnection.on('ReceiveMessage', (user, text) => {
      console.log(text);
      this.messages.push({ user, text });
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      console.log('Here');
      this.hubConnection
        .invoke('SendMessage', this.userName, this.message)
        .catch((err) => console.error(err));
      this.message = '';
    }
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
