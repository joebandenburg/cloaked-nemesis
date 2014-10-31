var app = angular.module('clockedNemesisDirectives', []);

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
