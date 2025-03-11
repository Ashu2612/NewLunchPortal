import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DocumentEditorAllModule, DocumentEditorContainerComponent } from '@syncfusion/ej2-angular-documenteditor'
import { DocumentEditorModule, DocumentEditorContainerModule,EditorService, SelectionService, EditorHistoryService, ToolbarService, DocumentEditorComponent } from '@syncfusion/ej2-angular-documenteditor';
import { ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-sync-edito',
  imports: [DocumentEditorAllModule, ButtonModule, CheckBoxModule, RadioButtonModule, SwitchModule, ChipListModule, FabModule, SpeedDialModule, SmartPasteButtonModule, DocumentEditorModule, DocumentEditorContainerModule],
  providers:[ToolbarService, EditorService, SelectionService, EditorHistoryService],
  templateUrl: './sync-edito.component.html',
  styleUrl: './sync-edito.component.css'
})
export class SyncEditoComponent {
  @ViewChild("documenteditor_readonly")
  public documentEditor: any;
  public container: any;
  public fileURL: any;
  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.container = DocumentEditorContainerComponent;
    this.documentEditor = DocumentEditorComponent;
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['fileUrl']) {
        this.fileURL = params['fileUrl'];
      }
    });
  }
  onCreate() {
    var _this = this;
    let http: XMLHttpRequest = new XMLHttpRequest();
    //add your url in which you want to open document inside the ""
    let content = { fileUrl: this.fileURL };
    let baseurl: string = 'http://localhost:62869/api/documenteditor/ImportFileURL';
    
    http.open('POST', baseurl, true);
    http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    http.onreadystatechange = () => {
      if (http.readyState === 4) {
        if (http.status === 200 || http.status === 304) {
          //open the SFDT text in Document Editor
          //this.container.documentEditor.open(http.responseText);
          _this.documentEditor.documentEditor.open(http.responseText); 
          _this.documentEditor.documentEditor.enableTrackChanges = false;
          _this.documentEditor.isReadOnly = true;
          _this.documentEditor.protectionType = 'NoProtection';
          _this.documentEditor.documentEditor.showRevisions = false; 
          
        }
      }
    };
    http.send(JSON.stringify(content));
  }
}
