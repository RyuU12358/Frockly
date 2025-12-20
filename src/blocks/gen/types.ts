export type FnSpec = {
  name: string;       // SUM
  min: number;        // 1
  variadic: boolean;  // true/false
  step?: number;      // variadic only
  max?: number;       // variadic only (0 = unlimited)
};

export type FnSpecMap = Map<string, FnSpec>;
