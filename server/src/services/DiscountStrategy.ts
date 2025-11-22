export interface DiscountStrategy {
  applyDiscount(originalPrice: number): number;
}

export class NoDiscountStrategy implements DiscountStrategy {
  applyDiscount(originalPrice: number): number {
    return originalPrice;
  }
}

export class PercentageDiscountStrategy implements DiscountStrategy {
  private percentage: number; // e.g., 0.10 for 10%

  constructor(percentage: number) {
    if (percentage < 0 || percentage > 1) {
      throw new Error('Percentage must be between 0 and 1.');
    }
    this.percentage = percentage;
  }

  applyDiscount(originalPrice: number): number {
    return originalPrice * (1 - this.percentage);
  }
}

export class FixedAmountDiscountStrategy implements DiscountStrategy {
  private fixedAmount: number;

  constructor(fixedAmount: number) {
    if (fixedAmount < 0) {
      throw new Error('Fixed amount cannot be negative.');
    }
    this.fixedAmount = fixedAmount;
  }

  applyDiscount(originalPrice: number): number {
    return Math.max(0, originalPrice - this.fixedAmount); // Ensure price doesn't go below 0
  }
}
