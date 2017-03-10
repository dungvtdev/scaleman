(function(){
    angular.module('smv.data.influxdb')
        .factory("InfluxdbDispatcher", InfluxdbDispatcher);

    InfluxdbDispatcher.$inject = ["$interval", "CONFIG"];

    function InfluxdbDispatcher($interval, CONFIG){
        var service = {
            register: registerFn,
            unregister: unregisterFn,
        }
        return service;

        this.interval = CONFIG.value("visualize_interval") || 1000;

        /**
         * object
         * onData array [time, value]
         * series[{measurement, tag}]
         * future: nhieu series cho 1 object
         */
        var registers = [];
        var generate_id = (function(id){
            return function(){
                return id++;
            }
        })(0);

        function registerFn(data){
            var new_id = generate_id();

            data.id = new_id;
            registers.push(data);
            console.log("Register "+registers.toString());

            return new_id;
        }

        function unregisterFn(id){
            var index = registers.findIndex(function(e){
                return e.id===id;
            });
            if(index>=0)
                registers.slice(index,1);
        }


    }
})();
