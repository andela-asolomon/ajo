'use strict';

app.controller('TaskController', ['$scope', '$location', 'toaster', 'Task', 'Authentication',
 function($scope, $location, toaster, Task, Authentication) {

  $scope.createTask = function() {
    $scope.task.status  = "open";
    $scope.task.gravatar = Authentication.user.profile.gravatar;
    $scope.task.name = Authentication.user.profile.name;
    $scope.task.poster = Authentication.user.uid;


    Task.createTask($scope.task).then(function(ref) {
      $('#posModal').modal('hide');
      toaster.pop('success', 'Task Created Succesfully.');

      $scope.task = {
        title: '',
        description: '',
        total: '',
        status: 'open',
        gravatar: '',
        name: '',
        poster: ''
      }

      $location.path('/browse/' + ref.key());
    });

  };

  $scope.editTask = function(task) {
    Task.editTask(task).then(function() {
      $('#editModal').modal('hide');
      toaster.pop('success', 'Task is updated.');
    });
  }

}]);
