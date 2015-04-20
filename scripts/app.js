'use strict';

var app = angular
  .module('TaskNinjaApp', ['chieffancypants.loadingBar','ngAnimate','ngResource','ngRoute','firebase','toaster', 'angularMoment'])
  .constant('FURL', 'https://ajo.firebaseio.com/')
  .run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
      if (error === 'AUTH_REQUIRED') {
        $location.path('/login');
      };
    });
  }])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/browse.html',
        controller: 'BrowseController'
      })
      .when('/browse/:taskId', {
        templateUrl: 'views/browse.html',
        controller: 'BrowseController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'AuthController'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'AuthController'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        resolve: {
          currentAuth: function(Authentication) {
            return Authentication.requireAuth();
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = !true;
  });
