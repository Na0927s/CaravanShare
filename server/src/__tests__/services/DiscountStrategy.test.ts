import { DiscountStrategy, NoDiscountStrategy, PercentageDiscountStrategy, FixedAmountDiscountStrategy } from '../../services/DiscountStrategy';
import { BadRequestError } from '../../exceptions'; // Although not directly thrown by strategies, useful for constructor validation tests

describe('Discount Strategies', () => {

  describe('NoDiscountStrategy', () => {
    it('should return the original price', () => {
      const strategy = new NoDiscountStrategy();
      expect(strategy.applyDiscount(100)).toBe(100);
      expect(strategy.applyDiscount(0)).toBe(0);
      expect(strategy.applyDiscount(123.45)).toBe(123.45);
    });
  });

  describe('PercentageDiscountStrategy', () => {
    it('should apply the correct percentage discount', () => {
      const strategy = new PercentageDiscountStrategy(0.10); // 10% discount
      expect(strategy.applyDiscount(100)).toBe(90);
      expect(strategy.applyDiscount(200)).toBe(180);
      expect(strategy.applyDiscount(50)).toBe(45);
    });

    it('should handle 0% discount', () => {
      const strategy = new PercentageDiscountStrategy(0);
      expect(strategy.applyDiscount(100)).toBe(100);
    });

    it('should handle 100% discount', () => {
      const strategy = new PercentageDiscountStrategy(1);
      expect(strategy.applyDiscount(100)).toBe(0);
    });

    it('should throw an error for invalid percentage (less than 0)', () => {
      expect(() => new PercentageDiscountStrategy(-0.1)).toThrow('Percentage must be between 0 and 1.');
    });

    it('should throw an error for invalid percentage (greater than 1)', () => {
      expect(() => new PercentageDiscountStrategy(1.1)).toThrow('Percentage must be between 0 and 1.');
    });
  });

  describe('FixedAmountDiscountStrategy', () => {
    it('should apply the correct fixed amount discount', () => {
      const strategy = new FixedAmountDiscountStrategy(10); // $10 discount
      expect(strategy.applyDiscount(100)).toBe(90);
      expect(strategy.applyDiscount(50)).toBe(40);
    });

    it('should not result in a negative price', () => {
      const strategy = new FixedAmountDiscountStrategy(10);
      expect(strategy.applyDiscount(5)).toBe(0); // Price should not go below 0
      expect(strategy.applyDiscount(10)).toBe(0);
    });

    it('should handle 0 fixed amount discount', () => {
      const strategy = new FixedAmountDiscountStrategy(0);
      expect(strategy.applyDiscount(100)).toBe(100);
    });

    it('should throw an error for negative fixed amount', () => {
      expect(() => new FixedAmountDiscountStrategy(-5)).toThrow('Fixed amount cannot be negative.');
    });
  });
});
