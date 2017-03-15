(function(){
    angular.module('smv.influxdb')
        .factory('InfluxdbAntiJitterFactory', InfluxdbAntiJitter);

    InfluxdbAntiJitter.$inject = ['AntiSeriesJitterFactory']

    function InfluxdbAntiJitter(BaseFactory){
        return function(){
            return BaseFactory.createAntiJitter(getInfluxdbExtend());
        }
    }

    function getInfluxdbExtend(){
        return InfluxAntiJitterManager;
    }

    var InfluxAntiJitterManager = {

    }

})();
