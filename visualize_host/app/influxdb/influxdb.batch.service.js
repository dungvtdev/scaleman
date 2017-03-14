(function () {
    angular.module('smv.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ['DatasourceBatch', 'DataManipulation', 'HttpException', '$http', '$log'];

    function InfluxdbBatch(batch, dd, HttpException, $http, $log) {
        return {
            createNewInfluxDataSource: createNewInfluxDataSource,
        }

        function createNewInfluxDataSource() {
            return new InfluxDataSource(batch, dd, HttpException, $http, $log);
        }
    }

    function InfluxDataSource(batch, dd, HttpException, $http, $log) {
        var DS = this;

        DS.tick = tick;
        DS.batch = DatasourceBatch(this);
        DS.queryContainerNames = queryContainerNames;

        var setting = "&epoch=s";

        // endpoint + database
        var machines = {
            "0": ["http:\/\/testing:8086", "cadvisor"],
        };

        // add data tu datasourcebatch
        machines.addListener = function (batch_id, named_series_definition) {
            if (!meta_data) return;

            if (!this.meta) this.meta = {};
            var meta = this.meta;
            var machine = this;
            var __meta_data = meta_data.data;
            dd.keys(__meta_data).forEach(function (name) {
                var data = __meta_data[name];
                if (!machine[data.machine]) return;
                if (!meta[data.machine]) meta[data.machine] = {};
                if (!meta[data.machine][data.measurement])
                    meta[data.machine][data.measurement] = {};
                if (!meta[data.machine][data.measurement][data.container_name])
                    meta[data.machine][data.measurement][data.container_name] = []
                meta[data.machine][data.measurement][data.container_name].push([batch_id, name]);
            });
        }
        machines.rebuild = function () {
            var mc = this;
            mc.meta = {};

            var allMeta = registrator.getAllMeta();
            dd.keys(allMeta).forEach(function (batch_id) {
                mc.addListener(batch_id, allMeta[batch_id]);
            })

            console.log(mc.meta);
        }

        function tick() {
            if (registrator.dirty) {
                registrator.dirty = false;

                machines.rebuild();

                console.log(machines);
            }

            queryData(function (machine_id, data_response) {
                var __meta = machines.meta;
                var rs = {};
                var data = data_response.data;

                if (data['results'] && data['results'].length > 0) {
                    var ls = data.results[0].series;
                    var callbackMetas = registrator.getAllMeta();

                    ls.forEach(function (serie) {
                        var endpList = __meta[machine_id][serie.name][serie.tags.container_name];

                        // 0: batch_id, 1: name
                        endpList.forEach(function (ep) {
                            if (!rs[ep[0]]) rs[ep[0]] = {};
                            rs[ep[0]][ep[1]] = serie.values;
                        })
                    })

                    // callback data
                    dd.keys(rs).forEach(function (batch_id) {
                        if (callbackMetas[batch_id].onData)
                            callbackMetas[batch_id].onData(rs[batch_id]);
                    });
                } else {
                    $log.info("Data tick khong hop le tai (machine_id=" + machine_id + ")");
                }
            });
        }

        function queryData(callback) {
            if (!machines.meta) return;

            dd.keys(machines.meta).forEach(function (machine_id) {
                var measurements = machines.meta[machine_id];

                var measure_str = dd.keys(measurements).join(",");

                var url = getUrl(machine_id,
                    "SELECT value FROM " + measure_str
                    + " WHERE time > now() - 1m"
                    + " GROUP BY container_name");
                console.log(url);

                url = encodeURI(url);

                $http.get(url)
                    .then(function (data, status, headers, config) {
                        callback(machine_id, data);
                    })
                    .catch(queryFailed);
            });
        }

        function queryContainerNames(machine, measurements) {
            if (!Array.isArray(measurements))
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
                if (data['data'] && data.data['results'] && data.data['results'].length > 0) {
                    var rs = {};
                    data.data.results[0].series.forEach(function (d) {
                        if (!rs[d.name]) rs[d.name] = [];
                        rs[d.name].push(d.tags.container_name);
                    });
                    return rs;
                } else {
                    $log.info("Wrong data at InfluxdbBatch.queryContainerNames(" + machine + "," + measurements + ")");
                }
            }

            return getC;
        }

        function getUrl(machine, query) {
            var endpoint = machines[machine][0];
            var db = machines[machine][1];

            return endpoint + "/query?db=" + db + setting + "&q=" + query;
        }


        function queryFailed(e) {
            return HttpException.handle(e, "query", "Influxdb");
        }
    }
})();
