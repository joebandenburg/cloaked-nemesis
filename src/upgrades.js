(function() {
    'use strict';

    var app = angular.module('clockedNemesisUpgrades', []);

    function getExpUpgradeFn(exp, multiplyer)
    {
        return function upgradeFn(level)
        {
            return Math.floor(Math.pow(level, exp) * multiplyer);
        };
    }

    var UpgradeTypesData = {
        'PowerRegenRate': {
            'system': 'power',
            'title:': 'regen rate',
            'cost': getExpUpgradeFn(1.1, 3),
            'modifier':
            {
                'regenRate': getExpUpgradeFn(1.05, 3)
            }
        },
        'ShieldsRegenRate': {
            'system': 'shields',
            'title': 'regen rate',
            'cost': getExpUpgradeFn(1.1, 10),
            'modifier':
            {
                'regenRate': getExpUpgradeFn(1.05, 0.1),
                'powerUsage': getExpUpgradeFn(1.05, 15)
            }
        }
    };

    var UpgradeOrder = [
        UpgradeTypesData.PowerRegenRate,
        UpgradeTypesData.ShieldsRegenRate
    ];

    _.each(UpgradeTypesData, function (upgradeTypeData, upgradeName) {
        if (UpgradeOrder.indexOf(upgradeTypeData) === -1)
        {
            throw new Error('UpgradeTypeData ' + upgradeName + ' is not listed in UpgradeOrder');
        }

        upgradeTypeData.name = upgradeName;
    });

    app.factory('UpgradeTypesData', function () {
        return UpgradeTypesData;
    });

    app.factory('UpgradeOrder', function () {
        return UpgradeOrder;
    });
})();
