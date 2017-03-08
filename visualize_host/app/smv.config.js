(function(){
    'use strict';

    angular.module('smv')
        .config(influxdbConfig);

    influxdbConfig.$inject = ["InfluxdbDispatcherProvider"];

    function influxdbConfig(InfluxdbDispatcherProvider){
        InfluxdbDispatcherProvider.interval = 3000;
    }
})();
