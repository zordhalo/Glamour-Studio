import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ServiceResponseDto } from '../../interfaces/service.dto';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  services: ServiceResponseDto[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.get<ServiceResponseDto[]>('services').subscribe(data => {
      this.services = data;
    });
  }

  getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('facial')) return 'face';
    if (name.includes('nail') || name.includes('manicure') || name.includes('pedicure')) return 'front_hand';
    if (name.includes('makeup')) return 'brush';
    if (name.includes('hair')) return 'content_cut';
    if (name.includes('massage')) return 'spa';
    if (name.includes('eye') || name.includes('lash')) return 'visibility';
    if (name.includes('brow')) return 'remove_red_eye';
    if (name.includes('wax')) return 'cleaning_services';
    return 'auto_awesome';
  }
}
