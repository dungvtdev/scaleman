(function () {
    angular.module("smv.core")
        .factory("HttpException", HttpExceptionFn);

    HttpExceptionFn.$inject = ["$log"];

    function HttpExceptionFn($log) {
        return {
            handle: handleFn,
        }

        function handleFn(e, name, service_name) {
            var newMessage = 'XHR Failed for '+name+' in service '+service_name;
            if (e.data && e.data.description) {
                newMessage = newMessage + '\n' + e.data.description;
            }
            e.data.description = newMessage;
            $log.error(newMessage);
            return $q.reject(e);
        }
    }
})();
