// Everything is in seconds. You noob.



var app = angular.module('clockedNemesis', []);

app.controller('Main', function($scope, $interval) {
    $scope.playerShip = {
        hp: 1000,
        shields: {
            maxValue: 100,
            currentValue: 0,
            regenRate: 30
        },
        power: 100000
    };

    $scope.enemyShip = {
        hp: 1000,
        shields: 100,
        power: 100000,
        weapons: [{
            fireRate: 5,
            lastFired: 0,
            damage: 50,
            hitProbability: 0.8
        }]
    };

    function updateLoop(time) {
        var timeDelta = 0.016;
        var time = performance.now() / 1000;

        // Regen shields
        if ($scope.playerShip.shields.currentValue < $scope.playerShip.shields.maxValue) {
            $scope.playerShip.shields.currentValue += $scope.playerShip.shields.regenRate * timeDelta;
            $scope.playerShip.shields.currentValue = Math.min($scope.playerShip.shields.maxValue, $scope.playerShip.shields.currentValue);
        }
        
        // Enemy fires
        $scope.enemyShip.weapons.forEach(function(weapon) {
            if (weapon.lastFired + weapon.fireRate < time) {
                weapon.lastFired = time;
                var wasHit = Math.random() < weapon.hitProbability;
                if (wasHit) {
                    $scope.playerShip.shields.currentValue -= weapon.damage;
                    $scope.playerShip.shields.currentValue = Math.max(0, $scope.playerShip.shields.currentValue);
                }
            }
        });
    }

    $interval(updateLoop, 16);
});