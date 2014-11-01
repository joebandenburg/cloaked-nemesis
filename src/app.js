// Everything is in seconds. You noob.

(function() {
    'use strict';

    var app = angular.module('clockedNemesisApp', ['clockedNemesisDirectives', 'clockedNemesisServices', 'clockedNemesisUpgrades']);

    app.filter('si', function(numberFilter) {
        var siUnits = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        return function(input) {
            var siUnitIndex = 0;
            if (input !== 0) {
                // Pop pop
                var magnitude = Math.round(Math.log(Math.abs(input)) / Math.LN10);
                magnitude = Math.min(26, magnitude);
                magnitude = Math.floor(magnitude / 3);
                input = input / Math.pow(10, magnitude * 3);
                siUnitIndex = magnitude;
            }
            return numberFilter(input) + siUnits[siUnitIndex];
        };
    });

    app.controller('Main', function ($scope, requestAnimationFrameLoop, upgrades) {
        $scope.gameState = {
            money: 0,
            moneyRate: 10
        };

        $scope.playerShipBaseStats = {
            shields: {
                max: 100,
                regenRate: 30,
                powerUsage: 1000
            },
            power: {
                max: 10000,
                boost: 1000,
                regenRate: 0
            },
            hull: {
                max: 100,
                regenRate: 1,
                boost: 1
            }
        };

        function calculateShipStats()
        {
            _.each($scope.playerShipBaseStats, function (baseSystemStats, systemName) {
                _.each($scope.baseSystemStats, function (statValue, statName) {
                    $scope.playerShip[systemName][statName] = _.cloneDeep(statValue);
                });
            });

            _.each($scope.playerShip.upgrades, function (level, upgradeName) {
                var upgrade = upgrades[upgradeName];
                _.each(upgrade.modifier, function (modifierFn, modifierName)
                {
                    for (var i = 1; i <= level; i += 1)
                    {
                        $scope.playerShip[upgrade.system][modifierName] += modifierFn(level);
                    }
                });
            });
        }

        $scope.playerShip = {
            upgrades: { }
        };

        _.each(upgrades, function (value, key) {
            $scope.playerShip.upgrades[key] = 0;
        });

        _.each($scope.playerShipBaseStats, function (value, key) {
            $scope.playerShip[key] = _.clone(value);
            if (value.max)
            {
                $scope.playerShip[key].value = value.max;
            }
            else
            {
                $scope.playerShip[key].value = 0;
            }
        });

        calculateShipStats();

        function buyUpgrade(upgradeName)
        {
            var upgrade = upgrades[upgradeName];
            var nextUpgradeLevel = $scope.playerShip.upgrades[upgradeName] + 1;
            var nextUpgradeCost = upgrade.cost(nextUpgradeLevel);
            if ($scope.gameState.money >= nextUpgradeCost)
            {
                $scope.gameState.money -= nextUpgradeCost;
                $scope.playerShip.upgrades[upgradeName] = nextUpgradeLevel;
                calculateShipStats();
            }
        }

        $scope.enemyShip = {
            shields: {
                max: 100,
                value: 100,
                regenRate: 0,
                powerUsage: 1000
            },
            power: {
                max: 10000,
                value: 10000,
                boost: 0,
                regenRate: 0
            },
            hull: {
                max: 100,
                value: 100,
                regenRate: 1,
                boost: 1
            },
            weapons: [{
                fireRate: 0.5,
                lastFired: 0,
                damage: 20,
                hitProbability: 0.5,
                value: 0
            }]
        };

        var lastTime = window.performance.now() / 1000;

        function systemHit(system, damage)
        {
            if (system.value >= damage)
            {
                system.value -= damage;
                damage = 0;
            }
            else
            {
                damage -= system.value;
                system.value = 0;
            }
            return damage;
        }

        function systemDelta(system, delta)
        {
            system.value = Math.min(system.max, Math.max(0, system.value + delta));
        }

        function updateLoop(time) {
            time /= 1000;
            var timeDelta = time - lastTime;
            lastTime = time;

            // Get money
            $scope.gameState.money += $scope.gameState.moneyRate * timeDelta;

            // Use power
            systemDelta($scope.playerShip.power,
                        ($scope.playerShip.power.regenRate - $scope.playerShip.shields.powerUsage)* timeDelta);

            if ($scope.playerShip.power.value > 0) {
                // Regen shields
                if ($scope.playerShip.shields.value < $scope.playerShip.shields.max) {
                    systemDelta($scope.playerShip.shields, $scope.playerShip.shields.regenRate * timeDelta);
                }
            }

            systemDelta($scope.playerShip.hull, $scope.playerShip.hull.regenRate * timeDelta);

            // Enemy fires
            $scope.enemyShip.weapons.forEach(function (weapon) {
                if (weapon.lastFired + weapon.fireRate < time) {
                    weapon.lastFired = time;
                    var wasHit = Math.random() < weapon.hitProbability;
                    if (wasHit) {
                        var damage = weapon.damage;
                        damage = systemHit($scope.playerShip.shields, damage);
                        damage = systemHit($scope.playerShip.hull, damage);
                    }
                }
            });
        }

        requestAnimationFrameLoop(updateLoop);

        $scope.rechargeHull = function() {
            systemDelta($scope.playerShip.hull, $scope.playerShip.hull.boost);
        };

        $scope.rechargePower = function($event) {
            if ($event.button === 0)
            {
                systemDelta($scope.playerShip.power, $scope.playerShip.power.boost);
            }
            else
            {
                buyUpgrade('powerRegenRate');
            }
        };

        $scope.powerProduction = function() {
            // TODO: Calculate this properly
            return $scope.playerShip.power.regenRate;
        };

        $scope.powerConsumption = function() {
            // TODO: Calculate this properly
            return $scope.playerShip.shields.powerUsage;
        };

        $scope.powerOutput = function() {
            return $scope.powerProduction() - $scope.powerConsumption();
        };
    });
})();
