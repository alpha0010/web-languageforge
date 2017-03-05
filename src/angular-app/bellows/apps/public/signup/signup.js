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
    $scope.location = $window.location;

    $scope.getCaptchaData = function () {
      sessionService.getCaptchaData(function (result) {
        if (result.ok) {
          $scope.captchaData = result.data;
          $scope.record.captcha = null;
        }
      });
    };

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
      // TODO: Using email address for usernames until we phase out usernames
      $scope.record.username = $scope.record.email;

      registerUser(function (url) {
        $window.location.href = url;
      });
    };

    function registerUser(successCallback) {
      $scope.submissionInProgress = true;
      userService.register($scope.record, function (result) {
        $scope.submissionInProgress = false;
        if (result.ok) {
          if (!result.data) {
            notice.push(notice.WARN, 'The image verification failed. Please try again');
            $scope.getCaptchaData();
          } else {
            if (result.data[1] != null) {
              (successCallback || angular.noop)($window.location.href = '/auth/login');
            } else {
              var identityCheck = result.data[0];
              $scope.usernameExists = identityCheck.usernameExists;
              $scope.usernameValid = !$scope.usernameExists;
              $scope.usernameExistsOnThisSite = identityCheck.usernameExistsOnThisSite;
              $scope.allowSignupFromOtherSites = identityCheck.allowSignupFromOtherSites;
              $scope.emailExists = identityCheck.emailExists;
              if ($scope.emailExists) {
                $scope.takenEmail = $scope.record.email.toLowerCase();
              }

              $scope.emailIsEmpty = identityCheck.emailIsEmpty;
              $scope.emailMatchesAccount = identityCheck.emailMatchesAccount;
            }

            $scope.submissionComplete = true;
          }
        }
      });
    }
  }])

  ;
