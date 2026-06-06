export interface CountryTaxRate {
  countryCode: string;
  countryName: string;
  standardRate: number;
  reducedRates: Array<{
    category: string;
    rate: number;
    description: string;
  }>;
  categories: string[];
}

export interface TaxCalculationResult {
  countryCode: string;
  category: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  breakdown: Array<{
    productId: string;
    productName: string;
    amount: number;
    tax: number;
    rate: number;
  }>;
}
