(function(){
    'use strict';

    angular.module('smv.components.chart.data')
        .directive('influxdbData', InfluxdbData);

    function InfluxdbData(){
        return{
            restrict: 'EA',
            scope:{
                series: "=",
            },
            require: '^^rickshawChart',
            controller: controllerFn,
            controllerAs: 'vm',
            bindToController: true,
            link: linkFn,
        }

        function controllerFn(scope){
            var vm = this;

            scope.$watch('chart', function(newValue, oldValue){
                init(newValue);
            });

            function init(chartCtrl){
                vm.chart = chartCtrl;
                console.log(vm.chart.name);
            }
        }

        function linkFn(scope, elem, attrs, chartCtrl){
            scope.chart = chartCtrl;
        }
    }
})();
