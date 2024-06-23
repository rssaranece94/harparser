import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { parseDoc } from './app.worker';
import { APP_NAME } from './app-constant';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
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
}
