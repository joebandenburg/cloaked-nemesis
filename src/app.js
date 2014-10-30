// Everything is in seconds. You noob.

/*global angular:false*/
/*global requestAnimationFrame:false*/
/*global performance:false*/

var app = angular.module('clockedNemesis', []);

app.factory('requestAnimationFrameLoop', function ($rootScope) {
    return function (callback) {
        function loopCallback(time) {
            $rootScope.$apply(function () {
                callback(time);
            });
            requestAnimationFrame(loopCallback);
        }
        requestAnimationFrame(loopCallback);
    };
});

app.controller('Main', function ($scope, requestAnimationFrameLoop) {
    $scope.playerShip = {
        shields: {
            max: 100,
            regenRate: 30,
            powerUsage: 1000
        },
        power: {
            max: 10000,
            boost: 1000
        },
        hull: {
            max: 100,
            regenRate: 1
        }
    };

    $scope.enemyShip = {
        shields: {
            max: 100,
            regenRate: 0,
            powerUsage: 1000
        },
        power: {
            max: 10000,
            boost: 0
        },
        hull: {
            max: 100,
            regenRate: 1
        },
        weapons: [{
            fireRate: 0.5,
            lastFired: 0,
            damage: 20,
            hitProbability: 0.5
        }]
    };

    $scope.playerShipState = {
        shields: {
            value: 0
        },
        power: {
            value: 10000
        },
        hull: {
            value: 0
        }
    };

    var lastTime = performance.now() / 1000;

    function updateLoop(time) {
        time /= 1000;
        var timeDelta = time - lastTime;
        lastTime = time;

        // Use power
        $scope.playerShipState.power.value -= $scope.playerShip.shields.powerUsage * timeDelta;
        $scope.playerShipState.power.value = Math.max(0, $scope.playerShipState.power.value);

        if ($scope.playerShipState.power.value > 0) {
            // Regen shields
            if ($scope.playerShipState.shields.value < $scope.playerShip.shields.max) {
                $scope.playerShipState.shields.value += $scope.playerShip.shields.regenRate * timeDelta;
                $scope.playerShipState.shields.value = Math.min($scope.playerShip.shields.max, $scope.playerShipState.shields.value);
            }
        }

        // Enemy fires
        $scope.enemyShip.weapons.forEach(function (weapon) {
            if (weapon.lastFired + weapon.fireRate < time) {
                weapon.lastFired = time;
                var wasHit = Math.random() < weapon.hitProbability;
                if (wasHit) {
                    $scope.playerShipState.shields.value -= weapon.damage;
                    $scope.playerShipState.shields.value = Math.max(0, $scope.playerShipState.shields.value);
                }
            }
        });
    }

    requestAnimationFrameLoop(updateLoop);

    $scope.recharge = function() {
        $scope.playerShipState.power.value += $scope.playerShip.power.boost;
        $scope.playerShipState.power.value = Math.min($scope.playerShip.power.max, $scope.playerShipState.power.value);
    };
});

app.directive('dial', function () {
    function link(scope, element, attrs) {
        var canvas = element.find('canvas')[0];
        var ctx = canvas.getContext('2d');
        var radius = 100;
        var width = 2;
        var progressColour = '#23a9b8';
        var backgroundColour = '#333';
        var imageSize = 320;
        var minValue, maxValue;

        scope.$watch('colour', function (value) {
            progressColour = value;
        });

        scope.$watch('minValue', function (value) {
            minValue = value;
        });

        scope.$watch('maxValue', function (value) {
            maxValue = value;
        });

        scope.$watch('value', function (value) {
            if (minValue !== undefined && maxValue !== undefined) {
                value = (value - minValue) / (maxValue - minValue) * 100;
            }
            scope.percentValue = value;
            var center = imageSize / 2;
            ctx.clearRect(0, 0, imageSize, imageSize);
            ctx.strokeStyle = backgroundColour;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.arc(center, center, radius, -Math.PI / 2, Math.PI * 1.5, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = progressColour;
            ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * value / 100 * 2, false);
            ctx.stroke();
        });
    }
    return {
        restrict: 'E',
        scope: {
            title: '@',
            value: '=',
            minValue: '=min',
            maxValue: '=max',
            colour: '@'
        },
        link: link,
        template: '<div class="dial"><canvas width="320" height="320"></canvas><span class="value">{{percentValue | number:0}}%</span><span class="title">{{title}}</span></div>'
    };
});
