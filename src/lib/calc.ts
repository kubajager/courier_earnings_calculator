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
  deliveriesPerHour: number;
  weeklyEarnings: number;
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
 * Deliveries per hour
 */
export function calculateDeliveriesPerHour(
  deliveriesPerWeek: number,
  hoursPerWeek: number
): number {
  if (hoursPerWeek <= 0) return 0;
  return deliveriesPerWeek / hoursPerWeek;
}

/**
 * Perform all calculations
 */
export function calculateAll(inputs: CalculationInputs): CalculationResults {
  const hourlyRate = calculateHourlyRate(inputs.earningsPerWeek, inputs.hoursPerWeek);
  const earningsPerDelivery = calculateEarningsPerDelivery(
    inputs.earningsPerWeek,
    inputs.deliveriesPerWeek
  );
  const deliveriesPerHour = calculateDeliveriesPerHour(
    inputs.deliveriesPerWeek,
    inputs.hoursPerWeek
  );
  return {
    hourlyRate,
    earningsPerDelivery,
    monthlyEstimate: calculateMonthlyEstimate(inputs.earningsPerWeek),
    deliveriesPerHour,
    weeklyEarnings: inputs.earningsPerWeek,
  };
}

/** Reference targets for efficiency score (0–100). Weights: hourly 50%, deliveries/h 30%, earnings/delivery 20%. */
const EFF_TARGETS = { hourly: 250, deliveriesPerHour: 4, earningsPerDelivery: 80 };

/**
 * Explainable efficiency score 0–100.
 * Weights: hourly 50%, deliveries/hour 30%, earnings/delivery 20%.
 */
export function efficiencyScore(results: {
  hourlyRate: number;
  deliveriesPerHour: number;
  earningsPerDelivery: number;
}): number {
  const h = Math.min(1, results.hourlyRate / EFF_TARGETS.hourly);
  const d = Math.min(1, results.deliveriesPerHour / EFF_TARGETS.deliveriesPerHour);
  const e = Math.min(1, results.earningsPerDelivery / EFF_TARGETS.earningsPerDelivery);
  return Math.round((h * 0.5 + d * 0.3 + e * 0.2) * 100);
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
