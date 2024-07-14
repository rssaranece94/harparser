import {
  Component,
  ElementRef,
  OnInit,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { parseDoc } from './app.worker';
import { APP_NAME } from './app-constant';
import { FilterComponent } from '@ngxhelpers/multi-filter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Entry } from './har-model';
import { RecordComponent } from './record/record.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FilterComponent,
    MatCheckboxModule,
    FormsModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    RecordComponent,
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
}
