import {animate, state, style, transition, trigger} from '@angular/animations';
import {NgTemplateOutlet} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import {padStart, PadStartPipe} from '../pipes/pad-start.pipe';

@Component({
  selector: 'app-number',
  standalone: true,
  imports: [
    PadStartPipe,
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

      state('ready', style({
        transform: 'rotateX(360deg)'
      })),

      state('running', style({
        transform: 'rotateX(180deg)'
      })),

      state('readyBack', style({
        transform: 'rotateX(180deg)'
      })),

      state('runningBack', style({
        transform: 'rotateX(360deg)'
      })),

      transition('ready => running', [
        animate('0.5s cubic-bezier(.42,0,.58,1)')
      ]),

      transition('readyBack => runningBack', [
        animate('0.5s cubic-bezier(.42,0,.58,1)')
      ])
    ])
  ]
})
export class NumberComponent implements OnInit, AfterViewInit {

  @Input() animationTime = 1;
  @Input({required: true}) min!: number
  @Input({required: true}) max!: number;
  @Input({required: true}) value!: number;
  @Output() maxReached = new EventEmitter<void>();
  @Output() minReached = new EventEmitter<void>();
  @Input() cardUp!: TemplateRef<any>;
  @Input() cardDown!: TemplateRef<any>;
  @Input() color = 'black';
  @HostBinding('style.font-size.rem') @Input() fontSize = 1;
  @HostBinding('style.font-weight') @Input() fontWeight = 500;
  protected state = signal<'ready' | 'running' | 'readyBack' | 'runningBack' | 'steady'>('steady');
  protected displayed!: WritableSignal<{
    top: number,
    bottom: number,
    faceFront: number,
    faceBack: number
  }>
  protected maxLen = 0;
  protected separatorColor = 'silver';
  protected readonly padStart = padStart;

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.displayed = signal({
      top: this.value,
      bottom: this.value,
      faceFront: -1,
      faceBack: -1
    });

    this.maxLen = this.max.toString().length;
  }

  increment() {

    if (this.state() !== 'steady') {
      return;
    }

    if (this.value + 1 > this.max) {
      this.maxReached.emit();
      return;
    }

    this.state.set('ready');

    this.displayed.set({
      top: this.value + 1,
      faceFront: this.value,
      faceBack: this.value + 1,
      bottom: this.value
    });

    setTimeout(() => {
      this.state.set('running');
    });

    this.value++;
  }

  decrement() {

    if (this.state() !== 'steady') {
      return;
    }

    if (this.value - 1 < this.min) {
      this.minReached.emit();
      return;
    }

    this.state.set('readyBack');

    this.displayed.set({
      top: this.value,
      bottom: this.value - 1,
      faceFront: this.value - 1,
      faceBack: this.value
    });

    setTimeout(() => {
      this.state.set('runningBack');
    });

    this.value--;
  }

  setValue(value: number, direction: 'up' | 'down' = 'down') {

    if (this.value === value) {
      return;
    }

    if (this.max > value || this.min > value) {
      return;
    }

    if (this.state() !== 'steady') {
      return;
    }

    if (direction === 'down') {

      this.state.set('readyBack');

      this.displayed.set({
        top: this.value,
        faceFront: value,
        faceBack: this.value,
        bottom: value
      });

      setTimeout(() => {
        this.state.set('runningBack');
      });
    }

    if (direction === 'up') {

      this.state.set('ready');

      this.displayed.set({
        top: value,
        faceFront: this.value,
        faceBack: value,
        bottom: this.value
      });

      setTimeout(() => {
        this.state.set('running');
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

  ngAfterViewInit(): void {

    const separatorColor = (this.el.nativeElement as HTMLElement).querySelector('[data-separator-color]')?.getAttribute('data-separator-color');

    if (separatorColor) {
      this.separatorColor = separatorColor;
      this.cdr.detectChanges();
    }
  }

  protected captureDoneStateEvent(toState: string) {
    if (toState === 'running' || toState === 'runningBack') {
      this.state.set('steady');
    }

    if (toState === 'running') {
      this.displayed.update((displayed) => {
        return {
          ...displayed,
          bottom: this.value
        }
      });
    }

    if (toState === 'runningBack') {
      this.displayed.update((displayed) => {
        return {
          ...displayed,
          top: this.value
        }
      });
    }

  }

  protected map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
}
