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
                timeFilter: "=",
                timeWidth: "=",
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

            // var seriesObject = [{
            //     color: palette.color(),
            //     data: [{x:0,y:0}],
            //     name: "remove",
            // }];

            var seriesObject = [];

            // seriesObject = [
            //     {
            //         color: palette.color(),
            //         data: [{ x: 1, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }],
            //         name: 'Moscow'
            //     }
            // ]

            var graph = createGraph(seriesObject);

            var palette = new Rickshaw.Color.Palette({ scheme: 'classic9' });

            graph.render();

            function updateData(newData) {
                var timeWidth = scope.timeWidth;
                var timeFilter = scope.timeFilter;

                // if(seriesObject[0].name === "remove"){
                //     seriesObject.unshift();
                // }

                // update data
                var extend = [];
                for (var container_name in newData) {
                    var so = getSerieObjectByName(container_name);
                    if (so) {
                        so.data = formatSeries(timeWidth, timeFilter, so.data, newData[container_name]);
                    } else {
                        extend.push(container_name);
                    }
                }
                extend.forEach(function (cn) {
                    seriesObject.push({
                        color: palette.color(),
                        data: formatSeries(timeWidth, timeFilter, undefined, newData[cn]),
                        name: cn,
                    })
                });

                graph.render();
            }

            function formatSeries(time_width, time_filter, oldData, newData) {
                if (newData.length == 0) return data;
                var rs = [];

                if (!oldData) {
                    var time_first = (newData[0].x - (time_width - time_filter));
                    rs.push({ x: time_first, y: 0 });
                    rs.push({ x: newData[0].x - 1, y: 0 });
                    newData.forEach(function (d) {
                        rs.push(d);
                    })
                    return rs;
                } else {
                    var time_first = (newData[0].x - (time_width - time_filter));
                    for (var i = 0; i < oldData.length; i++) {
                        if (oldData[i].x >= time_first) break;
                    }
                    if (i < oldData.length)
                        rs = oldData.slice(i, oldData.length);

                    newData.forEach(function (d) {
                        rs.push(d);
                    })
                    return rs;
                }
            }

            function getSerieObjectByName(container_name) {
                for (var i = 0; i < seriesObject.length; i++) {
                    if (seriesObject[i].name === container_name) {
                        return seriesObject[i];
                    }
                }
                return undefined;
            }

            function createGraph(seriesObject) {
                var graph = new Rickshaw.Graph({
                    element: graphEl[0],
                    width: attrs.width,
                    height: attrs.height,
                    stroke: true,
                    // preserve: true,
                    // max: 100,
                    renderer: "area",
                    series: seriesObject,
                });

                new Rickshaw.Graph.HoverDetail({
                    graph: graph,
                });

                var legend = new Rickshaw.Graph.Legend({
                    graph: graph,
                    element: element.children()[1],
                });

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
        }
    }
})();
