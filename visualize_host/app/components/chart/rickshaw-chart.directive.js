(function () {
    'use strict';

    angular
        .module('smv.components.chart')
        .directive("rickshawChart", RickshawChart);

/**
 * ham getData return array [object]
 *      name: name series
 *      values[]
 */
    function RickshawChart() {
        var directive = {
            restrict: 'E',
            scope: {
                renderer: '@',
                type: "@",
                getData: "&",
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

            scope.$watch(scope.getData(), function(newVal, oldVal){
                if(newVal!==oldVal){
                    updateData(newVal);
                }
            });

            var graphEl = element.children()[0];

            var timeInterval = 1000;

            var initData = getData();
            if(initData && initData.interval)
                timeInterval = initData.interval;

            var maxDataPoints = attrs.maxDataPoints || 100;

            var graph = new Rickshaw.Graph({
                element: graphEl,
                width: attrs.width,
                height: attrs.height,
                series: new Rickshaw.Series.FixedDuration([{ name: "one" }],
                    undefined, {
                        timeInterval: timeInterval,
                        maxDataPoints: maxDataPoints,
                        timeBase: new Date().getTime() / 1000
                    }),
                renderer: "area"
            });

            graph.render();

            function updateData(newData){
                graph.series.addData(data);
                graph.render();
            }
        }
    }
})();
