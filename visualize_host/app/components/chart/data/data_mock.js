(function(){
    'use strict';

    angular.module('smv.components.chart.data')
        .factory('dataMock', DataMock);

    function DataMock(){
        var service = {
            getNewData: getNewData,
        };
        return service;

        function getNewData(){
            return {
                x: Date.now(),
                y: Math.random()
            }
        }
    }
})();
