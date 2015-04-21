'use strict';

app.controller('UserController', ['$scope', '$location', 'toaster', 'Task', 'Authentication',
  function($scope, $location, toaster, Task, Authentication) {

    $scope.createUser = function() {
      Authentication.register($scope.user).then(function() {
        $('#userModal').modal('hide');
        toaster.pop('success', 'User Successfully Created');
        $location.path('/');
      }, function(err) {
        console.log('err: ', err);
        toaster.pop('error', 'User Creation Unsuccesful');
      });
    };

    $scope.createGroup = function() {
      Authentication.createGroup();
    }

    // $scope.editTask = function(task) {
    //   Task.editTask(task).then(function() {
    //     $('#editModal').modal('hide');
    //     toaster.pop('success', 'Task is updated.');
    //   });
    // }

  }
]);
