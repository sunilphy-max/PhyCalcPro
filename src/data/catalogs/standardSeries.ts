/**
 * Standard size series for catalog sweeps in Design mode.
 */

/** Standard spring wire diameters (mm) per EN 10270 stock sizes */
export const SPRING_WIRE_DIAMETERS_MM: number[] = [
  0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
  1.0, 1.1, 1.25, 1.4, 1.6, 1.8, 2.0, 2.25, 2.5, 2.8,
  3.2, 3.6, 4.0, 4.5, 5.0, 5.6, 6.3, 7.0, 8.0, 9.0,
  10.0, 11.0, 12.5, 14.0, 16.0,
];

/** ISO 54 gear module series 1 (preferred, mm) */
export const GEAR_MODULE_SERIES_1_MM: number[] = [
  0.5, 0.6, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25,
];

/** ISO 54 gear module series 2 (second choice, mm) */
export const GEAR_MODULE_SERIES_2_MM: number[] = [
  0.7, 0.9, 1.125, 1.375, 1.75, 2.25, 2.75, 3.5, 4.5, 5.5, 7, 9, 11, 14, 18, 22,
];

/** Combined module series, ascending */
export const GEAR_MODULES_MM: number[] = [...GEAR_MODULE_SERIES_1_MM, ...GEAR_MODULE_SERIES_2_MM].sort(
  (a, b) => a - b
);
