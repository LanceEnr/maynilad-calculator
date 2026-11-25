// Offline copy of Maynilad's bill calculator
// (https://mayniladwebsite-staging.azurewebsites.net/bill-calculator/).
//
// Maynilad's page computes the bill on their server. These tables were read
// back from that server on Nov 25, 2026 and checked against 1,600 of its
// results (every customer type, sewerage option, meter size and business
// area); all matched to the centavo.
//
// When Maynilad changes rates (FCDA is reviewed quarterly; tariffs usually
// move every January), update the numbers below. All money is in centavos so
// the rounding matches Maynilad's exactly.

export const RATES_AS_OF = "Nov 25, 2026";

export type CustomerType = "1" | "2" | "3" | "4";
export type Sewerage = "1" | "0";

export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: "1", label: "Residential" },
  { value: "2", label: "Semi-business" },
  { value: "3", label: "Business Group I" },
  { value: "4", label: "Business Group II" },
];

export const SEWERAGE_OPTIONS: { value: Sewerage; label: string }[] = [
  { value: "1", label: "Sewered" },
  { value: "0", label: "Unsewered" },
];

// Maintenance Service Charge per connection, in centavos.
export const METER_SIZES: { value: string; label: string; msc: number }[] = [
  { value: "1", label: '1/2" or 13mm', msc: 150 },
  { value: "2", label: '3/4" or 20mm', msc: 200 },
  { value: "3", label: '1" or 25mm', msc: 300 },
  { value: "4", label: "1-1/4 or 40mm", msc: 400 },
  { value: "5", label: '2" or 50mm', msc: 600 },
  { value: "6", label: '3" or 75mm', msc: 1000 },
  { value: "7", label: '4" or 100mm', msc: 2000 },
  { value: "8", label: '6" or 150mm', msc: 3500 },
  { value: "9", label: '8" or 200mm', msc: 5000 },
];

// Government taxes as a share of the subtotal, in thousandths of a percent
// (2627 = 2.627%). They differ by business area because local taxes differ.
export const BUSINESS_AREAS: { value: string; label: string; tax: number }[] = [
  { value: "1100", label: "Parañaque - Pasay/Makati BA (PPM BA)", tax: 2500 },
  { value: "1200", label: "North Caloocan BA (NCAL BA)", tax: 2825 },
  { value: "1600", label: "West Cavite BA (WCAV BA)", tax: 2500 },
  { value: "1700", label: "Muntinlupa - Las Piñas BA (MLP BA)", tax: 2550 },
  { value: "1800", label: "Accounts Management and Special Projects", tax: 2627 },
  { value: "200", label: "Navotas - South Caloocan BA (NSCAL BA)", tax: 2825 },
  { value: "300", label: "Malabon - Valenzuela BA (MVAL BA)", tax: 2750 },
  { value: "400", label: "South Quezon City BA (SQC BA)", tax: 2627 },
  { value: "600", label: "Manila BA (MNL BA)", tax: 2825 },
  { value: "800", label: "East Cavite BA (ECAV BA)", tax: 2500 },
  { value: "900", label: "North Quezon City BA (NQC BA)", tax: 2627 },
];

interface Tariff {
  /** Charge for 0-10 cu.m, in centavos. */
  minimum: number;
  /** What the first 10 cu.m cost once usage goes past 10 (Residential only). */
  firstTenAbove10?: number;
  /** [upper limit in cu.m, centavos per cu.m] for usage past 10 cu.m. */
  blocks: [number, number][];
}

const TARIFFS: Record<CustomerType, Tariff> = {
  "1": {
    minimum: 13054,
    firstTenAbove10: 22248,
    blocks: [
      [20, 2714], [40, 5162], [60, 6780], [80, 7922], [100, 8285],
      [150, 8664], [200, 9051], [Infinity, 9433],
    ],
  },
  "2": {
    minimum: 22248,
    blocks: [
      [20, 4556], [40, 5618], [60, 7125], [80, 8285], [100, 8669],
      [150, 9051], [200, 9433], [Infinity, 9804],
    ],
  },
  "3": {
    minimum: 101110,
    blocks: [
      [100, 10158], [200, 10184], [300, 10216], [400, 10250], [500, 10284],
      [600, 10332], [700, 10376], [800, 10411], [900, 10446], [1000, 10478],
      [1200, 10525], [1400, 10556], [1600, 10612], [1800, 10640], [2000, 10666],
      [2500, 10697], [3000, 10754], [3500, 10791], [4000, 10829], [4500, 10849],
      [5000, 10895], [5500, 10942], [6000, 10967], [6500, 11011], [7000, 11050],
      [7500, 11078], [8000, 11121], [8500, 11167], [9000, 11198], [9500, 11238],
      [10000, 11277], [Infinity, 11311],
    ],
  },
  "4": {
    minimum: 109407,
    blocks: [
      [100, 11011], [200, 11078], [300, 11167], [400, 11238], [500, 11311],
      [600, 11393], [700, 11465], [800, 11534], [900, 11620], [1000, 11687],
      [1200, 11766], [1400, 11836], [1600, 11924], [1800, 11984], [2000, 12069],
      [2500, 12145], [3000, 12212], [3500, 12283], [4000, 12374], [4500, 12436],
      [5000, 12527], [5500, 12593], [6000, 12660], [6500, 12748], [7000, 12824],
      [7500, 12895], [8000, 12984], [8500, 13039], [9000, 13131], [9500, 13198],
      [10000, 13281], [Infinity, 13349],
    ],
  },
};

