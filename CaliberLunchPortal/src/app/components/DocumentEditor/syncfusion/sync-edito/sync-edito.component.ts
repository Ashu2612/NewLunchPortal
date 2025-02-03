import { Component } from '@angular/core';
import { DocumentEditorModule, DocumentEditorContainerModule, ToolbarService } from '@syncfusion/ej2-angular-documenteditor';
import { ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-sync-edito',
  imports: [ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule, DocumentEditorModule, DocumentEditorContainerModule],
  providers:[ToolbarService],
  templateUrl: './sync-edito.component.html',
  styleUrl: './sync-edito.component.css'
})
export class SyncEditoComponent {

}
