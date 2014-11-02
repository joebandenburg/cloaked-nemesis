(function() {
    'use strict';

    var app = angular.module('clockedNemesisDirectives', []);

    app.directive('dial', function () {
        function link(scope, element) {
            var canvas = element.find('canvas')[0];
            var ctx = canvas.getContext('2d');
            var radius = 58;
            var width = 2;
            var progressColour = '#23a9b8';
            var backgroundColour = '#333';
            var tailColour = '#33b5e5';
            var imageSize = 120;
            var minValue, maxValue;

            scope.$watch('colour', function (value) {
                progressColour = value;
            });

            scope.$watch('tailcolour', function (value) {
                tailColour = value;
            });

            scope.$watch('minValue', function (value) {
                minValue = value;
            });

            scope.$watch('maxValue', function (value) {
                maxValue = value;
            });

            scope.$watchGroup(['value', 'tailvalue'], function (newValues) {
                var value = newValues[0];
                var tailValue = newValues[1];

                if (minValue !== undefined && maxValue !== undefined) {
                    value = (value - minValue) / (maxValue - minValue) * 100;
                    tailValue = (tailValue - minValue) / (maxValue - minValue) * 100;
                }
                scope.percentValue = value;
                var valueAngle = -Math.PI / 2 + Math.PI * value / 100 * 2;
                var center = imageSize / 2;
                ctx.clearRect(0, 0, imageSize, imageSize);
                ctx.strokeStyle = backgroundColour;
                ctx.lineWidth = width;
                ctx.beginPath();
                ctx.arc(center, center, radius, -Math.PI / 2, Math.PI * 1.5, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = progressColour;
                ctx.arc(center, center, radius, -Math.PI / 2, valueAngle, false);
                ctx.stroke();
                if (tailValue)
                {
                    var tailValueAngle = -Math.PI / 2 + Math.PI * tailValue / 100 * 2;
                    ctx.beginPath();
                    ctx.strokeStyle = tailColour;
                    ctx.arc(center, center, radius, valueAngle, tailValueAngle, false);
                    ctx.stroke();
                }
            });
        }
        return {
            restrict: 'E',
            scope: {
                title: '@',
                value: '=',
                tailvalue: '=',
                tailcolour: '@',
                minValue: '=min',
                maxValue: '=max',
                colour: '@'
            },
            link: link,
            template: '<canvas width="120" height="120"></canvas><span class="value">{{percentValue | number:0}}%</span><span class="title">{{title}}</span>'
        };
    });
})();
