import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padStart',
  standalone: true
})
export class PadStartPipe implements PipeTransform {

  transform(value: unknown, maxLen: number, pad: string): unknown {
    return padStart(value, maxLen, pad);
  }
}

export function padStart(value: unknown, maxLen: number, pad: string) {
  return String(value).padStart(maxLen, pad);
}
