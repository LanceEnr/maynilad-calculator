// Offline copy of Maynilad's bill calculator
// (https://www.mayniladwater.com.ph/corporate/customers/bills-and-payments/bill-calculator/).
//
// The formula is a port of Maynilad's own bill-engine.js, and the rates and
// constants are the ones that page loaded on Nov 25, 2026. Results were
// checked against Maynilad's engine for every combination of options.
//
// When Maynilad changes rates (FCDA is reviewed quarterly; tariffs usually
// move every January), update RATE_TABLES and CONSTANTS below.

export const RATES_AS_OF = "Nov 25, 2026";

export type CustomerType = "residential" | "semi_business" | "commercial" | "industrial";
export type Sewerage = "1" | "0";
export type YesNo = "1" | "0";

export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "semi_business", label: "Semi Business" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

export const SEWERAGE_OPTIONS: { value: Sewerage; label: string }[] = [
  { value: "1", label: "Sewered" },
  { value: "0", label: "Unsewered" },
];

export const YES_NO: { value: YesNo; label: string }[] = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

/** Maintenance Service Charge per connection, in pesos. */
export const METER_SIZES: { value: string; label: string; msc: number }[] = [
  { value: "1", label: '1/2" or 13mm', msc: 1.5 },
  { value: "2", label: '3/4" or 20mm', msc: 2 },
  { value: "3", label: '1" or 25mm', msc: 3 },
  { value: "4", label: "1-1/4 or 40mm", msc: 4 },
  { value: "5", label: '2" or 50mm', msc: 6 },
  { value: "6", label: '3" or 75mm', msc: 10 },
  { value: "7", label: '4" or 100mm', msc: 20 },
  { value: "8", label: '6" or 150mm', msc: 35 },
  { value: "9", label: '8" or 200mm', msc: 50 },
];

/** Local tax rate (%) per business area; added to the 2% franchise tax. */
export const BUSINESS_AREAS: { value: string; label: string; rate: number }[] = [
  { value: "NSCAL", label: "Navotas - South Caloocan BA (NSCAL BA)", rate: 0.825 },
  { value: "MVAL", label: "Malabon - Valenzuela BA (MVAL BA)", rate: 0.75 },
  { value: "SQC", label: "South Quezon City BA (SQC BA)", rate: 0.627 },
  { value: "MNL", label: "Manila BA (MNL BA)", rate: 0.825 },
  { value: "ECAV", label: "East Cavite BA (ECAV BA)", rate: 0.5 },
  { value: "NQC", label: "North Quezon City BA (NQC BA)", rate: 0.627 },
  { value: "PPM", label: "Parañaque - Pasay/Makati BA (PPM BA)", rate: 0.55 },
  { value: "NCAL", label: "North Caloocan BA (NCAL BA)", rate: 0.825 },
  { value: "WCAV", label: "West Cavite BA (WCAV BA)", rate: 0.5 },
  { value: "MLP", label: "Muntinlupa - Las Piñas BA (MLP BA)", rate: 0.55 },
  { value: "KAR", label: "Key Accounts Relations (KAR)", rate: 0.627 },
];

const CONSTANTS = {
  fcdaRate: 0.0002,
  fcda20BelowRate: 0, // FCDA for lifeline customers
  envChargeRate: 0.25,
  sewerageChargeRate: 0.2, // Commercial and Industrial, sewered only
  seniorDiscountRate: 0.05,
  seniorCeiling: 30, // cu.m
  franchiseTaxRate: 2, // %
  residentialFlat: 145.07, // Residential, 10 cu.m or less
  lifelineFlat: 117.3, // Lifeline, 10 cu.m or less
};

const RESIDENTIAL_FLAT_LIMIT = 10;
const LIFELINE_LIMIT = 20;

/** [cu.m in this tier, pesos]; the first tier is a flat charge for its cu.m. */
type RateTable = [number, number][];

const RATE_TABLES: Record<CustomerType | "lifeline", RateTable> = {
  residential: [[10, 247.24], [10, 30.15], [20, 57.37], [20, 75.35], [20, 88.04], [20, 92.07], [50, 96.28], [50, 100.59], [200, 104.82]],
  semi_business: [[10, 247.24], [10, 50.63], [20, 62.43], [20, 79.18], [20, 92.07], [20, 96.34], [50, 100.59], [50, 104.82], [200, 108.95]],
  lifeline: [[10, 117.3], [10, 17.71]],
  commercial: [[10, 1123.63], [90, 112.89], [100, 113.18], [100, 113.53], [100, 113.91], [100, 114.29], [100, 114.82], [100, 115.31], [100, 115.7], [100, 116.09], [100, 116.44], [200, 116.96], [200, 117.31], [200, 117.93], [200, 118.25], [200, 118.53], [500, 118.87], [500, 119.51], [500, 119.92], [500, 120.34], [500, 120.56], [500, 121.08], [500, 121.6], [500, 121.88], [500, 122.36], [500, 122.8], [500, 123.11], [500, 123.58], [500, 124.1], [500, 124.44], [500, 124.89], [500, 125.32], [10000, 125.7]],
  industrial: [[10, 1215.83], [90, 122.36], [100, 123.11], [100, 124.1], [100, 124.89], [100, 125.7], [100, 126.61], [100, 127.41], [100, 128.17], [100, 129.13], [100, 129.88], [200, 130.75], [200, 131.53], [200, 132.51], [200, 133.18], [200, 134.13], [500, 134.97], [500, 135.71], [500, 136.5], [500, 137.51], [500, 138.2], [500, 139.21], [500, 139.95], [500, 140.69], [500, 141.67], [500, 142.51], [500, 143.3], [500, 144.29], [500, 144.91], [500, 145.92], [500, 146.66], [500, 147.59], [10000, 148.35]],
};

