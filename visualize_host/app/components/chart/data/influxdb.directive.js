(function () {
    'use strict';

    angular.module('smv.components.chart.data')
        .directive('influxdbData', InfluxdbData);

    InfluxdbData.$inject = ["InfluxdbDispatcher"];

    function InfluxdbData(dataDispatcher) {
        return {
            restrict: 'EA',
            scope: {
                type: "@",
                data: "=",
            },
            controller: controllerFn,
            controllerAs: 'vm',
        }

        function controllerFn(scope) {
            var vm = this;

            if (scope.type === "remoteType") {
                configTypeRemote(scope, vm);
            }

            function configTypeRemote(scope, ctrl) {
                $scope.$watchCollection(scope.data, function (newVal, oldVal) {
                    if (scope.data) init();
                });

                function init() {
                    var registerObj = {
                        onData: onData,
                        measurements: getSetByKey(scope.data, "measurement"),
                        tags: getSetByKey(scope.data, "tag"),
                    }
                    ctrl.influxdb_dispatcher_id = dataDispatcher.register(registerObj);
                }

                function onData(data){
                    scope.chartDataUpdate = data;
                }

            }

            function getSetByKey(list, key){
                var sett = [];
                if(list){
                    list.forEach(function(el){
                        if(sett.indexOf(el[key])<0)
                            sett.push(el[key]);
                    })
                }
                return sett;
            }
        }
    }
})();
