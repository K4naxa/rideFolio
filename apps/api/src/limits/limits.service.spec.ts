import { LimitsService } from './limits.service';

describe('LimitsService', () => {
  let service: LimitsService;

  beforeEach(() => {
    // LimitsService depends on PrismaService, UnitConversionService, and MaintenancePartTransformer.
    // For pure-logic unit tests we only need the methods that don't touch Prisma.
    service = new LimitsService(null as any, null as any, null as any);
  });

  // ── calculateSizeBytes ──────────────────────────────────────────────

  describe('calculateSizeBytes', () => {
    it('returns overhead buffer for null', () => {
      expect(service.calculateSizeBytes(null)).toBe(250);
    });

    it('returns overhead buffer for undefined', () => {
      expect(service.calculateSizeBytes(undefined)).toBe(250);
    });

    it('calculates byte size of a simple object', () => {
      const data = { name: 'test', value: 42 };
      const expected = Buffer.byteLength(JSON.stringify(data), 'utf8');
      expect(service.calculateSizeBytes(data)).toBe(expected);
    });

    it('calculates byte size of a string', () => {
      const data = 'hello world';
      const expected = Buffer.byteLength(JSON.stringify(data), 'utf8');
      expect(service.calculateSizeBytes(data)).toBe(expected);
    });

    it('handles unicode characters correctly', () => {
      const data = { text: 'öäü emoji 🚗' };
      const expected = Buffer.byteLength(JSON.stringify(data), 'utf8');
      expect(service.calculateSizeBytes(data)).toBe(expected);
    });

    it('handles empty object', () => {
      const expected = Buffer.byteLength('{}', 'utf8');
      expect(service.calculateSizeBytes({})).toBe(expected);
    });

    it('handles nested objects', () => {
      const data = { a: { b: { c: 'deep' } } };
      const expected = Buffer.byteLength(JSON.stringify(data), 'utf8');
      expect(service.calculateSizeBytes(data)).toBe(expected);
    });
  });

  // ── calculateSizeWithChildrenBytes ──────────────────────────────────

  describe('calculateSizeWithChildrenBytes', () => {
    it('returns parent size when no children', () => {
      const parent = { name: 'parent' };
      expect(service.calculateSizeWithChildrenBytes(parent)).toBe(service.calculateSizeBytes(parent));
    });

    it('returns parent size with empty children array', () => {
      const parent = { name: 'parent' };
      expect(service.calculateSizeWithChildrenBytes(parent, [])).toBe(service.calculateSizeBytes(parent));
    });

    it('sums parent and children sizes', () => {
      const parent = { name: 'parent' };
      const child1 = { type: 'part', cost: 10 };
      const child2 = { type: 'labor', cost: 50 };

      const expected =
        service.calculateSizeBytes(parent) + service.calculateSizeBytes(child1) + service.calculateSizeBytes(child2);

      expect(service.calculateSizeWithChildrenBytes(parent, [child1, child2])).toBe(expected);
    });
  });

  // ── isUpdateExceedingSyncThreshold ──────────────────────────────────

  describe('isUpdateExceedingSyncThreshold', () => {
    it('returns false when difference is within threshold', () => {
      expect(service.isUpdateExceedingSyncThreshold(1000, 1100)).toBe(false);
    });

    it('returns true when difference exceeds threshold', () => {
      expect(service.isUpdateExceedingSyncThreshold(1000, 1500)).toBe(true);
    });

    it('returns true when size decreased beyond threshold', () => {
      expect(service.isUpdateExceedingSyncThreshold(1500, 1000)).toBe(true);
    });

    it('returns false when sizes are equal', () => {
      expect(service.isUpdateExceedingSyncThreshold(1000, 1000)).toBe(false);
    });
  });

  // ── shouldSyncStorage ───────────────────────────────────────────────

  describe('shouldSyncStorage', () => {
    it('returns false when difference is below threshold', () => {
      expect(service.shouldSyncStorage(1000, 1100)).toBe(false);
    });

    it('returns true when difference meets threshold (250 bytes)', () => {
      expect(service.shouldSyncStorage(1000, 1250)).toBe(true);
    });

    it('returns true when size decreases beyond threshold', () => {
      expect(service.shouldSyncStorage(1250, 1000)).toBe(true);
    });

    it('returns false when sizes are equal', () => {
      expect(service.shouldSyncStorage(500, 500)).toBe(false);
    });
  });
});
