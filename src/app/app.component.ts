import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { parseDoc } from './app.worker';
import { APP_NAME } from './app-constant';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  inputFile = viewChild<ElementRef<HTMLInputElement>>('inputFile');
  items: any = [];
  onFileSelection(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('./app.worker', import.meta.url));
        console.log('Worker initialized.');
        worker.onmessage = ({ data }) => {
          console.log('Response received.');
          console.log('ParsedData: ', data);
          this.items = data?.log?.entries ?? [];
          worker.terminate();
          console.log('Worker terminated.');
        };
        worker.postMessage({ src: APP_NAME, file });
        console.log('Message sent.');
      } else {
        console.log('Web worker not available running in main thread..');
        parseDoc(file).then((data: any) => {
          console.log('ParsedData: ', data);
          this.items = data?.log?.entries ?? [];
        }); // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }
    }
  }
  getString(data: any) {
    return JSON.stringify(data, null, 2);
  }
  getCodeBasedColor(val: number | any) {
    if (typeof val === 'number') {
      if (val === 0) return 'red';
      if (val >= 100 && val < 200) return 'purple';
      if (val >= 200 && val < 300) return 'green';
      if (val >= 300 && val < 400) return 'lite-orange';
      if (val >= 400 && val < 500) return 'orange';
      if (val >= 500) return 'red';
    }
    return 'blue';
  }
  getTime(time: number) {
    const rounded = Math.round(time * 100) / 100;
    let ms = rounded;
    if (rounded > 60000) {
      let mm = (rounded / 1000 / 60) % 60;
      const mmr = Math.round(mm * 100) / 100;
      return mmr + ' m';
    } else if (rounded > 1000) {
      let ss = (rounded / 1000) % 60;
      const ssr = Math.round(ss * 100) / 100;
      return ssr + ' s';
    }
    return ms + ' ms';
  }
  jsonParse(val?: string) {
    return JSON.parse(val ?? '{}');
  }
}
