'use strict';

app.controller('NavController', ['$scope', '$location', 'Authentication', 'toaster', 'cfpLoadingBar', '$timeout',
	function($scope, $location, Authentication, toaster, cfpLoadingBar, $timeout) {

	$scope.toggle = false;

	$timeout(function(){
		$scope.$apply(function() {
		 	$scope.currentUser = Authentication.user;

		 	$scope.showForm = function() {
		 		if ($scope.currentUser.uid.indexOf("google") >= 0) {
		 			$scope.toggle = !false;
		 		} else {
		 			$scope.toggle = false;
		 		}
		 	};
		});
	});

	$scope.signedIn = Authentication.signedIn;
	
	$scope.logout = function() {
		Authentication.logout();
		toaster.pop('success', 'Logged Out Successfully');
		$location.path('/');
	};

	$scope.start = function() {
	 cfpLoadingBar.start();
	};
}]);