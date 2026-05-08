export function integrate(
  x: number[],
  y: number[]
): number[] {

  const result: number[] = [0];

  for (let i = 1; i < x.length; i++) {

    const dx = x[i] - x[i - 1];

    // trapezoidal integration
    const area =
      ((y[i] + y[i - 1]) / 2) * dx;

    result.push(result[i - 1] + area);
  }

  return result;
}