import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base'
import { MainLayoutComponent } from './app/components/main-layout/main-layout.component';

registerLicense('NRAiBiAaIQQuGjN/V05+XU9HdVRAQmFBYVF2R2ZJfl96dlRMZFRBJAtUQF1hTH5SdExhWnxec3dVT2Jd');
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
