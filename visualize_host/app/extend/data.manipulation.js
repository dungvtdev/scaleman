var SMVDataUtils = {};

(function (cc) {
    'use strict';

    cc.keys = keys;
    cc.clone = clone;

    function keys(obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }

    function clone(obj, exclude_attrs) {
        var cloneObject = JSON.parse(JSON.stringify(obj));
        if (exclude_attrs)
            if (!Array.isArray(exclude_attrs))
                exclude_attrs = [exclude_attrs,];

        exclude_attrs.forEach(function (ea) {
            cloneObject[ea] = undefined;
        });
        return cloneObject;
    }

})(SMVDataUtils);
