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
                getData: '&',
                interval: '=',
            },
            controllerAs: 'vm',
            controller: RickshawChartController,
            bindToController: true,
            template: ['<div></div>',
                      ].join(""),
            link: linkFn
        };
        return directive;

        function linkFn(scope, element, attrs, vm){
            var graphEl = element.children()[0];

            vm.graph = new Rickshaw.Graph({
                element: graphEl,
                width: attrs.width,
                height: attrs.height,
                series: [{data:vm.data, color:"#646464", name:"test"}],
                renderer: vm.renderer
            });

            vm.graph.render();
        }

        RickshawChartController.$inject = ['$interval'];

        function RickshawChartController($interval){
            var vm = this;

            var data = [[]];
            var random = new Rickshaw.Fixtures.RandomData(150);

            for(var i =0;i<150;i++){
                random.addData(data);
            }
            vm.interval = vm.interval || 3000;

            vm.data = data[0];

            $interval(Redraw, vm.interval, 0, false);

            function Redraw(){
                random.removeData(data);
                random.addData(data);
                UpdateGraph();
            }

            function UpdateGraph(){
                if(vm.graph)
                    vm.graph.update();
            }
        }
    }
})();
