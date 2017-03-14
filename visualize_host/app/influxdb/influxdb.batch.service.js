(function () {
    angular.module('smv.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ['DatasourceBatch', '$http', '$log'];

    var dd = SMVDataUtils;

    function InfluxdbBatch(BatchFactory, $http, $log) {
        return {
            createInfluxDataSource: createInfluxDataSource,
        }

        function createInfluxDataSource() {
            return new InfluxDataSource(BatchFactory({}), $http, $log);
        }

        function InfluxDataSource(batch, $http, $log) {
            var DS = this;

            DS.tick = tick;
            DS.batch = batch;

            var setting = "&epoch=s";

            // endpoint + database
            var machines = {
                "0": ["http:\/\/testing:8086", "cadvisor"],
            };

            // tree type tim dia chi register khi cap nhat lai data
            var parseTree = {};

            function tick() {
                if (DS.batch.isDirty()) {
                    DS.batch.setDirtyOff();

                    parseTree = buildIndexTree(DS.batch.getRegisteredData());

                    console.log(parseTree);
                }

                queryData(machines, parseTree, setting, onQueryComplete);
            }

            function onQueryComplete(machine_id, data) {
                // check tree data
                if (!(parseTree && parseTree[machine_id])) return;

                // check data return
                if (!(data &&
                    Array.isArray(data.results)
                    && data.results.length > 0
                    && data.results[0].series))
                    return;

                // dispatch data
                var registeredData = DS.batch.getRegisteredData();
                
                var result = {};
                var branch = parseTree[machine_id];

                var series = data.results[0].series;
                for (var i = 0; i < series.length; i++) {
                    var s = series[i];

                    var info_list = branch[s.name];
                    if (!info_list) continue;
                    info_list.forEach(function (info) {
                        if (!info) return;

                        if (!result[info.batch_id]) {
                            result[info.batch_id] = {};
                            result[info.batch_id][info.name] = [];
                        } else if (!result[info.batch_id][info.name]) {
                            result[info.batch_id][info.name] = [];
                        }
                        result[info.batch_id][info.name].push({
                            measurement: s.name,
                            container_name: s.tags.container_name,
                            data: s.values,
                        })
                    });
                }

                dd.keys(result).forEach(function (machine_id) {
                    registeredData[machine_id].onData(result[machine_id]);
                });
            }
        }

        function buildIndexTree(data) {
            var treeObj = {};
            dd.keys(data).forEach(function (batch_id) {
                var series_dict = data[batch_id].data;
                dd.keys(series_dict).forEach(function (name) {
                    var measurement = series_dict[name].measurement;
                    if (!Array.isArray(measurement)) measurement = [measurement,]

                    var machine_id = series_dict[name].machine_id;

                    if (!treeObj.hasOwnProperty(machine_id)) treeObj[machine_id] = {};

                    for (var i = 0; i < measurement.length; i++) {
                        var ms = measurement[i];
                        if (!treeObj[machine_id].hasOwnProperty(ms)) treeObj[machine_id][ms] = [];

                        treeObj[machine_id][ms].push({
                            batch_id: batch_id,
                            name: name
                        });
                    }
                });
            });

            return treeObj;
        }

        function test() {
            $http.get(
                encodeURI("http://testing:8086/query?db=cadvisor&epoch=s&q=SELECT value FROM cpu_usage_total WHERE time > now() - 1m GROUP BY container_name"))
                .then(function (data) {
                    console.log(data);
                })
                .catch(function (e) {
                    console.log(e);
                })
        }

        function queryData(machine_address, treeData, setting, callback) {
            if (!treeData) return;

            dd.keys(treeData).forEach(function (machine_id) {
                if (!machine_address[machine_id]) return;

                var machine_info = machine_address[machine_id];

                var measurements = treeData[machine_id];

                var measure_str = dd.keys(measurements).join(",");

                var url = getUrl(setting, machine_info[0], machine_info[1],
                    "SELECT value FROM " + measure_str
                    + " WHERE time > now() - 1m"
                    + " GROUP BY container_name");
                console.log(url);

                url = encodeURI(url);

                $http.get(url)
                    .then(function (data) {
                        callback(machine_id, data.data);
                    })
                    .catch(function (e) {
                        logger.error('XHR Failed for queryData. ' + error.data);
                    })
            });
        }

        function getUrl(setting, endpoint, db, query) {
            return endpoint + "/query?db=" + db + setting + "&q=" + query;
        }
    }

    // function queryContainerNames(machine, measurements) {
    //     if (!Array.isArray(measurements))
    //         measurements = [measurements,];

    //     var url = getUrl(machine,
    //         "SELECT value FROM "
    //         + measurements.join(",")
    //         + " GROUP BY container_name LIMIT 1");

    //     url = encodeURI(url);

    //     var getC = $http.get(url)
    //         .then(queryComplete)
    //         .catch(queryFailed);

    //     function queryComplete(data, status, headers, config) {
    //         if (data['data'] && data.data['results'] && data.data['results'].length > 0) {
    //             var rs = {};
    //             data.data.results[0].series.forEach(function (d) {
    //                 if (!rs[d.name]) rs[d.name] = [];
    //                 rs[d.name].push(d.tags.container_name);
    //             });
    //             return rs;
    //         } else {
    //             $log.info("Wrong data at InfluxdbBatch.queryContainerNames(" + machine + "," + measurements + ")");
    //         }
    //     }

    //     return getC;
    // }
})();
