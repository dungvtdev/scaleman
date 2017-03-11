(function () {
    'use strict';

    angular.module('smv.utils')
        .factory('DataManipulation', DataManipulation);

    function DataManipulation() {
        return {
            keys: keys,
            clone: clone,
        }

        function keys(obj) {
            var keys = [];
            for (var key in obj) keys.push(key);
            return keys;
        }

        function clone(obj, exclude_attrs){
            var cloneObject = Object.create(obj);
            if(exclude_attrs)
                exclude_attrs.forEach(function(ea){
                    cloneObject[ea] = undefined;
                });

            return cloneObject;
        }
    }
})();