'use strict';

app.controller('DashboardController', ['$scope', 'Dashboard', 'Authentication', '$timeout',
	function($scope, Dashboard, Authentication, $timeout) { 
		
		$scope.taskPoster = [];
		$scope.taskRunner = [];

		$timeout(function() {
			$scope.$apply(function() {
				$scope.uid = Authentication.user.uid;

				Dashboard.getTaskForUser($scope.uid).then(function(tasks) {
					
					for (var i = 0; i < tasks.length; i++) {
						tasks[i].type? $scope.taskPoster.push(tasks[i]) : $scope.taskRunner.push(tasks[i]);
					}

					$scope.numPoster = $scope.taskPoster.length;
					$scope.numRunner = $scope.taskRunner.length;

				});
			});
		});

}]);