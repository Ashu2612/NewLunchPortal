import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Client {
  clientId: string;
  status: string;
  hostname: string;
  macAddress: string;
  serialNumber: string;
  ipAddress: string;
  version: string;
  environmentType: string;
  registeredOn: string;
  updatedTime: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  displayedColumns: string[] = ['hostname', 'macAddress', 'serialNumber', 'ipAddress', 'version', 'environmentType', 'status', 'registeredOn', 'updatedTime'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:5018/api/Clients/clientAndDeviceStatus').subscribe(response => {
      const abandonedIds = new Set((response.abandonedDevices ?? []).map((c: any) => c.id)); // Get abandoned client IDs
      
      this.clients = [
        // Abandoned Clients
        ...(response.abandonedDevices ?? []).map((client: any) => ({
          clientId: client.id,
          status: 'Abandoned',
          hostname: client.hostname,
          macAddress: client.macAddress,
          serialNumber: client.serialNumber,
          ipAddress: client.ipAddress,
          version: client.version,
          environmentType: client.environmentType,
          registeredOn: client.createdAt,
          updatedTime: client.updatedAt
        })),

        // Active Clients
        ...(response.activeClients ?? []).map((client: any) => ({
          clientId: client.clientId,
          status: 'Active',
          hostname: client.clientDetails?.hostname ?? 'Unknown',
          macAddress: client.clientDetails?.macAddress ?? 'Unknown',
          serialNumber: client.clientDetails?.serialNumber ?? 'Unknown',
          ipAddress: client.clientDetails?.ipAddress ?? 'Unknown',
          version: client.clientDetails?.version ?? 'Unknown',
          environmentType: client.clientDetails?.environmentType ?? 'Unknown',
          registeredOn: client.clientDetails?.createdAt ?? '',
          updatedTime: client.clientDetails?.updatedAt ?? ''
        })),

        // Inactive Clients (Exclude Abandoned)
        ...(response.inactiveClients ?? [])
          .filter((client: any) => !abandonedIds.has(client.clientId)) // Exclude abandoned devices
          .map((client: any) => ({
            clientId: client.clientId,
            status: 'Inactive',
            hostname: client.clientDetails?.hostname ?? 'Unknown',
            macAddress: client.clientDetails?.macAddress ?? 'Unknown',
            serialNumber: client.clientDetails?.serialNumber ?? 'Unknown',
            ipAddress: client.clientDetails?.ipAddress ?? 'Unknown',
            version: client.clientDetails?.version ?? 'Unknown',
            environmentType: client.clientDetails?.environmentType ?? 'Unknown',
            registeredOn: client.clientDetails?.createdAt ?? '',
            updatedTime: client.clientDetails?.updatedAt ?? ''
          }))
      ].sort((a, b) => new Date(a.registeredOn).getTime() - new Date(b.registeredOn).getTime()); // Sort by registered date
    });
  }
}
