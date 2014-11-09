describe('filters', function () {
    'use strict';

    beforeEach(module('clockedNemesisFilters'));
    describe('si', function () {
        it('formats no suffix correctly', inject(function (siFilter) {
            expect(siFilter(1e0)).toBe('1');
            expect(siFilter(5e0)).toBe('5');
            expect(siFilter(9e0)).toBe('9');
            expect(siFilter(1e1)).toBe('10');
            expect(siFilter(5e1)).toBe('50');
            expect(siFilter(9e1)).toBe('90');
            expect(siFilter(1e2)).toBe('100');
            expect(siFilter(5e2)).toBe('500');
            expect(siFilter(9e2)).toBe('900');
        }));
        it('formats kilo suffix correctly', inject(function (siFilter) {
            expect(siFilter(1e3)).toBe('1k');
            expect(siFilter(5e3)).toBe('5k');
            expect(siFilter(9e3)).toBe('9k');
            expect(siFilter(1e4)).toBe('10k');
            expect(siFilter(5e4)).toBe('50k');
            expect(siFilter(9e4)).toBe('90k');
            expect(siFilter(1e5)).toBe('100k');
            expect(siFilter(5e5)).toBe('500k');
            expect(siFilter(9e5)).toBe('900k');
        }));
        it('formats no suffic correctly for numbers between 0 and 1', inject(function (siFilter) {
            expect(siFilter(1e-1)).toBe('0.1');
            expect(siFilter(5e-1)).toBe('0.5');
            expect(siFilter(9e-1)).toBe('0.9');
            expect(siFilter(1e-2)).toBe('0.01');
            expect(siFilter(5e-2)).toBe('0.05');
            expect(siFilter(9e-2)).toBe('0.09');
            expect(siFilter(1e-3)).toBe('0.001');
            expect(siFilter(5e-3)).toBe('0.005');
            expect(siFilter(9e-3)).toBe('0.009');
        }));
        it('defaults to numberFilters decimal formatting method', inject(function (siFilter) {
            expect(siFilter(1e-4)).toBe('0.000');
            expect(siFilter(5e-4)).toBe('0.001');
            expect(siFilter(9e-4)).toBe('0.001');
        }));
    });
});