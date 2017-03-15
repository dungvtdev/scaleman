(function () {
    angular.module('smv.core.data')
        .factory('AntiSeriesJitterFactory', AntiSeriesJitterFactory);

    AntiSeriesJitterFactory.$inject = ['$log'];

    function AntiSeriesJitterFactory($log) {
        return {
            createAntiJitter: createAntiJitter,
        }

        function createAntiJitter(extendObject) {
            var me = new BaseAntiSeriesJitterFactory();

            var dd = SMVDataUtils;

            dd.keys(extendObject).forEach(function (key) {
                if (typeof (extendObject[key]) === 'function') {
                    me[key] = extendObject[key].bind(me);
                } else {
                    me[key] = extendObject[key];
                }
            })

            return me;
        }

        function BaseAntiSeriesJitterFactory() {
            this._interval = 1000;
            this.setInterval = setInterval;

            this._onNeedUpdate = undefined;
            this.setOnNeedUpdate = setOnNeedUpdate;

            this._utcTime = 0;
            this.setUtcTime = setUtcTime;
            this.tickTime = tickTime;

            this.getTimeOfPoint = getTimeOfPoint;
            this.getValueOfPoint = getValueOfPoint;
            this.createPoint = createPoint;

            this.processData = processData;


            function setInterval(it) {
                this._interval = it;
            }

            function setOnNeedUpdate(func) {
                this._onNeedUpdate = func;
            }

            function getTimeOfPoint(point) {
                return point[0];
            }

            function getValueOfPoint(point) {
                return point[1];
            }

            function createPoint(value) {
                return [this._utcTime, value];
            }

            function setUtcTime(utcTime) {
                this._utcTime = utcTime;
            }

            function tickTime() {
                this._utcTime += this._interval;
            }

            //TODO: xu ly truong hop time khong deu

            // truyen vao 1 series cac point (time, value)
            // dua ra gia tri theo thoi gian, xoa gia tri cu
            // goi onNeedUpdate khi can update them
            function processData(series) {
                var errorFallback = errorFallbackFn.bind(this);

                if (series.length == 0) {
                    return errorFallback(0, "series length = 0, kiem tra lai");
                }
                for (var i = 0; i < series.length; i++) {
                    if (this.getTimeOfPoint(series[i]) >= this._utcTime) {
                        break;
                    }
                }

                if (i == series.length) {
                    return errorFallback(series[i - 1], "series tat ca point deu cu");
                }

                // bo di nhung point cu
                var first = 0;
                if (i != 0) {
                    while (i > 0) {
                        first = this.getValueOfPoint(series.shift());
                        i--;
                    }
                }

                if (this.getValueOfPoint(series[i]) == null) {
                    var hasNext = series.length > i + 1
                        && this.getValueOfPoint(series[i + 1]) != null;
                    if (!hasNext) {
                        return errorFallback(first, "series 2 null lien tiep");
                    }

                    var next = this.getValueOfPoint(series[i + 1]);
                    first = first || next;
                    var value = (first + next) / 2;

                    return this.createPoint(value);
                }

                return this.createPoint(this.getValueOfPoint(series[i]));
            }

            function errorFallbackFn(value, message) {
                $log.warn(message);
                if (this._onNeedUpdate)
                    this._onNeedUpdate();

                return this.createPoint(value);
            }
        }
    }
})();
