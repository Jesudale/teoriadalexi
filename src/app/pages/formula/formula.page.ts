import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AuthService } from './../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Chart, registerables,ChartConfiguration  } from 'chart.js';

import { SupabaseApiService } from './../../services/supabase-api-service.service';
import { TranslateService } from '@ngx-translate/core'; 


@Component({
  selector: 'app-formula',
  templateUrl: './formula.page.html',
  styleUrls: ['./formula.page.scss'],
})
export class FormulaPage implements OnInit, AfterViewInit {
@ViewChild('produccionChart') produccionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('circulacionChart') circulacionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distribucionChart') distribucionRef!: ElementRef<HTMLCanvasElement>;  
  @ViewChild('resultadoChart') resultadoChart!: ElementRef;
  chart2!: Chart<'pie'>;   // 👈 tipa directamente como pie chart

  produccionChart: any;
  circulacionChart: any;
  distribucionChart: any;

  resultado: any = [
    {
      produccion: 690.1535498648918,
      circulacion: 690.0,
      diferencia: 0.1535498648918,
      equilibrio: true
    }
  ];

  equilibrio: any = [
    {
      produccion: 690.1535498648918,
      circulacion: 690.0,
      diferencia: 0.1535498648918,
      equilibrio: true
    }
  ];

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

  // valores máximos iniciales (igual que los iniciales de params)
  maxA = 4;
  maxL = 394;
  maxK = 50;
  maxCp = 1;
  maxA0 = 110.4;
  maxE = 10;

    updateMax(field: string) {
    switch (field) {
      case 'a': this.params.a = this.maxA; break;
      case 'l': this.params.l = this.maxL; break;
      case 'k': this.params.k = this.maxK; break;
      case 'cp': this.params.cp = this.maxCp; break;
      case 'a0': this.params.a0 = this.maxA0; break;
      case 'e': this.params.e = this.maxE; break;
      case 'w': this.params.omega = this.params.omega; break;
    }
    this.updateCharts()
  }

    updatePi() {
    this.params.pi = 1 - this.params.omega;
    this.updateMax('w')
  }
  
  // Formateador para el pin
  formatValue(value: number) {
    return value.toFixed(1); // siempre muestra con una coma decimal
  }

// resultado: any;
chart: any;

puntoPartidaProduccion: number | null = null;

establecerPuntoPartida() {
  if (this.resultado && this.resultado[0]) {
    this.puntoPartidaProduccion = this.resultado[0].produccion;
    console.log('Punto de partida establecido:', this.puntoPartidaProduccion);
  }
}

 currentLang = 'es';

  constructor(
        private authService: AuthService,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private navContoller: NavController,
        private router: Router,
        private supabaseApi: SupabaseApiService,
        private translate: TranslateService
  ) { 
    
    Chart.register(...registerables);   // 👈 registra todos los controladores
    // translate.setDefaultLang('es');
     this.translate.setDefaultLang(this.currentLang);

  }

  ngOnInit() {
  }

   ngAfterViewInit() {
    this.initCharts();
this.initChart();
  }

  
  async changeLang(lang: string) {
  const loader = await this.loadingController.create({
    message: 'Cambiando idioma...',
    spinner: 'crescent',
    translucent: true,
    cssClass: 'custom-loader'
  });
  await loader.present();

  this.translate.use(lang).subscribe({
    next: async () => {
      await loader.dismiss();
    },
    error: async () => {
      await loader.dismiss();
    }
  });
}
  
// Función para calcular porcentaje
 calcularPorcentaje(res: any) {
  const produccion = res.produccion;
  const diferencia = res.diferencia;

  const porcentaje = (diferencia / produccion) * 100;

console.log(`La diferencia representa ${porcentaje.toFixed(2)}% de la producción`);

  return porcentaje.toFixed(2); // dos cifras decimales
}

clasificarDiferencia(resultado: { produccion: number, circulacion: number, diferencia: number, equilibrio: boolean | number  }) {
  const pasa_resultado=resultado
  const produccion = resultado.produccion;
  const diferenciaAbs = Math.abs(resultado.diferencia); // 👈 convertir a positivo

  const porcentaje = (diferenciaAbs / produccion) * 100;

  let categoria = '';
  if (porcentaje >= 5 && porcentaje < 10) {
    categoria = 'Ligera';
  } else if (porcentaje >= 10 && porcentaje < 25) {
    categoria = 'Moderada';
  } else if (porcentaje >= 25) {
    categoria = 'Aguda';
  } else {
    categoria = 'Sin relevancia';
  }

   if (categoria =='Sin relevancia') {
    
  console.log(`La diferencia entre los dos valores representa ${porcentaje.toFixed(2)}% del valor la producción → La economía está en equilibrio dinámico`);

  }else {
    console.log(`La diferencia entre los dos valores representa ${porcentaje.toFixed(2)}% del valor la producción → Los fenómenos se muestran de manera ${categoria}`);
  }
  this.evaluarEconomia(pasa_resultado)
  // return { porcentaje: porcentaje.toFixed(2), categoria };
}

evaluarEconomia(resultado: { produccion: number, circulacion: number, diferencia: number, equilibrio: boolean | number }) {
  // Si equilibrio es 1 (o true)
  if (resultado.equilibrio === 1 || resultado.equilibrio === true) {
    console.log("Economía en equilibrio dinámico");
    return "Economía en equilibrio dinámico";
  }



  // Si equilibrio es false → comparar producción vs circulación
 /*  if (resultado.produccion > resultado.circulacion) {
    console.log("Dominancia de la Producción");
    return "Dominancia de la Producción";
  } else {
    console.log("Dominancia de la Circulación");
    return "Dominancia de la Circulación";
  } */

      this.compararEconomia(this.equilibrio,this.resultado)
}

