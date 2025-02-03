import { Component } from '@angular/core';
import { DocumentEditorModule, DocumentEditorContainerModule, ToolbarService } from '@syncfusion/ej2-angular-documenteditor';
import { ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule } from '@syncfusion/ej2-angular-buttons';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule, DocumentEditorModule, DocumentEditorContainerModule],
  providers:[ToolbarService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
