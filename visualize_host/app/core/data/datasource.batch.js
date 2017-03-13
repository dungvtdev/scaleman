(function () {
    'use strict';

    angular.module('smv.core.data')
        .factory('DatasourceBatch', DatasourceBatch);

/**
 * data: {
 *  data {name: data_meta}
 *  onData
 * }
 */
    DatasourceBatch.$inject = ['DataManipulation']

    function DatasourceBatch(dd) {
        return function (injectee) {
            if (!injectee.__dsbatch) {
                injectee.__dsbatch = new dsbatch();
            }
            return injectee.__dsbatch;
        }

        function dsbatch() {
            /** example
             * {
             *    2 : {
             *        measurement: cpu_usage_total,
                      machine_id: 0,
                      tags: {
                         container_name: "123",
                      },
             *    }
             * }
             */
            var _dummies = {}
            this._dummies = _dummies;

            this.register = registerFn;
            this.unregister = unregisterFn;
            this.onData = onData;
            this.getAllMeta = getAllMeta;

            var generate_id = (function (id) {
                return function () {
                    return id++;
                }
            })(0);

            function registerFn(data) {
                var new_id = generate_id();

                _dummies[new_id] = data;

                console.log("Register");
                console.log(_dummies);

                this.dirty = true;

                return new_id;
            }

            function unregisterFn(id) {
                _dummies[id]=undefined;

                this.dirty = true;
            }

            function onData(data){
                dd.keys(data).forEach(function(key){
                    if(_dummies[key]){
                        if(_dummies[key].onData)
                            _dummies[key].onData(data[key]);
                    }
                });
            }

            function getAllMeta(){
                var ls = [];
                dd.keys(_dummies).forEach(function(key){
                    var d = _dummies[key].data;
                    dd.keys(d).forEach(function(key){
                        ls.push(d[key]);
                    })
                });
                return ls;
            }
        }
    }
})()
