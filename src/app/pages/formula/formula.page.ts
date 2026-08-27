import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AuthService } from './../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

import { SupabaseApiService } from './../../services/supabase-api-service.service';

@Component({
  selector: 'app-formula',
  templateUrl: './formula.page.html',
  styleUrls: ['./formula.page.scss'],
})
export class FormulaPage implements OnInit, AfterViewInit {
@ViewChild('produccionChart') produccionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('circulacionChart') circulacionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distribucionChart') distribucionRef!: ElementRef<HTMLCanvasElement>;
  

  produccionChart: any;
  circulacionChart: any;
  distribucionChart: any;

  params = {
    a: 4,
    l: 394,
    k: 50,
    omega: 0.6,
    pi: 0.4,
    cp: 0.2,
    a0: 110.4,
    e: 2
  };

resultado: any;
chart: any;

  constructor(
        private authService: AuthService,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private navContoller: NavController,
        private router: Router,
        private supabaseApi: SupabaseApiService
  ) { 
    
    Chart.register(...registerables);   // 👈 registra todos los controladores
  }

  ngOnInit() {
  }

   ngAfterViewInit() {
    this.initCharts();
  }

    signOut() {
    this.authService.signOut();
  }

  openLogin() {
    this.navContoller.navigateBack('/');
  }

  calcular() {
this.params.omega = parseFloat(this.params.omega.toFixed(1));
  this.params.pi = parseFloat((1 - this.params.omega).toFixed(1));
  
    this.supabaseApi.calcularEquilibrio(this.params).subscribe({
      next: (res) => {
        console.log('Resultado:', res);
        this.resultado = res;
        this.updateCharts();
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

    initCharts() {
     // Producción
    this.produccionChart = new Chart(this.produccionRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['a', 'l', 'k'],
        datasets: [{
          label: 'Producción',
          data: [this.params.a, this.params.l, this.params.k],
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
      }
    });

    // Circulación
    this.circulacionChart = new Chart(this.circulacionRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['cp', 'a0', 'e'],
        datasets: [{
          label: 'Circulación',
          data: [this.params.cp, this.params.a0, this.params.e],
          backgroundColor: 'rgba(255, 159, 64, 0.6)'
        }]
      }
    });

    // Distribución del ingreso
    this.distribucionChart = new Chart(this.distribucionRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['omega', 'pi'],
        datasets: [{
          label: 'Distribución del ingreso',
          data: [this.params.omega, this.params.pi],
          backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }]
      }
    });
  
  }
 updateCharts() {
    this.produccionChart.data.datasets[0].data = [this.params.a, this.params.l, this.params.k];
    this.produccionChart.update();

    this.circulacionChart.data.datasets[0].data = [this.params.cp, this.params.a0, this.params.e];
    this.circulacionChart.update();

    this.distribucionChart.data.datasets[0].data = [this.params.omega, this.params.pi];
    this.distribucionChart.update();
  }

}
