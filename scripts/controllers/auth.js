'use strict';

app.controller('AuthController', ['$scope', '$location', 'Authentication', 'toaster',
	function($scope, $location, Authentication, toaster) {

	$scope.register = function(user) {
		Authentication.register(user).then(function() {
			toaster.pop('success', 'Registered Successfully');
			$location.path('/');
		}, function(err) {
			console.log('err: ', err);
			toaster.pop('error', 'Registration Unsuccesful');
		});
	};

	$scope.login = function(user) {
		Authentication.login(user).then(function() {
			toaster.pop('success', 'Login Successfully');
			$location.path('/');
		}, function(err) {
			toaster.pop('error', 'Login Unsuccesful');
		});
	};

	$scope.loginWithGoogle = function() {
		Authentication.loginWithGoogle();
		toaster.pop('success', 'Login Successfully');
		$location.path('/');
	};

	$scope.changePassword = function(user) {

		Authentication.changePassword(user).then(function() {

			$scope.user.email = '';
			$scope.user.oldPassword = '';
			$scope.user.newPassword = '';

			toaster.pop('success', 'Login Successfully');
		}, function(err) {
			toaster.pop('error', 'Login Unsuccesful');
		});
	};


}]);