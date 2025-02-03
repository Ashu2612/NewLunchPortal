import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AdminLayoutComponent } from './components/Admin/admin-layout/admin-layout.component';
import { HomeComponent } from './components/Normal/home/home.component';
import { AboutComponent } from './components/Normal/about/about.component';
import { ContactComponent } from './components/Normal/contact/contact.component';
import { UserManagementComponent } from './components/Admin/user-management/user-management.component';
import { AdminChatComponent } from './components/Admin/admin-chat/admin-chat.component';
import { SyncEditoComponent } from './components/DocumentEditor/syncfusion/sync-edito/sync-edito.component';
import { DashboardComponent } from './components/Admin/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/main-layout', pathMatch: 'full' },
  { path: '', redirectTo: '/admin-layout', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'main-layout',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }, // Default route in main layout
      { path: 'home', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'sync-edito', component: SyncEditoComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent }
    ]
  },
  {
    path: 'admin-layout',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }, // Default route in main layout
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'admin-chat', component: AdminChatComponent },
    ]
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }