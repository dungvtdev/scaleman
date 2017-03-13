(function () {
    'use strict';

    angular.module('smv.influxdb')
        .factory('Influxdb', Influxdb);

    Influxdb.$inject = ["$http", "HttpException", "DataManipulation"];

    function Influxdb($http, HttpException, dd) {
        var _def_setting = {
            epoch: "s",
            db: "cadvisor",
        }
        var _setting = _def_setting;


        var service = {
            setting: settingFn,
            query: queryFn,
        };
        return service;

        function queryFn(measurement, tags) {
            var url = createUrl(measurement, tags);
            console.log("Url "+url);

            return $http.get(url)
                .then(queryComplete)
                .catch(queryFailed);

            function queryComplete(data, status, headers, config) {
                return data;
            }

            function queryFailed(e) {
                return HttpException.handle(e, "query", "Influxdb");
            }
        }

        function settingFn(setting) {

        }

        // function createUrl(measurement, tags, timeInterval) {
        //     var base = getBaseUrl() + "/query?";
        //     var db = "db=" + _setting.db;
        //     var epoch = "epoch=" + _setting.epoch;

        //     var q = "q=SELECT *"
        //         + " FROM " + measurement
        //         + timeInterval? " WHERE time >= "
        //         + (_setting.limit ? " LIMIT " + _setting.limit : "");
            
        //     var raw = base + db + "&" + epoch + "&" + q;
        //     console.log(raw);
        //     return encodeURI(raw);
        // }

        // function createUrl(measurement, tags) {
        //     var base = getBaseUrl() + "/query?";
        //     var db = "db=" + _setting.db;
        //     var epoch = "epoch=" + _setting.epoch;
        //     var tagwhere = dd.keys(tags).map(function(key){
        //         return key + "=" + tags[key];
        //     }).join(",");
        //     var tag = dd.keys(tags).map(function(key){
        //         return key;
        //     }).join(",");
        //     var q = "q=SELECT value"
        //         + " FROM " + measurement
        //         + " WHERE " + tagwhere
        //         + ((_setting.limit > 0) ? " LIMIT " + _setting.limit : "");
            
        //     var raw = base + db + "&" + epoch + "&" + q;
        //     console.log(raw);
        //     return encodeURI(raw);
        // }

        function getBaseUrl() {
            return "http://testing:8086";
        }
    }
})();
