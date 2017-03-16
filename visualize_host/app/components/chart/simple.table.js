(function () {
    'use strict';

    angular
        .module("smv.components.chart")
        .directive("simpleTable", RickshawChart);

    /**
     * ham getData return array [object]
     *      name: [x,y]
     */
    function RickshawChart() {
        var directive = {
            restrict: 'E',
            scope: {
                getData: "&",
                name: '@',
                type: "@",
                interval: "=",
            },
            template: ['<div></div>',
            ].join(""),
            link: linkFn
        };
        return directive;

        function linkFn(scope, element, attrs) {
            if (scope.type === "realTime")
                realtimeTypeConfig(scope, element, attrs);
        }

        function realtimeTypeConfig(scope, element, attrs) {
            scope.$watch(function () {
                var s = scope.getData({ name: scope.name })
                return s;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    updateData(newVal);
                }
            });

            function updateData(newData) {
                var str = "";

                for (var name in newData) {
                    // newData[name] = newData[name][1];
                    str+="<p>"+name+" "+newData[name][1]+"</p>";
                }

                element.html(str);
            }
        }
    }
})();
