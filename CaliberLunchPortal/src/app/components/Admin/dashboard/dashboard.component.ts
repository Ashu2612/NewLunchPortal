import { Component , ViewEncapsulation, OnInit  } from '@angular/core';
import { ILoadedEventArgs, ChartTheme, AccumulationChartComponent, AccumulationChart, IAccPointRenderEventArgs, IAccLoadedEventArgs, AccumulationTheme, ChartAllModule, AccumulationChartAllModule } from '@syncfusion/ej2-angular-charts';
import { Browser } from '@syncfusion/ej2-base';
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientListComponent } from "../client-list/client-list.component";

interface Device {
  id: string;
  macAddress: string;
  hostname: string;
  serialNumber: string;
  ipAddress: string;
  lastCommunication: string;
  version: string;
  environmentType: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [DashboardLayoutModule, AccumulationChartAllModule, ChartAllModule, AccumulationChartAllModule, ClientListComponent]
})

export class DashboardComponent implements OnInit{
  public layoutColor: string = "";
  public cellSpacing: number[] = [15, 15];
  public cellAspectRatio: number = Browser.isDevice ? 1 : 0.8;
  public columns: number = Browser.isDevice ? 3 : 8;
  public columnSizeX: number = Browser.isDevice ? 1: 5;
  public columnSizeY: number = Browser.isDevice ? 1 : 2;
  public pieColumn: number = Browser.isDevice ? 1 : 5;
  public pieSizeX: number = Browser.isDevice ? 1 : 3;
  public pieSizeY: number = Browser.isDevice ? 1 : 2;
  public splineRow: number = Browser.isDevice ? 1 : 4;
  public splineSizeX: number = Browser.isDevice ? 2 : 8;
  public splineSizeY: number = Browser.isDevice ? 1 : 3;

  public doughnutChartData: Object[] = [];
  public Piedata: Object[] = [];
  public data: Object[] = [];

  public chartArea: Object = {
    border: { width: 0,},
  };

  ngOnInit(): void {
    this.fetchClientData();
  }

