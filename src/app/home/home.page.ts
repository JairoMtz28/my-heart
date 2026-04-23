import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Chart } from 'chart.js/auto';
import { DataService } from '../data-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class HomePage implements OnInit {

  @ViewChild('lineCanvas') lineCanvas!: ElementRef;

  bpm: number = 0;
  chart!: Chart;

  intervalo: any;
  colaSenal: number[] = [];

  dataPoints: number[] = new Array(200).fill(0);

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.iniciarListener();

    this.dataService.bpm$.subscribe((pulsos) => {

      // 🔥 convertir a BPM reales
      this.bpm = Math.round(pulsos * 6);

      // usar los pulsos reales para la gráfica
      this.colaSenal = this.generarECG(pulsos);

      this.iniciarAnimacion();
    });
  }

  ngAfterViewInit() {
    this.chart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Electrocardiograma',
          data: this.dataPoints,
          borderColor: 'white',
          borderWidth: 2,
          tension: 0.2,
          pointRadius: 0
        }]
      },
      options: {
        animation: false,
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  actualizarGrafica() {
    if (!this.chart) return;

    this.chart.data.labels = this.dataPoints.map((_, i) => i.toString());
    this.chart.data.datasets[0].data = this.dataPoints;
    this.chart.update();
  }

  // 🔥 Generador de señal tipo ECG
  generarECG(pulsos: number): number[] {

    const señal: number[] = [];
    const totalPuntos = 200;

    // base plana
    for (let i = 0; i < totalPuntos; i++) {
      señal.push(0);
    }

    for (let i = 0; i < pulsos; i++) {

      const pos = Math.floor((i + 1) * (totalPuntos / (pulsos + 1)));

      // ⚠️ evitar desbordes
      if (pos - 3 < 0 || pos + 4 >= totalPuntos) continue;

      // 🫀 forma tipo ECG
      señal[pos - 3] = 0.2;    // onda P pequeña
      señal[pos - 2] = -0.5;   // bajada Q
      señal[pos - 1] = 1;      // subida previa
      señal[pos] = 2.5;        // pico R (principal)
      señal[pos + 1] = -1;     // bajada S
      señal[pos + 2] = 0.5;    // recuperación
      señal[pos + 3] = 0.2;    // estabilización
    }

    return señal;
  }

  iniciarAnimacion() {

    // limpiar animación anterior
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    const duracionTotal = 10000; // 10 segundos
    const intervaloTiempo = duracionTotal / this.colaSenal.length;

    let index = 0;

    this.intervalo = setInterval(() => {

      if (index >= this.colaSenal.length) {
        clearInterval(this.intervalo);
        return;
      }

      // eliminar primer punto (sale por la izquierda)
      this.dataPoints.shift();

      // agregar nuevo punto (entra por la derecha)
      this.dataPoints.push(this.colaSenal[index]);

      this.actualizarGrafica();

      index++;

    }, intervaloTiempo);
  }
}