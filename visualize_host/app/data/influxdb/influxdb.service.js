(function () {
    'use strict';

    angular.module('smv.data.influxdb')
        .factory('Influxdb', Influxdb);

    Influxdb.$inject = ["$http", "HttpException"];

    function Influxdb($http, HttpException) {
        var service = {
            setting: settingFn,
            query: queryFn,
        };
        return service;

        var _def_setting = {
            epoch: "s",
            db: "cadvisor",
            limit: 0,
        }
        var _setting = _def_setting;

        function queryFn(measurements, tags) {
            return $http.get(createUrl())
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

        function createUrl(measurements, tags) {
            var base = getBaseUrl() + "query?";
            var db = "db=" + _setting.db;
            var epoch = "epoch=" + _setting.epoch;
            var q = "q=SELECT " + tags.join(",")
                + "FROM " + measurements.join(",")
                + (_setting.limit > 0) ? "LIMIT" + _setting.limit : "";

            return base + db + "&" + epoch + "&" + q;
        }

        function getBaseUrl() {
            return "http://testing:8086";
        }
    }
})();
