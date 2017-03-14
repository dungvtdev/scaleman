(function () {
    'use strict';

    angular.module('smv.monitoring.controller')
        .controller('MonitoringController', MonitoringController);

    MonitoringController.$inject = ['CONFIG', 'InfluxdbBatch', '$timeout', '$http'];

    function MonitoringController(CONFIG, influxdbBatch, $timeout, $http) {
        var dd = SMVDataUtils;

        var vm = this;
        var influxdb = influxdbBatch.createInfluxDataSource();
        var interval = CONFIG.value("visualize_interval") || 1000;

        vm.data = {
            "name": {
                measurement: "",
                machine_id: 0,
                container_names: [],
                parseFn: undefined,     // parse data khi co data moi
                data: {}                // inject vao de get
            },
        };
        vm.getData = getData;

        // process

        init();

        function init(container_names) {
            // build data
            var raw_data = [
                CPU_USAGE_TOTAL,
                TX_RX_BYTES,
            ]

            vm.data = {};

            for (var i = 0; i < raw_data.length; i++) {
                buildData(vm.data, new raw_data[i]());
            }

            // to listen to influxdb get data event
            // id tra ve de dung sau, vi du unregister
            vm.influx_listener_id = registerDataInfo();

            tick();

            // $timeout(function () {
            //     tick();
            // }, interval);

            // $http.get(
            //     encodeURI("http://testing:8086/query?db=cadvisor&epoch=s&q=SELECT value FROM cpu_usage_total WHERE time > now() - 1m GROUP BY container_name"))
            //     .then(function(data){
            //         console.log(data);
            //     })
            //     .catch(function(e){
            //         console.log(e);
            //     })
        }

        function tick() {
            influxdb.tick();
            // $timeout(tick, interval);
        }

        function buildData(dataObject, addedData) {
            dataObject[addedData.name] = {
                measurement: addedData.define.measurement,
                machine_id: addedData.define.machine_id,
                container_names: addedData.define.container_names,
                parseFn: addedData.parseData,
                data: [],
            }
        }

        // call from visualize chart
        // names: array [] of names
        function getData(name) {
            if (vm.data && vm.data[name]) {
                return vm.data[name].data;
            }
            return undefined;
        }

        // callback function when new data comming
        function onData(dataSeries) {
            dd.keys(dataSeries).forEach(function (name) {
                vm.data[name].data = vm.data[name].parseFn(dataSeries[name]);
            });
            console.log(vm.data);
        }

        function registerDataInfo() {
            var id = influxdb.batch.register({
                data: vm.data,
                onData: onData,
            })

            return id;
        }
    };

    function multiContainerParse(data) {
        var rs = {};
        for (var i = 0; i < data.length; i++) {
            rs[data[i].container_name] = data[i].data;
        }
        return rs;
    }

    function multiMeasurementParse(data) {
        var rs = {};
        for (var i = 0; i < data.length; i++) {
            if (data[i].container_name === this.define.container_names) {
                rs[data[i].measurement] = data[i].data;
            }
        }
        return rs;
    }

    function CPU_USAGE_TOTAL() {
        this.name = "cpu_total";
        this.define = {
            machine_id: 0,
            measurement: "cpu_usage_total",
            container_names: [],
        }
        this.parseData = multiContainerParse.bind(this);
    }

    function TX_RX_BYTES() {
        this.name = "tx_rx_bytes";
        this.define = {
            machine_id: 0,
            measurement: ["rx_bytes", "tx_bytes"],
            container_names: "/",
        }
        this.parseData = multiMeasurementParse.bind(this);
    }

    function CPU_SYSTEM_USER() {
        this.name = "cpu_system_user";
        this.define = {
            machine_id: 0,
            measurement: ["cpu_usage_system", "cpu_usage_user"],
            container_names: "/",
        }
        this.parseData = multiMeasurementParse.bind(this);
    }




})();
