import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AuthService } from './../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { Chart, registerables,ChartConfiguration  } from 'chart.js';

import { SupabaseApiService } from './../../services/supabase-api-service.service';
import { TranslateService } from '@ngx-translate/core'; 

declare var MathJax: any;
import katex from 'katex';

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

    estado_econo: any = [
    {
      dominancia:"",
      cuadrante:"",
      fenomeno:"",
      causa: ""
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


formula = 'AL^{\\omega} K^{\\pi} = \\frac{1}{1-(\\omega + c_p \\pi)} \\cdot A_0 \\cdot e';
variableAjustada:boolean=false 

respuestaAjustada= 
[
  {
    "produccion_original": "690.1535498648917945794787857641912",
    "circulacion_original": "1035.00000000000000000",
    "diferencia_original": "-344.8464501351082054205212142358088",
    "equilibrio_original": false,
    "nuevo_a0": null,
    "nuevo_l": "774.14193656089752556",
    "produccion_final": "1035.000000000000082635840987986446468",
    "circulacion_final": "1035.00000000000000000",
    "diferencia_final": "0.000000000000082635840987986446468",
    "equilibrio_final": true
  }
]

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
      if (MathJax) {
          MathJax.typesetPromise();
        }
        const el = document.getElementById('formula');
    if (el) {
      katex.render(this.formula, el, {
        throwOnError: false
      });
    }
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

     this.estado_econo[0] = {
      fenomeno: "FENOMENO_EQUIL",
      causa: "CAUSA_EQUIL"
    };

    console.log("Economía en equilibrio dinámico");
    return "Economía en equilibrio dinámico";
  }


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
    this.variableAjustada=false
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

    buscarEquilibrio() {


    this.supabaseApi.buscarEquilibrio(this.params).subscribe({
      next: (res) => {
        console.log('Resultado buscarEquilibrio:', res);
        
        this.respuestaAjustada=res[0]
            // Actualizar resultado con los valores finales de la respuesta
            this.resultado = [{
              produccion: res[0].produccion_final,
              circulacion: res[0].circulacion_final,
              diferencia: res[0].diferencia_final,
              equilibrio: res[0].equilibrio_final
            }];

            // Actualizar equilibrio (puedes copiar el mismo objeto o aplicar lógica distinta)
            this.equilibrio = [{
              produccion: res[0].produccion_final,
              circulacion: res[0].circulacion_final,
              diferencia: res[0].diferencia_final,
              equilibrio: res[0].equilibrio_final
            }];

            // Actualizar solo l y a0 si existen en la respuesta
            if (res[0].nuevo_l !== null) {
              this.params = { ...this.params, l: res[0].nuevo_l };
              this.variableAjustada=true
            }
            if (res[0].nuevo_a0 !== null) {
              this.params = { ...this.params, a0: res[0].nuevo_a0 };
              this.variableAjustada=true
            }


       // this.calcularPorcentaje(this.resultado[0]);
        this.clasificarDiferencia(this.resultado[0]);
        this.updateCharts();
        this.updateChart()
       // this.calcularPorcentaje(this.resultado[0]);
       
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
    this.estado_econo[0] = {
      dominancia: "DOMINANCIA_AP",
      cuadrante: "CUADRANTE_AP",
      fenomeno: "FENOMENO_AP",
      causa: "CAUSA_AP"
    };
    return this.estado_econo[0];
  }

  // Dominancia absoluta de la Circulación
  if (apiRes.produccion < eq.produccion && apiRes.circulacion > eq.circulacion) {
    this.estado_econo[0] = {
      dominancia: "DOMINANCIA_AC",
      cuadrante: "CUADRANTE_AC",
      fenomeno: "FENOMENO_AC",
      causa: "CAUSA_AC"
    };
    return this.estado_econo[0];
  }

  // Dominancia relativa de la Producción
  if (apiRes.produccion > apiRes.circulacion) {
    if (eq.produccion < apiRes.produccion && eq.circulacion === apiRes.circulacion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_4",
        cuadrante: "CUADRANTE_4",
        fenomeno: "FENOMENOS_4",
        causa: "CAUSA_4"
      };
      return this.estado_econo[0];
    }

    if (eq.produccion === apiRes.produccion && eq.circulacion > apiRes.circulacion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_3",
        cuadrante: "CUADRANTE_3",
        fenomeno: "FENOMENOS_3",
        causa: "CAUSA_3"
      };
      return this.estado_econo[0];
    }

    if (eq.produccion < apiRes.produccion && eq.circulacion < apiRes.circulacion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_EXP_4",
        cuadrante: "CUADRANTE_EXP_4",
        fenomeno: "FENOMENOS_EXP_4",
        causa: "CAUSA_EXP_4"
      };
      return this.estado_econo[0];
    }

    if (apiRes.produccion < eq.produccion && apiRes.circulacion < eq.circulacion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_REC_4",
        cuadrante: "CUADRANTE_REC_4",
        fenomeno: "FENOMENOS_REC_4",
        causa: "CAUSA_REC_4"
      };
      return this.estado_econo[0];
    }
  } else {
    // Dominancia relativa de la Circulación
    if (eq.circulacion < apiRes.circulacion && eq.produccion === apiRes.produccion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_2",
        cuadrante: "CUADRANTE_2",
        fenomeno: "FENOMENOS_2",
        causa: "CAUSA_2"
      };
      return this.estado_econo[0];
    }

    if (eq.circulacion === apiRes.circulacion && eq.produccion > apiRes.produccion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_1",
        cuadrante: "CUADRANTE_1",
        fenomeno: "FENOMENOS_1",
        causa: "CAUSA_1"
      };
      return this.estado_econo[0];
    }

    if (eq.circulacion < apiRes.circulacion && eq.produccion < apiRes.produccion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_EXP_2",
        cuadrante: "CUADRANTE_EXP_2",
        fenomeno: "FENOMENOS_EXP_2",
        causa: "CAUSA_EXP_2"
      };
      return this.estado_econo[0];
    }

    if (apiRes.produccion < eq.produccion && apiRes.circulacion < eq.circulacion) {
      this.estado_econo[0] = {
        dominancia: "DOMINANCIA_REC_2",
        cuadrante: "CUADRANTE_REC_2",
        fenomeno: "FENOMENOS_REC_2",
        causa: "CAUSA_REC_2"
      };
      return this.estado_econo[0];
    }
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
        labels: ['Salarios (w)','Beneficios (π)'],
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
