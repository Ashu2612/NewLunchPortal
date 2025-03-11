import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base'
import { MainLayoutComponent } from './app/components/main-layout/main-layout.component';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXxfcHVVR2ddVkd2WEs=');
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
