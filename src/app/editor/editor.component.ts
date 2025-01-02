import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MonacoEditorService } from './editor.service';
import { first } from 'rxjs';

declare var monaco: any;
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit, AfterViewInit {
  public _editor: any;
  @ViewChild('editorContainer', { static: true }) _editorContainer!: ElementRef;
  monacoEditorService = inject(MonacoEditorService);

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    this._editor = monaco.editor.create(this._editorContainer.nativeElement, {
      value: 'console.log("hello")',
      language: 'typescript',
      theme: 'vs-dark',
    });
  }
  ngOnInit(): void {
    this.monacoEditorService.load();
  }
  ngAfterViewInit(): void {
    this.initMonaco();
  }
}