  fetchClientData(): void {
    this.http.get<any>('http://localhost:5018/api/Clients/clientAndDeviceStatus').subscribe(response => {
      const allRegisteredDevices = response.allRegisteredDevices;  // Access the correct property
      const activeDevices = response.activeDevices;
      const abandonedDevices = response.abandonedDevices;
      const activeClients = response.activeClients;
      const inactiveClients = response.inactiveClients;

      if (Array.isArray(allRegisteredDevices)) {
        // Group by environmentType and count
        const environmentCounts: { [key: string]: number } = {};
        allRegisteredDevices.forEach((device: any) => {
          const env = device.environmentType;
          environmentCounts[env] = (environmentCounts[env] || 0) + 1;
        });
  
        // Calculate total devices
        const totalDevices = allRegisteredDevices.length;
  
        // Prepare data in the desired format
        this.doughnutChartData = Object.keys(environmentCounts).map(env => {
          const count = environmentCounts[env];
          const percentage = ((count / totalDevices) * 100).toFixed(2);
  
          return {
            Product: `${env} : ${count} (${percentage}%)`,
            Percentage: parseFloat(percentage),
            TextMapping: `${env}, ${count} <br>${percentage}%`
          };
        });
      } else {
        console.error('Expected an array for allRegisteredDevices but received:', allRegisteredDevices);
      }
  
      if (Array.isArray(activeClients) && Array.isArray(inactiveClients)) {
        const activeCount = activeClients.length;
        const inactiveCount = inactiveClients.length;
        const totalClients = activeCount + inactiveCount;
      
        // Calculate percentages
        const activePercentage = totalClients > 0 ? ((activeCount / totalClients) * 100).toFixed(2) : '0.00';
        const inactivePercentage = totalClients > 0 ? ((inactiveCount / totalClients) * 100).toFixed(2) : '0.00';
      
        // Format data for Pie Chart
        this.Piedata = [
          { Browser: "Inactive", Users: inactiveCount, DataLabelMappingName: `Inactive Devices: ${inactivePercentage}%` },
          { Browser: "Active", Users: activeCount, DataLabelMappingName: `Active Devices: ${activePercentage}%` },
        ];
      } else {
        console.error('Expected arrays for activeClients and inactiveClients but received:', activeClients, inactiveClients);
      }
      
      if (Array.isArray(allRegisteredDevices) && allRegisteredDevices.length > 0) {
        const deviceRegistrationsByDay: { [key: string]: any } = {};
      
        // Sort devices by updatedAt (latest first)
        allRegisteredDevices.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
        // Extract unique last 6 dates from updatedAt
        const uniqueDates = [...new Set(allRegisteredDevices.map(device => new Date(device.updatedAt).toISOString().split('T')[0]))]
          .slice(0, 6); // Take only the last 6 unique dates
      
        // Filter devices to keep only those with the last 6 updatedAt dates
        const filteredDevices = allRegisteredDevices.filter(device => uniqueDates.includes(new Date(device.updatedAt).toISOString().split('T')[0]));
      
        // Process filtered data
        filteredDevices.forEach((device: any) => {
          const updatedDate = new Date(device.updatedAt);
          const day = updatedDate.toISOString().split('T')[0]; // Get only "YYYY-MM-DD"
          const envType = device.environmentType;
      
          // Initialize day if not already present
          if (!deviceRegistrationsByDay[day]) {
            deviceRegistrationsByDay[day] = {
              Date: day,
              Windows: 0,
              Android: 0,
              iOS: 0,
              MacOS: 0,
              Active: 0,
              Abandoned: 0
            };
          }
      
          // Update the count of devices by environment type
          deviceRegistrationsByDay[day][envType] = (deviceRegistrationsByDay[day][envType] || 0) + 1;
      
          // Check if the device is active or abandoned based on updatedAt
          const activeDevice = activeDevices.find((activeDevice: any) => activeDevice.id === device.id);
          if (activeDevice) {
            const activeDay = new Date(activeDevice.updatedAt).toISOString().split('T')[0];
            if (activeDay === day) {
              deviceRegistrationsByDay[day].Active += 1;
            }
          } else if (abandonedDevices.some((abandonedDevice: any) => abandonedDevice.id === device.id)) {
            deviceRegistrationsByDay[day].Abandoned += 1;
          }
        });
      
        // Convert to an array and sort chronologically
        this.data = Object.values(deviceRegistrationsByDay).sort((a: any, b: any) => a.Date.localeCompare(b.Date));
      } else {
        console.error('Expected an array for allRegisteredDevices but received:', allRegisteredDevices);
      }
      
      
    });
  }
  navigateToClientList(): void {
    this.router.navigate(['client-list']); // Navigate to client list on click
  }
  processEnvironmentData(data: any[]): any[] {
    const environmentMap = data.reduce((acc, client) => {
      const environmentType = client?.environmentType;
      if (environmentType) {
        acc[environmentType] = (acc[environmentType] || 0) + 1;
      }
      return acc;
    }, {});
    
    return Object.keys(environmentMap).map((env) => ({
      environment: env,
      count: environmentMap[env]
    }));
  }

  public series1Fill: string = '#2485fa'
  public series2Fill: string = '#FEC200'

  public animation: Object = {
    enable: true
  };
  public border: Object = { width:3 };
  public pieTooltipSetting: Object = { enable: true, format: '${point.x}', enableHighlight: true };
  public palettes: string[] = ["#61EFCD", "#CDDE1F", "#FEC200", "#CA765A", "#2485FA", "#F57D7D", "#C152D2",
    "#8854D9", "#3D4EB8", "#00BCD7", "#4472c4", "#ed7d31", "#ffc000", "#70ad47", "#5b9bd5", "#c1c1c1", "#6f6fe2", "#e269ae", "#9e480e", "#997300"];

  public dataLabel: Object = {
    visible: true,
    position: 'Outside', name: 'TextMapping',
    connectorStyle: { length: '10px', type:'Curve' }
  };
  public enableBorderOnMouseMove: boolean = false;
  public enableSmartLabels: boolean = false;
  public pielegendSettings: Object = {
    visible: false,
  };
  public startAngle: number = 270;
  public endAngle: number = 270;
  public accumulationload(args: IAccLoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Fluent2';
    args.accumulation.theme = <AccumulationTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark").replace(/contrast/i, 'Contrast').replace(/-highContrast/i, 'HighContrast');
  };  


