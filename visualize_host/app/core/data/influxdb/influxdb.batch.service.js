(function(){
    angular.module('smv.core.data.influxdb')
        .factory("InfluxdbBatch", InfluxdbBatch);

    InfluxdbBatch.$inject = ["$interval", "CONFIG"];

    function InfluxdbBatch($interval, CONFIG){
        var service = {
            register: registerFn,
            unregister: unregisterFn,
        }
        return service;

        var interval = CONFIG.value("visualize_interval") || 1000;

        /**
         * object
         * onData array [time, value]
         * data: {name:{measurement, tag{}}}
         */
        var registers = {};
        var generate_id = (function(id){
            return function(){
                return id++;
            }
        })(0);

        function registerFn(data){
            var new_id = generate_id();

            registers[new_id] = data;

            console.log("Register "+registers.toString());

            return new_id;
        }

        // function unregisterFn(id){
        //     var index = registers.findIndex(function(e){
        //         return e.id===id;
        //     });
        //     if(index>=0)
        //         registers.slice(index,1);
        // }

        function onData(){
            
        }

        $interval(function(){

        }, interval);

    }
})();
