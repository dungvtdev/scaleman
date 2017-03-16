(function () {
    'use strict';

    angular
        .module("smv.components.chart")
        .directive("rickshawChart", RickshawChart);

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
            template: ['<div></div><div></div>',
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

            var graphEl = element.children();

            var maxDataPoints = attrs.maxDataPoints || 40;
            var interval = scope.interval;

            var palette = new Rickshaw.Color.Palette({ scheme: 'classic9' });

            var graph = null;

            var templateGraph = createGraph();
            templateGraph.render();

            function createGraph(timeBase) {
                clearGraph();

                timeBase = timeBase || new Date().getTime() / 1000;

                var graph = new Rickshaw.Graph({
                    element: graphEl[0],
                    width: attrs.width,
                    height: attrs.height,
                    stroke: true,
                    // preserve: true,
                    min: 0,
                    // max: 100,
                    renderer: "line",
                    series: new Rickshaw.Series.FixedDuration([{ name: '/' }], undefined, {
                        timeInterval: interval,
                        maxDataPoints: maxDataPoints,
                        timeBase: timeBase,
                    })
                });

                new Rickshaw.Graph.HoverDetail({
                    graph: graph,
                });

                // new Rickshaw.Graph.Legend({
                //     graph: graph,
                //     element: element.children()[1],
                // });
                var ticksTreatment = 'glow';
                // var xAxis = new Rickshaw.Graph.Axis.Time({
                //     graph: graph,
                //     ticksTreatment: ticksTreatment,
                //     timeFixture: new Rickshaw.Fixtures.Time.Local()
                // });

                // xAxis.render();

                var yAxis = new Rickshaw.Graph.Axis.Y({
                    graph: graph,
                    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                    ticksTreatment: ticksTreatment
                });

                yAxis.render();



                return graph;
            }

            function clearGraph() {
                graphEl.html("");
            }

            function updateData(newData) {

                if (!graph) {
                    var max = 0;
                    for (var name in newData) {
                        var t = newData[name][0];
                        if (t > max) max = t;
                    }

                    graph = createGraph(max);
                }

                var data = {};
                var needUpdate = true;
                for (var name in newData) {
                    data[name] = newData[name][1];
                    if (data[name] == undefined) needUpdate = false;
                }

                if (needUpdate) {
                    graph.series.addData(data);
                    graph.render();
                }

            }
        }
    }
})();
