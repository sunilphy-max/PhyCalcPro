export type UnitConverterConfig = {
  value: number;
  dimension: string;
  fromUnit: string;
  toUnit: string;
};

export type UnitConverterResult = {
  convertedValue: number;
  fromUnit: string;
  toUnit: string;
  dimension: string;
};

export type UnitConverterEquivalent = {
  unit: string;
  value: number;
};
