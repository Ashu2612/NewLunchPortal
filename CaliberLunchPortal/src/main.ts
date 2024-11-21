import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MainLayoutComponent } from './app/Component/main-layout/main-layout.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
