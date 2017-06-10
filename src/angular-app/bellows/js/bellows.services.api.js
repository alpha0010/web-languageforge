angular.module('bellows.services')
  .service('apiService', ['jsonRpc', '$q', function (jsonRpc, $q) {

    // FIXME This same code exists in session service, but can't be used due to circular dependency.
    var projectId = window.location.pathname.match(/^\/app\/[a-z]+\/([a-z0-9]{24,})$/i);
    projectId = projectId == null ? undefined : projectId[1];

    this.call = function(method, args, callback) {
      var options = {
        projectId: projectId
      };

      return $q(function(resolve, reject) {
        jsonRpc.call('/api/sf', method, options, args || [], function(result) {
          (callback || function(){})(result);
          result.ok ? resolve(result) : reject(result);
        });
      });
    };

    this.method = function(method) {
      return function() {
        // convert to array
        var args = [].slice.call(arguments);
        var callback = args.pop();
        if (typeof callback !== 'function') throw new Error('Last argument is not a callback');
        this.call(method, args, callback);
      }.bind(this);
    };
  }]);