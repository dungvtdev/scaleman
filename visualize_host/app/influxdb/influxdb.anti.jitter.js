(function () {
    angular.module('smv.influxdb')
        .factory('InfluxdbAntiJitterFactory', InfluxdbAntiJitter);

    InfluxdbAntiJitter.$inject = ['AntiSeriesJitterFactory']

    function InfluxdbAntiJitter(BaseFactory) {
        return function () {
            return BaseFactory.createAntiJitter(getInfluxdbExtend());
        }
    }

    function getInfluxdbExtend() {
        return InfluxAntiJitterManager;
    }

    var InfluxAntiJitterManager = {
        getRecommendTimeBase: function (firstlySeriesDict) {
            // input list day data [x,y]
            if (!(firstlySeriesDict && Array.isArray(firstlySeriesDict))) {
                return -1;
            }
            var max = 0;
            var cur = max;
            for (var i = 0; i < firstlySeriesDict.length; i++) {
                if (!(firstlySeriesDict[i] && firstlySeriesDict[i].length > 0))
                    continue;
                cur = this.getTimeOfPoint(firstlySeriesDict[i][0]);
                if(cur>max) max = cur;
            }

            return max;
        }
    }

})();
