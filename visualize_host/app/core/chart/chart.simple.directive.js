(function () {
    'use strict';

    angular.module('smv.core.chart')
        .directive('chartSimple', ChartSimple);

    ChartSimple.$inject = ["$interval"];

    function ChartSimple($interval) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            link: linkFn,
        }

        function linkFn(scope, elem, attrs) {
            console.log("Link");
            var graphEl = elem.children()[0];

            var data = [];
            for(var i=0;i<50;i++){
                data.push(getData());
            }
            var graph = new Rickshaw.Graph({
                element: graphEl,
                width: attrs.width,
                height: attrs.height,
                series: Rickshaw.Series.RealTimeSeries.create([{name:"one"}], undefined, 50),
            });

            graph.render();

            // hover
            var hoverDetail = new Rickshaw.Graph.HoverDetail({
                graph: graph,
            });

            // add some data every so often

            var i = 0;
            $interval(function () {

                var data = getData();

                graph.series.addData(data);
                graph.render();

            }, 500);

            function getData(){
                var data = { one: [
                    {y:Math.floor(Math.random() * 40) + 120, x: new Date().getTime()/1000},
                    {y:Math.floor(Math.random() * 40) + 120, x: new Date().getTime()/1000+0.5},
                    ]};

                return data;
            }
        }


    }
})();
