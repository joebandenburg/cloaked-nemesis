(function () {
    'use strict';

    var app = angular.module('clockedNemesisDirectives', []);

    app.directive('dial', function (numberFilter) {
        function link(scope, element) {
            var canvas = element.find('canvas')[0];
            var ctx = canvas.getContext('2d');
            var radius = 58;
            var width = 2;
            var progressColour = '#23a9b8';
            var backgroundColour = '#333';
            var imageSize = 120;
            var minValue;
            var maxValue;
            var usingLabel = false;

            scope.$watch('colour', function (value) {
                progressColour = value;
            });
            
            scope.$watch('label', function (label) {
                if (label !== undefined) {
                    usingLabel = true;
                    scope.innerLabel = label;
                }
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
                if (!usingLabel) {
                    scope.innerLabel = numberFilter(value, 0) + '%';
                }
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
                colour: '@',
                label: '@'
            },
            link: link,
            template: '<canvas width="120" height="120"></canvas><span class="value">{{innerLabel}}</span><span class="title">{{title}}</span>'
        };
    });
})();