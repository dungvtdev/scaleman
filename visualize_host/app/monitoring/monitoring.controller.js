(function () {
    'use strict';

    angular.module('smv.monitoring.controller')
        .controller('MonitoringController', MonitoringController);

    MonitoringController.$inject = ['DataManipulation', 'InfluxdbBatch'];

    function MonitoringController(dd, influxdbBatch) {
        var vm = this;
        var influxdb = influxdbBatch();

        // machine_id, measurement
        var visualize_query_datas = {
            0 : ['cpu_usage_total',]
        };

        // all measurement in machine 0
        var constainer_names = influxdb.queryContainerNames(0, visualize_query_datas['0']);

        // build data series
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

        // to listen to influxdb get data event
        // id tra ve de dung sau, vi du unregister
        vm.influx_listener_id = registerDataInfo();

        influxdb.tick();

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
            dd.keys(dataSeries).forEach(function(name){
                if(vm.data[name]){
                    vm.data[name].data = dataSeries[name];
                }
            })
        }

        function registerDataInfo() {
            var data_meta = {};
            dd.keys(vm.data).forEach(function(key){
                data_meta[key]=dd.clone(vm.data[key], "data");
            });

            var id = influxdb.registrator.register({
                data: data_meta,
                onData: onData,
            })

            return id;
        }

    };


})();
