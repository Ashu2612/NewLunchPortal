import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, TopBarComponent],
  template: `
  <app-top-bar></app-top-bar>
  <div class="content">
    <router-outlet></router-outlet>
  </div>
`,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
