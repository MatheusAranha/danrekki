import { calculateDtCost } from './index';

describe('calculateDtCost service', () => {
  describe('when no clan modifiers apply', () => {
    it('should return the base cost when character has no releases', () => {
      const result = calculateDtCost(100, [{ release_id: 'rel-1', multiplier: 0.5 }], []);
      expect(result).toBe(100);
    });

    it('should return the base cost when character releases do not match any modifier', () => {
      const result = calculateDtCost(
        200,
        [{ release_id: 'rel-1', multiplier: 0.5 }],
        ['rel-99', 'rel-100'],
      );
      expect(result).toBe(200);
    });

    it('should return the base cost when clan has no modifiers', () => {
      const result = calculateDtCost(150, [], ['rel-1', 'rel-2']);
      expect(result).toBe(150);
    });
  });

  describe('when character has a matching release', () => {
    it('should apply the matching modifier multiplier', () => {
      const result = calculateDtCost(
        100,
        [{ release_id: 'rel-1', multiplier: 0.5 }],
        ['rel-1'],
      );
      expect(result).toBe(50);
    });

    it('should ceil the result when multiplication produces a fraction', () => {
      const result = calculateDtCost(
        100,
        [{ release_id: 'rel-1', multiplier: 0.3 }],
        ['rel-1'],
      );
      expect(result).toBe(30);
    });
  });

  describe('when multiple modifiers apply', () => {
    it('should use the lowest multiplier when multiple releases match', () => {
      const result = calculateDtCost(
        100,
        [
          { release_id: 'rel-1', multiplier: 0.8 },
          { release_id: 'rel-2', multiplier: 0.5 },
          { release_id: 'rel-3', multiplier: 0.7 },
        ],
        ['rel-1', 'rel-2'],
      );
      expect(result).toBe(50);
    });

    it('should only consider modifiers whose release_id matches a character release', () => {
      const result = calculateDtCost(
        100,
        [
          { release_id: 'rel-1', multiplier: 0.2 },
          { release_id: 'rel-2', multiplier: 0.9 },
        ],
        ['rel-2'],
      );
      expect(result).toBe(90);
    });
  });

  describe('fractional DT ceiling', () => {
    it('should ceil the result so no fractional DT is returned', () => {
      const result = calculateDtCost(
        10,
        [{ release_id: 'rel-1', multiplier: 0.33 }],
        ['rel-1'],
      );
      expect(result).toBe(Math.ceil(10 * 0.33));
    });

    it('should return an integer when the product is already whole', () => {
      const result = calculateDtCost(
        200,
        [{ release_id: 'rel-1', multiplier: 0.5 }],
        ['rel-1'],
      );
      expect(result).toBe(100);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
