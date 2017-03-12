(function () {
    angular.module('smv.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ["CONFIG", 'DatasourceBatch', 'Influxdb'];

    function InfluxdbBatch(CONFIG, DatasourceBatch, influxService) {
        return function () {
            return new InfluxDataSource();
        }

        function InfluxDataSource() {
            this.tick = tick;
            this.interval = CONFIG.visualize_interval || 1000;
            this.registrator= DatasourceBatch(this);

            function tick() {
                var meta = this.registrator.getAllMeta()[0];
                if (!meta)
                    return;

                var meta2 = meta.meta["cpu"];
                influxService.query(meta2.measurement, meta2.tags)
                    .then(function (data) {
                        console.log(data);
                    })
            }
        }

    }
})();
