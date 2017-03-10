(function () {
    'use strict';

    angular
        .module('smv.components.chart')
        .directive("rickshawChart", RickshawChart);

    function RickshawChart() {
        var directive = {
            restrict: 'E',
            scope: {
                renderer: '@',
            },
            template: ['<div></div>',
            ].join(""),
            link: linkFn
        };
        return directive;

        function linkFn(scope, element, attrs) {
            var graph = null;
            var graphData=[];
            if (scope.dataSrc === "eventUpdateType") {
                scope.$watch(scope.chartDataUpdate, function (newVal, oldVal) {
                    if(!graph)
                        initGraph(scope.chartDataUpdate);
                    else
                        updateGraph(scope.chartDataUpdate);
                });
            }

            function initGraph(data) {
                var graphEl = element.children()[0];
                var palette = new Rickshaw.Color.Palette({scheme: 'classic9'});

                graphData = data;

                var series = graphData.map(function(el){
                    return {
                        data: el.data,
                        name: el.name,
                        color: palette.color()
                    }
                });
                graph = new Rickshaw.Graph({
                    element: graphEl,
                    width: attrs.width,
                    height: attrs.height,
                    series: series,
                    renderer: scope.render
                });
                graph.render();

                // x axis
                var time = new Rickshaw.Fixtures.Time();

                var xAxis = new Rickshaw.Graph.Axis.Time({
                    graph: graph,
                });

                xAxis.render();

                // y axis
                var yAxis = new Rickshaw.Graph.Axis.Y({
                    graph: graph
                });

                // hover
                var hoverDetail = new Rickshaw.Graph.HoverDetail({
                    graph: graph,
                    xFormatter: function (x) {
                        return new Date(x * 1000).toString();
                    }
                });
            }

            function updateGraph(data){
                if(!data)
                    return;

                for(var i=0;i<graphData.length;i++){

                }
            }
        }
    }
})();