  public spLineAreaprimaryXAxis: Object = {
    valueType: 'Category',
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    edgeLabelPlacement: 'Shift',
    lableStyle: { size: '11px' }
  };
  //Initializing Primary Y Axis
  public spLineAreaprimaryYAxis: Object = {
    labelFormat: '${value}',
    lineStyle: { width: 0 },
    maximum: 12000,
    minimum: 0,
    majorTickLines: { width: 0 },
    lableStyle: { size: '11px' },
    textStyle: { size: '13px' }
  };
  public spLineLegendSettings: Object = {
    enableHighlight: true,
  }
  public spLineAreatooltipSettings: Object = {
    enable: true,
    shared: true,
    enableMarker: false
  };
  public spLineAreaBorder: Object = {
    width: 2.75,
    color:'#2485fa'
  };
  public spLineAreaBorder1: Object = {
    width: 2.75,
    color:'#FEC200'
  };

  public spLineAreaFill: string = '#2485fa'
  public spLineAreaFill1: string = '#FEC200'
  public load(args: ILoadedEventArgs ): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Fluent2';
    args.chart.theme = <ChartTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark").replace(/contrast/i, 'Contrast').replace(/-highContrast/i, 'HighContrast');
    args.chart.series[0].fill = 'url(#' +'gradient-chart)';
    args.chart.series[1].fill = 'url(#' +'gradient-chart1)';
};

public pointRender(args: IAccPointRenderEventArgs): void {
  let selectedTheme: string = location.hash.split('/')[1];
  selectedTheme = selectedTheme ? selectedTheme : 'Fluent2';
  if (selectedTheme.indexOf('dark') > -1 )
  {
    if(selectedTheme.indexOf('material') > -1 )
    {
      args.border.color = '#303030' ;
      this.layoutColor= '#303030' ;
    }
    else if(selectedTheme.indexOf('bootstrap5') > -1 )
    {
      args.border.color = '#212529' ;
      this.layoutColor= '#212529' ;
    }
    else if(selectedTheme.indexOf('bootstrap') > -1 )
    {
      args.border.color = '#1A1A1A' ;
      this.layoutColor= '#1A1A1A' ;
    }
    else if(selectedTheme.indexOf('tailwind') > -1 )
    {
      args.border.color = '#1F2937' ;
      this.layoutColor= '#1F2937' ;
    }
    else if(selectedTheme.indexOf('fluent') > -1 )
    {
      args.border.color = '#252423' ;
      this.layoutColor= '#252423' ;
    }
    else if(selectedTheme.indexOf('fabric') > -1 )
    {
      args.border.color = '#201f1f' ;
      this.layoutColor= '#201f1f' ;
    }
    else
    {
      args.border.color = '#222222' ;
      this.layoutColor= '#222222' ;
    }
  }
  else if(selectedTheme.indexOf('highcontrast') > -1)
  {
    args.border.color = '#000000' ;
    this.layoutColor= '#000000' ;
  }
  else
  {
    args.border.color = '#FFFFFF' ;
    this.layoutColor= '#FFFFFF' ;
  }

  if(selectedTheme.indexOf('highcontrast') > -1 || selectedTheme.indexOf('dark') > -1)
  {
    let element =  document.querySelector('#header1') as HTMLElement 
    element.style.color='#F3F2F1';
    let element1 =  document.querySelector('#header2') as HTMLElement 
    element1.style.color='#F3F2F1';
    let element2 =  document.querySelector('#header3') as HTMLElement 
    element2.style.color='#F3F2F1';
  }
  if(selectedTheme.indexOf('tailwind') > -1)
  {
    let element =  document.querySelector('#layout_0_body') as HTMLElement 
    element.style.padding='0';
    let element1 =  document.querySelector('#layout_1_body') as HTMLElement 
    element1.style.padding='0';
    let element2 =  document.querySelector('#layout_2_body') as HTMLElement 
    element2.style.padding='0';
  }
  let element =  document.querySelector('#layout_0template') as HTMLElement 
  element.style.background= this.layoutColor;
  let elementBody = document.getElementById('column');
  if (elementBody) {
    elementBody.style.background = this.layoutColor;
  }
  let element1 =  document.querySelector('#layout_1template') as HTMLElement 
  element1.style.background= this.layoutColor;
  let element1Body = document.getElementById('pie');
  if (element1Body) {
  element1Body.style.background = this.layoutColor;
  }
  let element2 =  document.querySelector('#layout_2template') as HTMLElement 
  element2.style.background=this.layoutColor;
  let element2Body = document.getElementById('spline');
  if (element2Body) {
  element2Body.style.background = this.layoutColor;
  }
};

