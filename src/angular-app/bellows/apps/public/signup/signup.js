'use strict';

// Declare app level module which depends on filters, and services
angular.module('signup', ['bellows.services', 'ui.bootstrap', 'ngAnimate', 'ui.router',
  'pascalprecht.translate', 'palaso.util.model.transform', 'palaso.ui.captcha'])
  .config(['$urlRouterProvider', '$translateProvider',
  function ($urlRouterProvider, $translateProvider) {
    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/bellows/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');

  }])
  .controller('SignupCtrl', ['$scope', '$state', '$window', 'userService', 'sessionService',
    'silNoticeService',
  function ($scope, $state, $window, userService, sessionService, notice) {
    $scope.showPassword = false;
    $scope.emailValid = true;
    $scope.passwordValid = true;
    $scope.record = {};
    $scope.record.id = '';
    $scope.captchaData = '';
    $scope.captchaFailed = false;
    $scope.hostname = $window.location.hostname;

    $scope.getCaptchaData = function () {
      sessionService.getCaptchaData(function (result) {
        if (result.ok) {
          $scope.captchaData = result.data;
          $scope.record.captcha = null;
        }
      });
    };

    // signup app should only show when no user is present (not logged in)
    if (angular.isDefined(sessionService.currentUserId())) {
      $window.location.href = '/app/projects';
    }

    $scope.validateEmail = function () {
      $scope.emailValid = $scope.signupForm.email.$dirty && !$scope.signupForm.$error.email;
    };

    $scope.validatePassword = function () {
      $scope.passwordValid = ($scope.signupForm.password.$dirty ||
        $scope.signupForm.visiblePassword.$dirty) &&
        ($scope.record.password.length >= 7);
    };

    $scope.getCaptchaData();

    $scope.processForm = function () {
      registerUser(function (url) {
        $window.location.href = url;
      });
    };

    function registerUser(successCallback) {
      $scope.captchaFailed = false;
      $scope.submissionInProgress = true;
      userService.register($scope.record, function (result) {
        if (result.ok) {
          switch (result.data) {
            case 'captchaFail':
              $scope.captchaFailed = true;
              $scope.getCaptchaData();
              break;
            case 'emailNotAvailable':
              $scope.emailExists = true;
              $scope.takenEmail = $scope.record.email.toLowerCase();
              break;
            case 'login':
              successCallback('/app/projects');
              break;
          }
        }
        $scope.submissionInProgress = false;
      });
    }
  }])

  ;
