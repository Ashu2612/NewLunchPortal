import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../guards/auth.guard';
import { UserDTOService } from '../../services/user.dto';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
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
    // Start the SignalR connection and listen for incoming messages
    this.chatService.startConnection();
    this.chatService.addReceiveMessageListener((senderId, message) => {
      this.chatMessages.push({ text: message, isSent: false });
    });
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

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Add the message to the chat window
    this.chatMessages.push({ text: this.newMessage, isSent: true });

    // Send the message via ChatService
    this.chatService.sendMessage(7, 3, this.newMessage).subscribe(() => {
      console.log('Message sent successfully');
    });

    this.newMessage = '';
  }

  LogOut(){
    this.authGuard.logOut();
  }
}
