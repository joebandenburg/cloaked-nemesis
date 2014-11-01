(function() {
    'use strict';

    var app = angular.module('clockedNemesisUpgrades', []);

    app.factory('upgrades', function () {

        function getExpUpgradeFn(exp, multiplyer)
        {
            return function upgradeFn(level)
            {
                return Math.floor(Math.pow(level, exp) * multiplyer);
            };
        }

        return {
            'powerRegenRate': {
                'system': 'power',
                'name:': 'Regen rate',
                'cost': getExpUpgradeFn(1.1, 3),
                'modifier':
                {
                    'regenRate': getExpUpgradeFn(1.05, 10)
                }
            }
        };
    });
})();
