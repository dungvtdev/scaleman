(function () {
    angular.module('smv.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ["CONFIG", 'DatasourceBatch', 'Influxdb', '$http', 'DataManipulation', 'HttpException', '$log'];

    function InfluxdbBatch(CONFIG, DatasourceBatch, influxService, $http, dd, HttpException, $log) {
        return function () {
            return new InfluxDataSource();
        }

        function InfluxDataSource() {
            this.tick = tick;
            this.interval = CONFIG.visualize_interval || 1000;
            this.registrator = DatasourceBatch(this);
            this.queryContainerNames = queryContainerNames;

            var registrator = this.registrator;

            var setting = "&epoch=s";

            // endpoint + database
            var machines = {
                0: ["http:\/\/testing:8086", "cadvisor"],
            };
            // add data tu datasourcebatch
            machines.addListener = function (measurementAndMachines) {
                if (!measurementAndMachines) return;
                if (!Array.isArray(measurementAndMachines)) {
                    measurementAndMachines = [measurementAndMachines,];
                }
                if (!this.meta) this.meta = {};
                var meta = this.meta;
                var machine = this;
                measurementAndMachines.forEach(function (mam) {
                    if (!machine[mam.machine]) return;
                    if (!meta[mam.machine]) meta[mam.machine] = [];
                    if (meta[mam.machine].indexOf(mam.measurement) < 0)
                        meta[mam.machine].push(mam.measurement);
                })
            }
            machines.rebuild = function () {
                var mc = this;
                mc.meta = {};

                var allMeta = registrator.getAllMeta();
                allMeta.forEach(function (meta) {
                    mc.addListener(meta);
                })
            }

            function tick() {
                if (registrator.dirty) {
                    registrator.dirty = false;

                    machines.rebuild();

                    console.log(machines);

                    queryData();
                }
            }

            function queryData() {
                if (!machines.meta) return;

                dd.keys(machines.meta).forEach(function (machine_id) {
                    var measurements = machines.meta[machine_id];

                    measurements.forEach(function (measure) {
                        var url = getUrl(machine_id,
                            "SELECT value FROM " + measure
                            + " WHERE time > now() - 1m"
                            + " GROUP BY container_name");
                        console.log(url);

                        url = encodeURI(url);

                        $http.get(url)
                            .then(queryComplete)
                            .catch(queryFailed);

                        function queryComplete(data, status, headers, config) {
                            console.log(data);
                        }
                    })

                });
            }

            function queryContainerNames(machine, measurements) {
                if(!Array.isArray(measurements)) 
                    measurements = [measurements,];

                var url = getUrl(machine,
                    "SELECT value FROM "
                        + measurements.join(",") 
                        + " GROUP BY container_name LIMIT 1");

                url = encodeURI(url);

                var getC = $http.get(url)
                    .then(queryComplete)
                    .catch(queryFailed);

                function queryComplete(data, status, headers, config) {
                    if(data['data'] && data.data['results'] && data.data['results'].length > 0){
                        var rs = {};
                        data.data.results[0].series.forEach(function(d){
                            if(!rs[d.name]) rs[d.name]=[];
                            rs[d.name].push(d.tags.container_name);
                        });
                        return rs;
                    }else{
                        $log.info("Wrong data at InfluxdbBatch.queryContainerNames("+machine+","+measurements+")");
                    }
                }

                return getC;
            }

            // function queryContainerNamesMultipleMachine(query_data){
            //     dd.keys(query_data).forEach(function(machine_id){
            //         if(!machines[machine_id]) return;

            //         var count=0;
            //         var rs = {};
            //         queryContainerNames(machine_id, query_data[machine_id])
            //             .then(function(data){
            //                 count++;
            //                 rs[machine_id]=data;
            //                 if(count==0)
            //             })
            //             .catch(function(){

            //             })
            //     }
            // }

            function getUrl(machine, query) {
                var endpoint = machines[machine][0];
                var db = machines[machine][1];

                return endpoint + "/query?db=" + db + setting + "&q=" + query;
            }

            function queryFailed(e) {
                return HttpException.handle(e, "query", "Influxdb");
            }

        }

    }
})();
