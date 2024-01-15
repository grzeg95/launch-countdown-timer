import {animate, state, style, transition, trigger} from '@angular/animations';
import {NgTemplateOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import {map, padStart} from '../utils';

@Component({
  selector: 'app-number',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './number.component.html',
  styleUrl: './number.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-number'
  },
  animations: [
    trigger('state', [

      state('readyUp', style({
        transform: 'rotateX(180deg)'
      })),

      state('runningUp', style({
        transform: 'rotateX(360deg)'
      })),

      state('readyDown', style({
        transform: 'rotateX(360deg)'
      })),

      state('runningDown', style({
        transform: 'rotateX(180deg)'
      })),

      transition('readyUp => runningUp', [
        animate('0.5s cubic-bezier(.42,0,.58,1)')
      ]),

      transition('readyDown => runningDown', [
        animate('0.5s cubic-bezier(.42,0,.58,1)')
      ])
    ])
  ]
})
export class NumberComponent implements OnInit {

  protected readonly padStart = padStart;
  protected readonly map = map;

  @HostBinding('style.font-size.rem') @Input() fontSize = 1;
  @HostBinding('style.font-weight') @Input() fontWeight = 500;

  @Input({required: true}) min!: number
  @Input({required: true}) value!: number;
  @Input() separatorColor = 'silver';
  @Input({required: true}) cardUp!: TemplateRef<any>;
  @Input({required: true}) cardDown!: TemplateRef<any>;
  @Input() color = 'black';

  @Output() maxReached = new EventEmitter<void>();
  @Output() minReached = new EventEmitter<void>();

  protected state = signal<'readyUp' | 'readyDown' | 'runningUp' | 'runningDown' | 'steady'>('steady');
  protected displayed!: WritableSignal<{
    top: number,
    bottom: number,
    faceFront: number,
    faceBack: number
  }>;

  protected maxLen = 0;

  private _max!: number;

  get max() {
    return this._max;
  }

  @Input({required: true}) set max(value: number) {
    this._max = value;
    this.maxLen = this.max.toString().length;
  }

  ngOnInit(): void {
    this.displayed = signal({
      top: this.value,
      bottom: this.value,
      faceFront: -1,
      faceBack: -1
    });
  }

  increment(direction: 'up' | 'down' = 'down') {

    if (this.value + 1 > this.max) {
      this.maxReached.emit();
      return;
    }

    this.setValue(this.value + 1, direction);
  }

  decrement(direction: 'up' | 'down' = 'up') {

    if (this.value - 1 < this.min) {
      this.minReached.emit();
      return;
    }

    this.setValue(this.value + -1, direction);
  }

  setValue(value: number, direction: 'up' | 'down' = 'down') {

    if (this.value === value) {
      return;
    }

    if (this.max < value || this.min > value) {
      return;
    }

    if (this.state() !== 'steady') {
      return;
    }

    if (direction === 'down') {

      this.state.set('readyDown');

      this.displayed.set({
        top: value,
        faceFront: this.value,
        faceBack: value,
        bottom: this.value
      });

      setTimeout(() => {
        this.state.set('runningDown');
      });
    }

    if (direction === 'up') {

      this.state.set('readyUp');

      this.displayed.set({
        top: this.value,
        faceFront: value,
        faceBack: this.value,
        bottom: value
      });

      setTimeout(() => {
        this.state.set('runningUp');
      });
    }

    this.value = value;
  }

  setMax(direction?: 'up' | 'down') {
    this.setValue(this.max, direction ? direction : this.max > this.value ? 'up' : 'down');
  }

  setMin(direction?: 'up' | 'down') {
    this.setValue(this.min, direction ? direction : this.min < this.value ? 'down' : 'up');
  }

  protected captureDoneStateEvent(toState: string) {

    if (toState === 'runningUp' || toState === 'runningDown') {
      this.state.set('steady');
    }

    if (toState === 'runningDown') {
      this.displayed.update((displayed) => {
        return {
          ...displayed,
          bottom: this.value
        }
      });
    }

    if (toState === 'runningUp') {
      this.displayed.update((displayed) => {
        return {
          ...displayed,
          top: this.value
        }
      });
    }
  }
}