  updateCp() {
  // Asegurar que Cp esté entre 0 y 1
  if (this.params.cp < 0) this.params.cp = 0;
  if (this.params.cp > 1) this.params.cp = 1;

  // Redondear a un decimal
  this.params.cp = parseFloat(this.params.cp.toFixed(1));
}

initChart() {
  const data = this.resultado[0]; // 👈 tomamos el primer objeto

  const config: ChartConfiguration<'pie'> = {
    type: 'pie',
    data: {
      labels: [
        'Producción ' + data.produccion.toFixed(2),
        'Circulación ' + data.circulacion.toFixed(2)
      ],
      datasets: [{
        data: [data.produccion, data.circulacion],
        backgroundColor: ['#36A2EB', '#FF6384'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  this.chart2 = new Chart<'pie'>(this.resultadoChart.nativeElement, config);
  this.calcular();
}

  updateChart() {
   // if (!this.chart2 || !this.resultado) return;
 
    const data = this.resultado[0];
    this.chart2.data.datasets[0].data = [data.produccion, data.circulacion];
    this.chart2.data.labels = [
    `Producción (${data.produccion.toFixed(2)})`,
    `Circulación (${data.circulacion.toFixed(2)})`
  ];

  this.chart2.data.datasets[0].data = [
    data.produccion,
    data.circulacion
  ];

  
    this.chart2.update();
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
        this.updateChart()
       // this.calcularPorcentaje(this.resultado[0]);
        this.clasificarDiferencia(this.resultado[0]);

      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }


compararEconomia(
  equilibrio: { produccion: number; circulacion: number }[],
  api: { produccion: number; circulacion: number }[]
) {
  const eq = equilibrio[0];
  const apiRes = api[0];

  // Dominancia absoluta de la Producción
  if (eq.produccion < apiRes.produccion && eq.circulacion > apiRes.circulacion) {
    console.log("Dominancia absoluta de la Producción, crisis por la acción de la LBTCG");
    return "Dominancia absoluta de la Producción, crisis por la acción de la LBTCG";
  }

  // Dominancia absoluta de la Circulación
  if (apiRes.produccion < eq.produccion && apiRes.circulacion > eq.circulacion) {
    console.log("Dominancia absoluta de la Circulación, Estanflacion");
    return "Dominancia absoluta de la Circulación, Estanflacion";
  }

  // Dominancias relativas de la Produccion y la CirculacionI

  // Dominancia relativa de la Produccion
  if (apiRes.produccion > apiRes.circulacion) {

                // 👇 cuadrante cuatro en dominancia de la produccion
            if (eq.produccion < apiRes.produccion && eq.circulacion === apiRes.circulacion) {
              console.log("Cuadrante cuatro");
              return "Cuadrante cuatro";
            }

            // 👇 cuadrante tres 
            if (eq.produccion === apiRes.produccion && eq.circulacion > apiRes.circulacion) {
              console.log("Cuadrante tres");
              return "Cuadrante tres";
            }

            // 👇 expansión económica con fenómenos del cuadrante cuatro
            if (eq.produccion < apiRes.produccion && eq.circulacion < apiRes.circulacion) {
              console.log("Expansión de la economía con las manifestaciones de los fenómenos del cuadrante cuatro");
              return "Expansión de la economía con las manifestaciones de los fenómenos del cuadrante cuatro";
            }

            // 👇 recesión económica con fenómenos del cuadrante cuatro
            if (apiRes.produccion < eq.produccion && apiRes.circulacion < eq.circulacion) {
              console.log("Recesión de la economía con manifestación de los fenómenos del cuadrante cuatro");
              return "Recesión de la economía con manifestación de los fenómenos del cuadrante cuatro";
            }

    console.log("Dominancia Relativa de la Producción");
    return "Dominancia Relativa de la Producción";
  } else {

    // Dominancia relativa de la CirculacionI  
    
        // 👇 cuadrante dos en dominancia relativa de la circulación
        if (eq.circulacion < apiRes.circulacion && eq.produccion === apiRes.produccion) {
          console.log("Cuadrante dos");
          return "Cuadrante dos";
        }

        // 👇 cuadrante uno en dominancia relativa de la circulación
        if (eq.circulacion === apiRes.circulacion && eq.produccion > apiRes.produccion) {
          console.log("Cuadrante uno");
          return "Cuadrante uno";
        }

        // 👇 expansión económica con fenómenos del cuadrante dos
        if (eq.circulacion < apiRes.circulacion && eq.produccion < apiRes.produccion) {
          console.log("Expansión de la economía con manifestación de los fenómenos del cuadrante dos");
          return "Expansión de la economía con manifestación de los fenómenos del cuadrante dos";
        }
                    // 👇 recesión económica con fenómenos del cuadrante dos
            if (apiRes.produccion < eq.produccion && apiRes.circulacion < eq.circulacion) {
              console.log("Recesión de la economía con manifestación de los fenómenos del cuadrante dos");
              return "Recesión de la economía con manifestación de los fenómenos del cuadrante dos";
            }
        
    console.log("Dominancia Relativa de la Circulación");
    return "Dominancia Relativa de la Circulación";
  }


}

    initCharts() {
     // Producción
    this.produccionChart = new Chart(this.produccionRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['A', 'L', 'K'],
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
        labels: ['Cp', 'A0', 'e'],
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
        labels: ['Salarios', 'Beneficios'],
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
