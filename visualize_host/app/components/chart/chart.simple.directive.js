(function () {
    'use strict';

    angular.module('smv.components.chart')
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
                series: new Rickshaw.Series.FixedDuration([{name:"one"}],
                    undefined, {
                        timeInterval: 3000,
                        maxDataPoints: 100,
                        timeBase: new Date().getTime() / 1000
                    }),
                renderer: "area"
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

            }, 1000);

            function getData(){
                var data = { one: Math.floor(Math.random() * 40) + 120 };

                var randInt = Math.floor(Math.random() * 100);
                data.two = (Math.sin(i++ / 40) + 4) * (randInt + 400);
                data.three = randInt + 300;

                return data;
            }
        }


    }
})();
