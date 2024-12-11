import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { SingupComponent } from './components/singup/singup.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

import { ChatComponent } from './components/chat/chat.component';
import { AdminChatComponent } from './components/admin-chat/admin-chat.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/main-layout', pathMatch: 'full' }, // Default route redirect
  { path: 'signup', component: SingupComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'main-layout',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }, // Default route in main layout
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'admin-chat', component: AdminChatComponent },
      { path: 'chat-component', component: ChatComponent }
    ]
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }