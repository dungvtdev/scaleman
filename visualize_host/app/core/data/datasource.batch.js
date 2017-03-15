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

    function DatasourceBatch() {
        return function (injectee) {
            if (!injectee.__dsbatch) {
                injectee.__dsbatch = new dsbatch();
            }
            return injectee.__dsbatch;
        }

        var dd = SMVDataUtils;

        function dsbatch() {
            var _dummies = {}
            var _dirty = false;

            this.register = registerFn;
            this.unregister = unregisterFn;
            this.onData = onData;
            this.getRegisteredData = getRegisteredData;
            this.isDirty = isDirty;
            this.setDirtyOff = setDirtyOff;

            var generate_id = (function (id) {
                return function () {
                    return (id++).toString();
                }
            })(0);

            function registerFn(data) {
                var new_id = generate_id();

                _dummies[new_id] = data;

                console.log("Register");
                console.log(_dummies);

                _dirty = true;

                return new_id;
            }

            function unregisterFn(id) {
                _dummies[id]=undefined;

                _dirty = true;
            }

            function isDirty(){
                return _dirty;
            }

            function setDirtyOff(){
                _dirty = false;
            }

            function onData(data){
                dd.keys(data).forEach(function(batch_id){
                    if(_dummies[batch_id]){
                        if(_dummies[batch_id].onData)
                            _dummies[batch_id].onData(data[batch_id]);
                    }
                });
            }


            function getRegisteredData(){
                return _dummies;
            }
        }
    }
})()
