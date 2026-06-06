import { mockTaxRates, getTaxRate } from '@/data/taxRates';
import type { TaxCalculationResult } from '@/types/tax';

interface TaxItem {
  productId: string;
  productName: string;
  amount: number;
  category: string;
}

export const getApplicableTaxRate = (countryCode: string, category: string): number => {
  console.log('[TaxEngine] Getting applicable tax rate:', { countryCode, category });

  const rate = getTaxRate(countryCode, category);
  const countryTax = mockTaxRates.find(t => t.countryCode === countryCode);
  const countryName = countryTax?.countryName || '未知国家';

  const reducedRate = countryTax?.reducedRates.find(r => r.category === category);
  if (reducedRate) {
    console.log('[TaxEngine] Using reduced tax rate:', {
      country: countryName,
      category,
      rate: `${rate * 100}%`,
      description: reducedRate.description
    });
  } else {
    console.log('[TaxEngine] Using standard tax rate:', {
      country: countryName,
      category,
      rate: `${rate * 100}%`
    });
  }

  return rate;
};

export const calculateTaxByCategory = (
  amount: number,
  countryCode: string,
  category: string
): { taxRate: number; taxAmount: number; taxableAmount: number } => {
  console.log('[TaxEngine] Calculating tax by category:', { amount, countryCode, category });

  const taxRate = getApplicableTaxRate(countryCode, category);
  const taxableAmount = Math.round(amount * 100) / 100;
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;

  console.log('[TaxEngine] Tax calculation result:', {
    taxableAmount,
    taxRate: `${taxRate * 100}%`,
    taxAmount
  });

  return {
    taxRate,
    taxAmount,
    taxableAmount
  };
};

export const calculateTaxBreakdown = (
  items: TaxItem[],
  countryCode: string
): TaxCalculationResult => {
  console.log('[TaxEngine] Calculating tax breakdown for', items.length, 'items');
  console.log('[TaxEngine] Country code:', countryCode);

  const breakdown: TaxCalculationResult['breakdown'] = [];
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;
  let overallRate = 0;
  const categoryRates: Record<string, number> = {};

  items.forEach((item, index) => {
    console.log(`[TaxEngine] Processing item ${index + 1}/${items.length}:`, {
      productId: item.productId,
      productName: item.productName,
      amount: item.amount,
      category: item.category
    });

    const taxResult = calculateTaxByCategory(item.amount, countryCode, item.category);

    breakdown.push({
      productId: item.productId,
      productName: item.productName,
      amount: Math.round(item.amount * 100) / 100,
      tax: taxResult.taxAmount,
      rate: taxResult.taxRate
    });

    totalTaxableAmount += item.amount;
    totalTaxAmount += taxResult.taxAmount;

    if (!categoryRates[item.category]) {
      categoryRates[item.category] = 0;
    }
    categoryRates[item.category] += item.amount;
  });

  totalTaxableAmount = Math.round(totalTaxableAmount * 100) / 100;
  totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;

  if (totalTaxableAmount > 0) {
    overallRate = Math.round((totalTaxAmount / totalTaxableAmount) * 10000) / 10000;
  }

  console.log('[TaxEngine] Tax breakdown summary:', {
    totalItems: items.length,
    totalTaxableAmount,
    totalTaxAmount,
    overallRate: `${(overallRate * 100).toFixed(2)}%`,
    categoryBreakdown: Object.entries(categoryRates).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100
    }))
  });

  console.log('[TaxEngine] Detailed breakdown:', breakdown);

  return {
    countryCode,
    category: 'mixed',
    taxRate: overallRate,
    taxableAmount: totalTaxableAmount,
    taxAmount: totalTaxAmount,
    breakdown
  };
};

console.log('[TaxEngine] Engine initialized successfully');
console.log('[TaxEngine] Supported countries:', mockTaxRates.map(t => `${t.countryCode} (${t.countryName})`));
