(function () {
    'use strict';

    var app = angular.module('clockedNemesisFilters', []);

    app.filter('si', function (numberFilter) {
        var siUnits = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        return function (input, decimals) {
            var siUnitIndex = 0;
            if (input > 1) {
                // Pop pop
                var magnitude = Math.floor((Math.log(Math.abs(input)) / Math.LN10) + 0.01);
                magnitude = Math.min(26, magnitude);
                magnitude = Math.floor(magnitude / 3);
                input = input / Math.pow(10, magnitude * 3);
                siUnitIndex = magnitude;
            }
            return numberFilter(input, decimals) + siUnits[siUnitIndex];
        };
    });
})();