constructor(private router: Router, private http: HttpClient) {}

public width: string = Browser.isDevice ? '100%' : '75%';


//Initializing Primary X Axis
public primaryXAxis: Object = {
    valueType: 'Category', interval: 1, majorGridLines: { width: 0 }, majorTickLines: {width: 0}, minorTickLines: {width: 0}
};
//Initializing Primary Y Axis
public primaryYAxis: Object = {
    title: 'Number of Devices',
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 }
};
public tooltip: Object = {
    enable: true
};
//Initializing Marker
public marker: Object = {
    dataLabel: {
        visible: true,
        position: 'Top',
        font: {
            fontWeight: '600',
            color: '#ffffff'
        }
    }
};
public legend: Object = {
    visible: true,
}
//Initializing Chart Title
public title: string = 'Device Registration and Activity Status';
//Initializing Legend
public legendSettings: Object = {
  visible: false,
};
public dataLabel1: Object = {
  visible: true,
  position: 'Outside', name: 'DataLabelMappingName',
  font: {
      fontWeight: '600'
  },
  connectorStyle: { length: '20px', type: 'Curve'},
  
};

// custom code start
public loadPie(args: IAccLoadedEventArgs): void {
  let selectedTheme: string = location.hash.split('/')[1];
  selectedTheme = selectedTheme ? selectedTheme : 'Fluent2';
  args.accumulation.theme = <AccumulationTheme>(selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark").replace(/contrast/i, 'Contrast').replace(/-highContrast/i, 'HighContrast');
};
// custom code end

// custom code end
public startAngle1: number = Browser.isDevice ? 55 : 35;
public radius: string = Browser.isDevice ? '40%' : '70%'
public explode: boolean = true;
public enableAnimation: boolean = true;
public atooltip: Object = { 
    enable: true,
    enableHighlight: true,
    format: '<b>${point.x}</b><br>Client Status Share: <b>${point.y}%</b>',
    header:'',

};



public spLineAreaData: Object[] = [
  { Period : "Jan", Percentage : 3600 },
  { Period : "Feb", Percentage : 6200 },
  { Period : "Mar", Percentage : 8100 },
  { Period : "Apr", Percentage : 5900 },
  { Period : "May", Percentage : 8900 },
  { Period : "Jun", Percentage : 7200 },
  { Period : "Jul", Percentage : 4300 },
  { Period : "Aug", Percentage : 4600 },
  { Period : "Sep", Percentage : 5500 },
  { Period : "Oct", Percentage : 6350 },
  { Period : "Nov", Percentage : 5700 },
  { Period : "Dec", Percentage : 8000 }
];
public spLineAreaData2: Object[] = [
 { Period : "Jan", Percentage : 6400,},
 { Period : "Feb", Percentage : 5300 },
 { Period : "Mar", Percentage : 4900 },
 { Period : "Apr", Percentage : 5300 },
 { Period : "May", Percentage : 4200 },
 { Period : "Jun", Percentage : 6500 },
 { Period : "Jul", Percentage : 7900 },
 { Period : "Aug", Percentage : 3800 },
 { Period : "Sep", Percentage : 6800 },
 { Period : "Oct", Percentage : 3400 },
 { Period : "Nov", Percentage : 6400 },
 { Period : "Dec", Percentage : 6800 }
];

}
