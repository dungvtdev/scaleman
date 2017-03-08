(function(){
    angular.module('smv.data.influxdb')
        .provider("InfluxdbDispatcher", InfluxdbDispatcher);

    InfluxdbDispatcher.$inject = ["$interval"];

    function InfluxdbDispatcher($interval){
        this.interval = 1000;

        var service = {
            register: registerFn,
            unregister: unregisterFn,
        }

        this.$get = function(){
            return service;
        }

        /**
         * object
         * callbackfn array [time, value]
         * measurements = []
         * tab = []
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
