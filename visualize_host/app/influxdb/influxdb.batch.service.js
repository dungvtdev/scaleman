(function () {
    angular.module('smv.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ['CONFIG', 'DatasourceBatch', '$http', '$log'];

    var dd = SMVDataUtils;

    function InfluxdbBatch(CONFIG, BatchFactory, $http, $log) {
        return {
            createInfluxDataSource: createInfluxDataSource,
        }

        function createInfluxDataSource() {
            var interval = CONFIG.value("visualize_interval") || 1000;

            return new InfluxDataSource(BatchFactory({}), interval, $http, $log);
        }

        function InfluxDataSource(batch, interval, $http, $log) {
            var DS = this;

            DS.pullData = pullData;
            DS.batch = batch;

            var setting = "&epoch=s";

            // endpoint + database
            var machines = {
                "0": ["http:\/\/testing:8086", "cadvisor"],
            };

            // tree type tim dia chi register khi cap nhat lai data
            var parseTree = {};

            function pullData() {
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
                var batch_data = DS.batch.getRegisteredData();

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
                            // data: s.values,
                            data: dataAccumToPercent(s.values),
                        })
                    });
                }

                dispatchData(result, batch_data);
            }

            function dataAccumToPercent(data) {
                if (!(data && data.length > 0)) return;

                // fill all null
                // for(var i =0;i<data.length;i++){
                var i = 0;
                while (i < data.length) {
                    if (data[i][1]) {
                        i++;
                        continue;
                    }
                    if (i > 0 && data[i - 1][1]) {
                        var prev = data[i - 1];
                        for (var j = i + 1; j < data.length; j++) {
                            if (data[j][1])
                                break;
                        }
                        if (j == data.length) {
                            data = data.slice(0, i);
                            break;
                        }

                        var next = data[j];
                        for (var k = i; k < j; k++) {
                            data[k][1] = (next[1] - prev[1]) * (k - (i - 1)) / (j - (i - 1)) + prev[1];
                        }
                        i = j + 1;
                    } else {  // i ==0
                        var kk = i + 1;
                        while (kk < data.length && !data[kk][1]) {
                            kk++;
                        }
                        if (kk >= data.length - 1) {
                            data = [];
                            break;
                        }
                        prev = data[kk];
                        kk++;
                        while (kk < data.length && !data[kk][1]) {
                            kk++;
                        }
                        if (kk >= data.length - 1) {
                            data = [];
                            break;
                        }
                        next = data[kk];
                        data[i][1] = next[1] - prev[1] * (next[0] - prev[0]) / (prev[0] - data[i][0]);

                        i++;
                    }
                }

                if(data.length==0)
                    return data;
                
                if (data.length == 1) {
                    data[i][1] = 0;

                } else {
                    for (var i = 0; i < data.length - 1; i++) {
                        data[i][1] = (data[i+1][1] - data[i][1]) / 2000000000;
                    }
                    if (data.length > 2) {
                        var l = data.length;
                        data[l - 1][1] = data[l - 3][1] + 2 * data[l - 2][1];
                    } else {
                        data[data.length - 1][1] = data[data.length - 2][1];
                    }
                }


                return data;

            }

            function dispatchData(data, batch_data) {
                dd.keys(data).forEach(function (machine_id) {
                    batch_data[machine_id].onData(data[machine_id]);
                });
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
                        "SELECT mean(value) FROM " + measure_str
                        + " WHERE time > now() - 1m"
                        + " GROUP BY container_name,time("
                        + interval / 1000 + "s)");
                        // "SELECT value FROM " + measure_str
                        // + " WHERE time > now() - 1m"
                        // + " GROUP BY container_name");
                    console.log(url);

                    url = encodeURI(url);

                    $http.get(url)
                        .then(function (data) {
                            callback(machine_id, data.data);
                        })
                        .catch(function (e) {
                            $log.error('XHR Failed for queryData. ' + e.data);
                        })
                });
            }

            function getUrl(setting, endpoint, db, query) {
                return endpoint + "/query?db=" + db + setting + "&q=" + query;
            }
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
