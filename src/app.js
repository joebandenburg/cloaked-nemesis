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

    app.controller('Main', function ($scope, requestAnimationFrameLoop, UpgradeTypesData, UpgradeOrder) {
        $scope.gameState = {
            money: 0,
            moneyRate: 10
        };

        $scope.playerShipBaseStats = {
            shields: {
                max: 100,
                regenRate: 5,
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
            },
            weapons: [{
                fireRate: 4,
                lastFired: 0,
                damage: 30,
                hitProbability: 0.5,
                value: 0
            }]
        };

        $scope.playerShip = {
            upgrades: { }
        };

        _.each(UpgradeTypesData, function (value, key) {
            $scope.playerShip.upgrades[key] = 0;
        });

        _.each($scope.playerShipBaseStats, function (baseSystemStats, systemName) {
            if (_.isArray($scope.playerShipBaseStats[systemName]))
            {
                $scope.playerShip[systemName] = [];
                _.each($scope.playerShipBaseStats[systemName], function (systemItem, index) {
                    $scope.playerShip[systemName][index] = {
                        value: systemItem.max || 0
                    };
                });
            }
            else
            {
                $scope.playerShip[systemName] = {
                    value: baseSystemStats.max || 0
                };
            }
        });

        function calculateShipStats() {
            _.each($scope.playerShipBaseStats, function (baseSystemStats, systemName) {
                _.each(baseSystemStats, function (statValue, statName) {
                    $scope.playerShip[systemName][statName] = _.cloneDeep(statValue);
                });
            });

            _.each(UpgradeOrder, function (upgrade) {
                var upgradeLevel = $scope.playerShip.upgrades[upgrade.name];
                _.each(upgrade.modifier, function (modifierFn, modifierName) {
                    _.times(upgradeLevel, function() {
                        $scope.playerShip[upgrade.system][modifierName] += modifierFn(upgradeLevel);
                    });
                });
            });
        }

        calculateShipStats();

        function buyUpgrade(upgradeName) {
            var upgrade = UpgradeTypesData[upgradeName];
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
                max: 0,
                value: 0,
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
                fireRate: 3,
                lastFired: 0,
                damage: 20,
                hitProbability: 0.8,
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

            // Player fires
            $scope.playerShip.weapons.forEach(function (weapon) {
                if (weapon.lastFired + weapon.fireRate < time) {
                    weapon.lastFired = time;
                    var wasHit = Math.random() < weapon.hitProbability;
                    if (wasHit) {
                        var damage = weapon.damage;
                        damage = systemHit($scope.enemyShip.shields, damage);
                        damage = systemHit($scope.enemyShip.hull, damage);
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
                buyUpgrade('PowerRegenRate');
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
        
        $scope.weaponCharge = function(weapon) {
            return ((lastTime - weapon.lastFired) / weapon.fireRate) * 100;
        };
    });
})();
