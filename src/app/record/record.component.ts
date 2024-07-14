import {
  Component,
  Input,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { Entry, Header } from '../har-model';
import {
  NGX_OVERLAY_DATA,
  NgxOverlay,
  NgxOverlayRef,
} from '@ngxhelpers/overlay';
import { MatIconModule } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [MatAccordion, MatExpansionModule, JsonPipe],
  templateUrl: './record.component.html',
  styleUrl: './record.component.scss',
})
export class RecordComponent {
  responseData = input(false);
  showDetails = input(false);
  items = input<Entry[]>([]);

  accordion = viewChild.required(MatAccordion);
  customOverlay = inject(NgxOverlay);
  constructor() {
    effect(() => {
      // console.log(this.showDetails());
      if (this.showDetails()) {
        this.accordion().openAll();
      } else {
        this.accordion().closeAll();
      }
    });
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
