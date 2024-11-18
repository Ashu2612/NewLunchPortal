import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './Component/login/login.component';
import { MainLayoutComponent } from './Component/main-layout/main-layout.component';
import { HomeComponent } from './Component/home/home.component';
import { AboutComponent } from './Component/about/about.component';
import { ContactComponent } from './Component/contact/contact.component';
import { AuthGuard } from './Guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/main-layout', pathMatch: 'full' }, // Default route redirect
  { path: 'login', component: LoginComponent },
  {
    path: 'main-layout',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent }, // Default route in main layout
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent }
    ]
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }