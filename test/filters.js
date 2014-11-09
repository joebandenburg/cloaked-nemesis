describe('filters', function () {
    'use strict';

    beforeEach(module('clockedNemesisFilters'));
    describe('si', function () {
        it('is great', inject(function (siFilter) {
            expect(siFilter(1)).toBe('1');
        }));
    });
});