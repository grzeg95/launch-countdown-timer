import {DOCUMENT, NgTemplateOutlet} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  NO_ERRORS_SCHEMA,
  QueryList,
  Renderer2,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {interval, Subscription} from 'rxjs';
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

  @ViewChildren(NumberComponent) numberComponents!: QueryList<NumberComponent>;

  subs: Subscription[] = [];

  theme = {
    colorSecond: 'hsl(237, 18%, 59%)',
    colorActive: 'hsl(345, 95%, 68%)',
    color: 'hsl(0, 0%, 100%)',
    cardBackground: 'hsl(236, 21%, 26%)',
    background: 'hsl(235, 16%, 14%)',
    cardShadow: 'hsl(234, 17%, 12%)',
    fontSize: 0.7,
    fontWeight: 900,
    backgroundMask: '/assets/images/bg-stars.svg',
    backgroundGround: '/assets/images/pattern-hills.svg',
    text: 'We\'re launching soon'
  }

  numbers = [
    {
      desc: 'days',
      min: 0,
      max: 99,
      value: 10
    },
    {
      desc: 'hours',
      min: 0,
      max: 23,
      value: 0
    },
    {
      desc: 'minutes',
      min: 0,
      max: 59,
      value: 0
    },
    {
      desc: 'seconds',
      min: 0,
      max: 59,
      value: 10
    }
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
  }

  reload() {

    for (let sub of this.subs) {
      sub.unsubscribe();
    }
    this.subs = [];

    this.renderer.setStyle(this.document.body, 'background-color', this.theme.background);

    if (this.numberComponents?.length) {

      for (let [i, numberComponent] of this.numberComponents.toArray().entries()) {

        if (i == 0) {
          this.subs.push(
            numberComponent.minReached.asObservable().subscribe(() => numberComponent.setMax())
          );
        } else {
          this.subs.push(
            numberComponent.minReached.asObservable().subscribe(() => {
              numberComponent.setMax();
              this.numberComponents.get(i - 1)?.decrement();
            })
          );
        }
      }

      const decrementator = interval(1000).subscribe(() => {
        this.numberComponents.get(this.numberComponents.length - 1)?.decrement();
      })

      this.subs.push(decrementator);
    }
  }

  ngAfterViewInit(): void {
    this.reload();
  }
}
