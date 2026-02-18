/**
 * Rules-based recommendations for courier earnings
 * Returns exactly 3 explainable recommendations in Czech
 */

export interface Recommendation {
  title: string;
  description: string;
  reason: string;
  /** Target delta, e.g. "+0.5 doručení/h", "+20 Kč/hod" */
  targetDelta: string;
}

export interface RecommendationInputs {
  deliveriesPerHour: number;
  hourlyRate: number;
  earningsPerDelivery: number;
}

/**
 * Generate exactly 3 recommendations based on performance metrics
 */
export function generateRecommendations(
  inputs: RecommendationInputs
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Recommendation 1: Based on deliveries per hour
  if (inputs.deliveriesPerHour < 2) {
    recommendations.push({
      title: "Zvyšte počet doručení za hodinu",
      description:
        "Aktuálně doručujete méně než 2 zásilky za hodinu. Zaměřte se na efektivnější trasování a plánování.",
      reason: `Doručujete ${inputs.deliveriesPerHour.toFixed(1)} zásilek za hodinu, což je pod průměrem.`,
      targetDelta: "+0.5 až +1 doručení/h",
    });
  } else if (inputs.deliveriesPerHour > 4) {
    recommendations.push({
      title: "Výborné tempo doručení",
      description:
        "Doručujete více než 4 zásilky za hodinu, což je nadprůměrné. Pokračujte v tomto tempu.",
      reason: `Doručujete ${inputs.deliveriesPerHour.toFixed(1)} zásilek za hodinu, což je výborný výkon.`,
      targetDelta: "udržet tempo",
    });
  } else {
    recommendations.push({
      title: "Optimalizujte trasování",
      description:
        "Vaše tempo doručení je solidní. Zvažte skupinování objednávek ve stejné oblasti pro vyšší efektivitu.",
      reason: `Doručujete ${inputs.deliveriesPerHour.toFixed(1)} zásilek za hodinu, což je průměrné.`,
      targetDelta: "+0.3 až +0.5 doručení/h",
    });
  }

  // Recommendation 2: Based on hourly rate
  if (inputs.hourlyRate < 200) {
    recommendations.push({
      title: "Zvažte změnu platformy nebo oblasti",
      description:
        "Vaše hodinová sazba je pod 200 Kč/hod. Zkuste porovnat nabídky jiných platforem nebo pracovat v lépe placených oblastech.",
      reason: `Vaše hodinová sazba ${Math.round(inputs.hourlyRate)} Kč/hod je pod doporučenou úrovní.`,
      targetDelta: "+20 až +50 Kč/hod",
    });
  } else if (inputs.hourlyRate >= 250) {
    recommendations.push({
      title: "Výborná hodinová sazba",
      description:
        "Vaše hodinová sazba je nad 250 Kč/hod, což je velmi dobrý výkon. Pokračujte v současném přístupu.",
      reason: `Vaše hodinová sazba ${Math.round(inputs.hourlyRate)} Kč/hod je nadprůměrná.`,
      targetDelta: "udržet úroveň",
    });
  } else {
    recommendations.push({
      title: "Zaměřte se na špičkové hodiny",
      description:
        "Vaše hodinová sazba je solidní. Zvažte práci během špičkových hodin (obědy, večeře) pro vyšší výdělky.",
      reason: `Vaše hodinová sazba ${Math.round(inputs.hourlyRate)} Kč/hod je průměrná.`,
      targetDelta: "+10 až +30 Kč/hod",
    });
  }

  // Recommendation 3: Based on earnings per delivery
  if (inputs.earningsPerDelivery < 50) {
    recommendations.push({
      title: "Hledejte lépe placené objednávky",
      description:
        "Průměrný výdělek na doručení je pod 50 Kč. Zvažte zaměření na delší trasy nebo objednávky s vyšším spropitným.",
      reason: `Průměrně vyděláváte ${Math.round(inputs.earningsPerDelivery)} Kč na doručení, což je pod průměrem.`,
      targetDelta: "+10 až +20 Kč/doručení",
    });
  } else if (inputs.earningsPerDelivery >= 80) {
    recommendations.push({
      title: "Výborný výdělek na doručení",
      description:
        "Průměrně vyděláváte více než 80 Kč na doručení, což je skvělé. Pokračujte v zaměřování se na kvalitní objednávky.",
      reason: `Průměrně vyděláváte ${Math.round(inputs.earningsPerDelivery)} Kč na doručení, což je nadprůměrné.`,
      targetDelta: "udržet úroveň",
    });
  } else {
    recommendations.push({
      title: "Balancujte počet a hodnotu doručení",
      description:
        "Váš průměrný výdělek na doručení je solidní. Zvažte kombinaci rychlých a hodnotnějších objednávek.",
      reason: `Průměrně vyděláváte ${Math.round(inputs.earningsPerDelivery)} Kč na doručení, což je průměrné.`,
      targetDelta: "+5 až +15 Kč/doručení",
    });
  }

  return recommendations;
}
