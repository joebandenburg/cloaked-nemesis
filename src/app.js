// Everything is in seconds. You noob.

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
            fireRate: 0.5,
            lastFired: 0,
            damage: 20,
            hitProbability: 0.5
        }]
    };

    var lastTime = performance.now() / 1000;

    function updateLoop(time) {
        time /= 1000;
        var timeDelta = time - lastTime;
        lastTime = time;

        // Regen shields
        if ($scope.playerShip.shields.currentValue < $scope.playerShip.shields.maxValue) {
            $scope.playerShip.shields.currentValue += $scope.playerShip.shields.regenRate * timeDelta;
            $scope.playerShip.shields.currentValue = Math.min($scope.playerShip.shields.maxValue, $scope.playerShip.shields.currentValue);
        }

        // Enemy fires
        $scope.enemyShip.weapons.forEach(function (weapon) {
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

    requestAnimationFrameLoop(updateLoop);
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

        scope.$watch('colour', function (value) {
            progressColour = value;
        });

        scope.$watch('value', function (value) {
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
            colour: '@'
        },
        link: link,
        template: '<div class="dial"><canvas width="320" height="320"></canvas><span class="value">{{value | number:0}}%</span><span class="title">{{title}}</span></div>'
    };
});