(function () {
    'use strict';

    angular.module('smv.monitoring.controller')
        .controller('MonitoringController', MonitoringController);

    MonitoringController.$inject = ['CONFIG', 'DataManipulation', 'InfluxdbBatch', '$timeout'];

    function MonitoringController(CONFIG, dd, influxdbBatch, $timeout) {
        var vm = this;
        var influxdb = influxdbBatch();
        var interval = CONFIG.value("visualize_interval") || 1000;

        // machine_id, measurement
        var visualize_query_datas = {
            "0": ['cpu_usage_total', 'cpu_usage_system'],
        };

        // all measurement in machine 0
        influxdb.queryContainerNames(0, visualize_query_datas['0'])
            .then(function (cns) {
                init(cns);
            })

        vm.data = {};

        // dinh nghia cac series can hien thi
        // vm.data =
        //     {
        //         cpu: {
        //             measurement: 'cpu_usage_total',
        //             machine: 0,
        //             tags: {
        //                 container_name: "/",
        //             },
        //             data: [],
        //         }
        //     };

        vm.getData = getData;

        function init(container_names) {
            container_names['cpu_usage_total'].forEach(function (cn) {
                var name = cn;
                vm.data[name] = {
                    measurement: 'cpu_usage_total',
                    machine: 0,
                    container_name: cn,
                    data: [],
                }
            })

            // to listen to influxdb get data event
            // id tra ve de dung sau, vi du unregister
            vm.influx_listener_id = registerDataInfo();

            $timeout(function () {
                tick();
            }, interval);
        }

        function tick() {
            influxdb.tick();
            $timeout(tick, interval);
        }

        // call from visualize chart
        // names: array [] of names
        function getData(names) {
            if (vm.data) {
                return names.map(function (name) {
                    return vm.data[name].data;
                })
            }
            return undefined;
        }

        // callback function when new data comming
        function onData(dataSeries) {
            console.log(dataSeries);
        }

        function registerDataInfo() {
            var id = influxdb.registrator.register({
                data: vm.data,
                onData: onData,
            })

            return id;
        }

    };


})();
