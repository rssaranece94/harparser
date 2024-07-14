import {
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { parseDoc } from './app.worker';
import { APP_NAME } from './app-constant';
import { JsonPipe } from '@angular/common';
import { FilterComponent } from '@ngxhelpers/multi-filter';
import {
  NGX_OVERLAY_DATA,
  NgxOverlay,
  NgxOverlayRef,
} from '@ngxhelpers/overlay';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Entry, Header } from './har-model';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    JsonPipe,
    FilterComponent,
    MatCheckboxModule,
    FormsModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatExpansionModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  inputFile = viewChild<ElementRef<HTMLInputElement>>('inputFile');
  items = signal<Entry[]>([]);
  itemsSrc = signal<Entry[]>([]);
  responseData = true;
  showDetails = false;
  categoryControl = new FormControl('all');
  customOverlay = inject(NgxOverlay);

  accordion = viewChild.required(MatAccordion);
  keys = [
    {
      data: ':method',
      label: 'Method',
    },
    {
      data: ':path',
      label: 'Path',
    },
    {
      data: ':scheme',
      label: 'Scheme',
    },
    {
      data: 'accept',
      label: 'Accept',
    },
    {
      data: 'content-type',
      label: 'Content Type',
    },
    {
      data: 'origin',
      label: 'Origin',
    },
  ];
  constructor() {
    effect(
      () => {
        if (this.itemsSrc()) {
          this.updateFilters();
        }
      },
      { allowSignalWrites: true },
    );
  }
  ngOnInit(): void {
    this.categoryControl.valueChanges.subscribe((res) => {
      this.updateFilters();
    });
  }
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
          this.itemsSrc.update(() => data?.log?.entries ?? []);
          worker.terminate();
          console.log('Worker terminated.');
        };
        worker.postMessage({ src: APP_NAME, file });
        console.log('Message sent.');
      } else {
        console.log('Web worker not available running in main thread..');
        parseDoc(file).then((data: any) => {
          console.log('ParsedData: ', data);
          this.itemsSrc.update(() => data?.log?.entries ?? []);
          this.updateFilters();
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
  getTime(time: number = 0) {
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
  getContentType(data?: Header[], key?: string) {
    return data?.find((el) => el.name === key)?.value ?? '';
  }
  updateFilters() {
    console.log('Filter started...');
    let data = [...this.itemsSrc()];
    let category = this.categoryControl.value;
    let newData;
    if (category === 'all') {
      newData = data;
    } else {
      newData = data.filter((v) => v._resourceType === category);
    }
    console.log('Filter done...', newData);
    this.items.update(() => newData);
  }
  showData(data?: string) {
    this.customOverlay.open({
      component: ContentViewComponent,
      data: { text: data },
      position: 'center',
      options: {
        hasBackdrop: true,
        panelClass: ['popup'],
      },
    });
  }
  toggleShow() {
    if (this.showDetails) {
      this.accordion().openAll();
    } else {
      this.accordion().closeAll();
    }
  }
}

@Component({
  selector: 'app-response',
  standalone: true,
  template: ` <mat-icon (click)="overlayRef?.close()">close</mat-icon>
    <pre class="data-box">{{ data?.text ?? '' }}</pre>`,
  styles: `
    :host {
      width: 100%;
      position: relative;
    }
    .mat-icon {
      position: absolute;
      right: 20px;
      top: 10px;
      z-index: 1;
      cursor: pointer;
    }
  `,
  imports: [MatIconModule],
})
export class ContentViewComponent {
  data: any = inject(NGX_OVERLAY_DATA);
  overlayRef: any = inject(NgxOverlayRef);
}
