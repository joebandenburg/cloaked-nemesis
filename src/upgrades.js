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
                'regenRate': getExpUpgradeFn(1.05, 10)
            }
        }
    };

    var UpgradeOrder = [
        UpgradeTypesData.PowerRegenRate
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
