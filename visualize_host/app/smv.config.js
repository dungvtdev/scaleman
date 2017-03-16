(function () {
    'use strict';

    angular.module('smv').constant("CONFIG", getConfig());

    var configData = {
        visualize_interval: 2000,
        timeFilter: 100,
    };

    function getConfig() {
        return {
            value: function(key){
                return configData[key];
            },
        }
    }
})();
