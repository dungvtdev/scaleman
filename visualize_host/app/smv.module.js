(function(){
    'use strict';

    angular
        .module("smv", [
            "smv.components",
            "smv.core",
            "smv.influxdb",
            "smv.monitoring",
            "smv.utils",
        ]);
})();
