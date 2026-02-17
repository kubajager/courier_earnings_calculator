/**
 * Pure calculation functions for courier earnings
 */

export interface CalculationInputs {
  hoursPerWeek: number;
  deliveriesPerWeek: number;
  earningsPerWeek: number;
}

export interface CalculationResults {
  hourlyRate: number;
  earningsPerDelivery: number;
  monthlyEstimate: number;
}

/**
 * Calculate hourly rate from weekly earnings and hours
 */
export function calculateHourlyRate(
  earningsPerWeek: number,
  hoursPerWeek: number
): number {
  if (hoursPerWeek <= 0) return 0;
  return earningsPerWeek / hoursPerWeek;
}

/**
 * Calculate earnings per delivery
 */
export function calculateEarningsPerDelivery(
  earningsPerWeek: number,
  deliveriesPerWeek: number
): number {
  if (deliveriesPerWeek <= 0) return 0;
  return earningsPerWeek / deliveriesPerWeek;
}

/**
 * Calculate monthly estimate (weekly * 4.33)
 */
export function calculateMonthlyEstimate(earningsPerWeek: number): number {
  return earningsPerWeek * 4.33;
}

/**
 * Perform all calculations
 */
export function calculateAll(inputs: CalculationInputs): CalculationResults {
  return {
    hourlyRate: calculateHourlyRate(inputs.earningsPerWeek, inputs.hoursPerWeek),
    earningsPerDelivery: calculateEarningsPerDelivery(
      inputs.earningsPerWeek,
      inputs.deliveriesPerWeek
    ),
    monthlyEstimate: calculateMonthlyEstimate(inputs.earningsPerWeek),
  };
}

/**
 * Format number as CZK currency
 */
export function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
