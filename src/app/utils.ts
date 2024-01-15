export function padStart(value: unknown, maxLen: number, pad: string) {
  return String(value).padStart(maxLen, pad);
}

export function map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
