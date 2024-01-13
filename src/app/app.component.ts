import {DOCUMENT, NgTemplateOutlet} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  NO_ERRORS_SCHEMA,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NumberComponent} from './number/number.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NumberComponent, NgTemplateOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-root'
  },
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AppComponent implements AfterViewInit {

  @ViewChild('seconds') seconds!: NumberComponent;

  theme = {
    'colorSecond': 'hsl(237, 18%, 59%)',
    'colorActive': 'hsl(345, 95%, 68%)',
    'color': 'hsl(0, 0%, 100%)',
    'cardBackground': 'hsl(236, 21%, 26%)',
    'background': 'hsl(235, 16%, 14%)',
    'cardShadow': 'hsl(234, 17%, 12%)'
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    this.renderer.setStyle(this.document.body, 'background-color', this.theme.background);
  }

  ngAfterViewInit(): void {
    setInterval(() => {
      this.seconds.decrement()
    }, 1000);
  }
}
