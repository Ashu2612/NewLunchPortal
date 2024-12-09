import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule], // Add FormsModule
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any | null = null;
  searchQuery: string = ''; // Search query binding

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users]; // Initialize filtered list with all users
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  filterUsers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      console.log(query);
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.employeeId.toString().includes(query)
      );
    } else {
      this.filteredUsers = [...this.users]; // Reset to full list if search is empty
    }
  }

  clearSearch(): void {
    this.searchQuery = ''; // Clear the search query
    this.filteredUsers = [...this.users]; // Reset to the full list
  }

  editUser(user: any): void {
    this.selectedUser = { ...user }; // Clone user object
  }

  deleteUser(user: any): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter((u) => u.id !== user.id);
      this.filterUsers(); // Reapply filter after deletion
    }
  }

  saveUser(): void {
    if (this.selectedUser) {
      const index = this.users.findIndex((u) => u.id === this.selectedUser.id);
      if (index > -1) {
        this.users[index] = { ...this.selectedUser };
      }
      this.selectedUser = null;
      this.filterUsers(); // Reapply filter after save
    }
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }
}