/** Round to 2 decimals, half away from zero (same as Maynilad's engine). */
const round2 = (n: number): number => {
  const sign = n < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(n) * 100 + 1e-7)) / 100;
};

/** Flat first tier, then per-cu.m tiers; the last tier takes everything left. */
const tieredCharge = (consumption: number, table: RateTable): number => {
  if (consumption <= 0) return 0;
  const [[flatVolume, flatRate], ...tiers] = table;
  if (consumption <= flatVolume) return flatRate;
  let charge = flatRate;
  let remaining = consumption - flatVolume;
  tiers.forEach(([volume, rate], i) => {
    if (remaining <= 0) return;
    const used = i === tiers.length - 1 ? remaining : Math.min(remaining, volume);
    charge += used * rate;
    remaining -= used;
  });
  return charge;
};

export interface BillInput {
  customerType: CustomerType;
  sewerage: Sewerage;
  lifeline: YesNo;
  senior: YesNo;
  /** Whole cubic meters. */
  consumption: number;
  meterSize: string;
  businessArea: string;
}

export interface BillBreakdown {
  basicCharge: number;
  /** A deduction, shown as a negative amount. */
  fcda: number;
  /** A deduction, shown as a negative amount. */
  seniorDiscount: number;
  environmentalCharge: number;
  sewerCharge: number;
  msc: number;
  governmentTaxes: number;
  total: number;
  isLifeline: boolean;
}

/** Returns the bill in pesos, or null if an input is missing or invalid. */
export const calculateBill = (input: BillInput): BillBreakdown | null => {
  const meter = METER_SIZES.find((m) => m.value === input.meterSize);
  const area = BUSINESS_AREAS.find((a) => a.value === input.businessArea);
  const consumption = input.consumption;
  if (!RATE_TABLES[input.customerType] || !meter || !area) return null;
  if (!Number.isInteger(consumption) || consumption < 0) return null;

  const C = CONSTANTS;
  const type = input.customerType;
  const residential = type === "residential";
  const isLifeline = residential && input.lifeline === "1" && consumption <= LIFELINE_LIMIT;
  const table = RATE_TABLES[isLifeline ? "lifeline" : type];

  const basic =
    residential && consumption <= RESIDENTIAL_FLAT_LIMIT
      ? isLifeline
        ? C.lifelineFlat
        : C.residentialFlat
      : tieredCharge(consumption, table);
  const fcda = basic * (isLifeline ? C.fcda20BelowRate : C.fcdaRate);
  const senior =
    residential && input.senior === "1" && consumption <= C.seniorCeiling
      ? basic * C.seniorDiscountRate
      : 0;
  const env = basic * C.envChargeRate;
  const sewer =
    input.sewerage === "1" && (type === "commercial" || type === "industrial")
      ? basic * C.sewerageChargeRate
      : 0;
  const taxRate = (C.franchiseTaxRate + area.rate) / 100;

  // Same order as Maynilad: round each line, round the subtotal, then tax.
  const rb = round2(basic);
  const rf = round2(fcda);
  const rs = round2(senior);
  const re = round2(env);
  const rw = round2(sewer);
  const rm = round2(meter.msc);
  const subTotal = round2(rb - rf + re + rw + rm);
  const tax = round2((subTotal - rs) * taxRate);

  return {
    basicCharge: rb,
    fcda: rf === 0 ? 0 : -rf,
    seniorDiscount: rs === 0 ? 0 : -rs,
    environmentalCharge: re,
    sewerCharge: rw,
    msc: rm,
    governmentTaxes: tax,
    total: round2(subTotal - rs + tax),
    isLifeline,
  };
};

export interface MayniladSettings {
  customerType: CustomerType;
  sewerage: Sewerage;
  lifeline: YesNo;
  senior: YesNo;
  meterSize: string;
  businessArea: string;
}

export const DEFAULT_SETTINGS: MayniladSettings = {
  customerType: "residential",
  sewerage: "1",
  lifeline: "0",
  senior: "0",
  meterSize: "1",
  businessArea: "MNL",
};

/** Turns saved (possibly stale or hand-edited) settings into valid ones. */
export const normalizeSettings = (raw: unknown): MayniladSettings => {
  const saved = (raw ?? {}) as Record<string, unknown>;
  const pick = <T extends string>(options: { value: T }[], value: unknown, fallback: T): T =>
    options.find((o) => o.value === value)?.value ?? fallback;
  return {
    customerType: pick(CUSTOMER_TYPES, saved.customerType, DEFAULT_SETTINGS.customerType),
    sewerage: pick(SEWERAGE_OPTIONS, saved.sewerage, DEFAULT_SETTINGS.sewerage),
    lifeline: pick(YES_NO, saved.lifeline, DEFAULT_SETTINGS.lifeline),
    senior: pick(YES_NO, saved.senior, DEFAULT_SETTINGS.senior),
    meterSize: pick(METER_SIZES, saved.meterSize, DEFAULT_SETTINGS.meterSize),
    businessArea: pick(BUSINESS_AREAS, saved.businessArea, DEFAULT_SETTINGS.businessArea),
  };
};

/** Short description such as "Residential · Unsewered · North Quezon City BA". */
export const describeSettings = (s: MayniladSettings): string =>
  [
    CUSTOMER_TYPES.find((o) => o.value === s.customerType)?.label,
    SEWERAGE_OPTIONS.find((o) => o.value === s.sewerage)?.label,
    s.customerType === "residential" && s.lifeline === "1" ? "Lifeline" : null,
    s.customerType === "residential" && s.senior === "1" ? "Senior" : null,
    BUSINESS_AREAS.find((o) => o.value === s.businessArea)?.label.replace(/ \(.*\)$/, ""),
  ]
    .filter(Boolean)
    .join(" · ");
