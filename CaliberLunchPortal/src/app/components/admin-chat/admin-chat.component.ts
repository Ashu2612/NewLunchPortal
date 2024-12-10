import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-chat',
  standalone: true, // Ensure it's a standalone component
  imports: [CommonModule, FormsModule], // Add CommonModule here
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css'], // Corrected key name
})
export class AdminChatComponent implements OnInit {
  users: any[] = [];
  chatHistory: any[] = [];
  selectedUser: any;

  constructor(private chatService: ChatService, private userService: UserService) {}
  ngOnInit(): void {
    this.fetchUsers();
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
  selectUser(userId: number): void {
    console.log('Here');
    this.selectedUser = this.users.find(user => user.id === userId);
    console.log(this.selectedUser);
    this.loadChatHistory(userId);
  }

  loadChatHistory(userId: number): void {
    this.chatService.getChatHistory(userId, 3).subscribe(history => {
      this.chatHistory = history;
    });
  }
}