// Percentages of the basic charge, as [numerator, denominator].
const FCDA: [number, number] = [-65, 10000]; // -0.65%
const ENVIRONMENTAL: [number, number] = [20, 100]; // 20%
const SEWER: [number, number] = [20, 100]; // 20%, Business Groups I & II only, sewered

/** Integer division rounded half away from zero (Maynilad's rounding). */
const divRound = (num: number, den: number): number =>
  Math.sign(num) * Math.floor((Math.abs(num) * 2 + den) / (2 * den));

const pct = (amount: number, [num, den]: [number, number]): number =>
  divRound(amount * num, den);

export interface BillInput {
  customerType: CustomerType;
  sewerage: Sewerage;
  /** Whole cubic meters. */
  consumption: number;
  meterSize: string;
  businessArea: string;
}

export interface BillBreakdown {
  basicCharge: number;
  fcda: number;
  environmentalCharge: number;
  sewerCharge: number;
  msc: number;
  subtotal: number;
  governmentTaxes: number;
  total: number;
}

/** Basic charge in centavos for a whole number of cubic meters. */
const basicChargeCentavos = (tariff: Tariff, consumption: number): number => {
  if (consumption <= 10) return tariff.minimum;
  let charge = tariff.firstTenAbove10 ?? tariff.minimum;
  let lower = 10;
  for (const [upper, rate] of tariff.blocks) {
    if (consumption <= lower) break;
    charge += (Math.min(consumption, upper) - lower) * rate;
    lower = upper;
  }
  return charge;
};

/** Returns the bill in pesos, or null if an input is missing or invalid. */
export const calculateBill = (input: BillInput): BillBreakdown | null => {
  const tariff = TARIFFS[input.customerType];
  const meter = METER_SIZES.find((m) => m.value === input.meterSize);
  const area = BUSINESS_AREAS.find((a) => a.value === input.businessArea);
  const consumption = input.consumption;
  if (!tariff || !meter || !area) return null;
  if (!Number.isInteger(consumption) || consumption < 0) return null;

  const isBusiness = input.customerType === "3" || input.customerType === "4";
  const basic = basicChargeCentavos(tariff, consumption);
  const fcda = pct(basic, FCDA);
  const environmental = pct(basic, ENVIRONMENTAL);
  const sewer = isBusiness && input.sewerage === "1" ? pct(basic, SEWER) : 0;
  const msc = meter.msc;
  const subtotal = basic + fcda + environmental + sewer + msc;
  const taxes = divRound(subtotal * area.tax, 100000);

  return {
    basicCharge: basic / 100,
    fcda: fcda / 100,
    environmentalCharge: environmental / 100,
    sewerCharge: sewer / 100,
    msc: msc / 100,
    subtotal: subtotal / 100,
    governmentTaxes: taxes / 100,
    total: (subtotal + taxes) / 100,
  };
};

export interface MayniladSettings {
  customerType: CustomerType;
  sewerage: Sewerage;
  meterSize: string;
  businessArea: string;
}

export const DEFAULT_SETTINGS: MayniladSettings = {
  customerType: "1",
  sewerage: "0",
  meterSize: "1",
  businessArea: "",
};

/** Turns saved (possibly stale or hand-edited) settings into valid ones. */
export const normalizeSettings = (raw: unknown): MayniladSettings => {
  const saved = (raw ?? {}) as Record<string, unknown>;
  const pick = <T extends string>(options: { value: T }[], value: unknown, fallback: T): T =>
    options.find((o) => o.value === value)?.value ?? fallback;
  return {
    customerType: pick(CUSTOMER_TYPES, saved.customerType, DEFAULT_SETTINGS.customerType),
    sewerage: pick(SEWERAGE_OPTIONS, saved.sewerage, DEFAULT_SETTINGS.sewerage),
    meterSize: pick(METER_SIZES, saved.meterSize, DEFAULT_SETTINGS.meterSize),
    businessArea: pick(BUSINESS_AREAS, saved.businessArea, DEFAULT_SETTINGS.businessArea),
  };
};

/** Short description such as "Residential · Unsewered · North Quezon City BA". */
export const describeSettings = (s: MayniladSettings): string =>
  [
    CUSTOMER_TYPES.find((o) => o.value === s.customerType)?.label,
    SEWERAGE_OPTIONS.find((o) => o.value === s.sewerage)?.label,
    BUSINESS_AREAS.find((o) => o.value === s.businessArea)?.label.replace(/ \(.*\)$/, ""),
  ]
    .filter(Boolean)
    .join(" · ");
