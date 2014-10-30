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
            value: 100,
            regenRate: 30,
            powerUsage: 1000
        },
        power: {
            max: 10000,
            value: 10000,
            boost: 1000
        },
        hull: {
            max: 100,
            value: 100,
            regenRate: 1,
            boost: 1
        }
    };

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
            boost: 0
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

    var lastTime = performance.now() / 1000;

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

        // Use power
        systemDelta($scope.playerShip.power, -$scope.playerShip.shields.powerUsage * timeDelta);

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

    $scope.rechargePower = function() {
        systemDelta($scope.playerShip.power, $scope.playerShip.power.boost);
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
