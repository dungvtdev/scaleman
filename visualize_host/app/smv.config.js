(function () {
    'use strict';

    angular.module('smv').constant("CONFIG", getConfig());

    var configData = {
        visualize_interval: 3000,
    };

    function getConfig() {
        return {
            value: function(key){
                return configData[key];
            },
        }
    }
})();
