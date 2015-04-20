'use strict';

app.controller('BrowseController', ['$scope', '$routeParams', 'toaster', 'Task', 'Authentication', '$timeout', 'Comment', 'Offer',
	function($scope, $routeParams, toaster, Task, Authentication, $timeout, Comment, Offer) {

		$scope.searchTask = '';
		$scope.tasks = Task.all;
		$scope.signedIn = Authentication.signedIn;
		$scope.listMode = true;
		$scope.alreadyOffered = true;

		$scope.user = Authentication.user;

		if ($routeParams.taskId) {
			var task = Task.getTask($routeParams.taskId).$asObject();
			$scope.listMode = !true;
			setSelectedTask(task);
		};

		function setSelectedTask(task) {

			$scope.selectedTask = task;
			
			$timeout(function() {
				$scope.$apply(function() {
					if ($scope.signedIn()) {
						Offer.isOffered(task.$id);


						$scope.isAssignee = Task.isAssignee;
						$scope.isCompleted = Task.isCompleted;

						$scope.isTaskCreator = Task.isCreator;
						$scope.isOpen = Task.isOpen;
					};
				})
			});

			$scope.comments = Comment.comments(task.$id);

			$scope.offers = Offer.offers(task.$id);

			$scope.block = false;

			$scope.isOfferMaker = Offer.isMaker;
		};

		$scope.cancelTask = function(taskId) {
			Task.cancelTask(taskId).then(function() {
				toaster.pop('success', 'This task is cancelled successfully');
			});
		};

		$scope.addComment = function() {
			var comment = {
				content : $scope.content,
				name: $scope.user.profile.name,
				gravatar: $scope.user.profile.gravatar
			};

			Comment.addComment($scope.selectedTask.$id, comment).then(function() {
				$scope.content = '';
			});
		};

		$scope.makeOffer = function() {
			var offer = {
				total: $scope.total,
				uid: $scope.user.uid,
				name: $scope.user.profile.name,
				gravatar: $scope.user.profile.gravatar
			};

			Offer.makeOffer($scope.selectedTask.$id, offer).then(function() {
				toaster.pop('success', 'Your offer has been placed');
				$('#offerModal').modal('hide');
				$scope.total = '';
				$scope.block = true;
			});

			$scope.alreadyOffered = false;
		};

		$scope.cancelOffer = function(offerId) {
			
			Offer.cancelOffer($scope.selectedTask.$id, offerId).then(function() {
				toaster.pop('success', 'This offer is cancelled successfully');

				$scope.alreadyOffered = false;
				$scope.block = false;
			});
		};

		$scope.acceptOffer = function(offerId, runnerId) {
			Offer.acceptOffer($scope.selectedTask.$id, offerId, runnerId).then(function() {
				toaster.pop('success', 'Offer is accepted');

				Offer.notifyRunner($scope.selectedTask.$id, runnerId);
			});
		};

		$scope.completeTask = function(taskId) {
			Task.completeTask(taskId).then(function() {
				toaster.pop('success', 'Congratulation! You have completed this task.');
			});
		}

}]);