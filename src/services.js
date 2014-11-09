(function () {
    'use strict';

    var app = angular.module('clockedNemesisServices', []);

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
})();