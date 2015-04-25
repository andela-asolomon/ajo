'use strict';

app.controller('AdminController', ['$scope', '$location', 'toaster', 'Authentication', 'Admin',
  function($scope, $location, toaster, Authentication, Admin) {

    $scope.admin = Authentication.user;
    console.log("scope.admin: ", $scope.admin.uid);

    $scope.createGroup = function() {
      $scope.group.createdBy = $scope.currentUser.uid;
      Admin.createGroup($scope.group).then(function(){
        $('#userGroup').modal('hide');
        toaster.pop('success', 'Group Successfully Created');
        $location.path('/admin');
      }, function(err) {
        console.log('err: ', err);
        toaster.pop('error', 'Group Creation Unsuccesful');
      });
    };

    $scope.createUser = function() {
      $scope.user.group = '-Jni9LTk-Qr5Sxsv_wRl';
      Authentication.register($scope.user).then(function() {
        $('#userModal').modal('hide');
        toaster.pop('success', 'User Successfully Created');
        $location.path('/');
      }, function(err) {
        console.log('err: ', err);
        toaster.pop('error', 'User Creation Unsuccesful');
      });
    };

    // $scope.getGroup = function() {
    //   Admin.getGroup($scope.admin.uid).then(function(data) {
    //     console.log("data: ", data);
    //   }, function(err) {
    //     console.log("err: ", err);
    //   });
    // };

    // $scope.editTask = function(task) {
    //   Task.editTask(task).then(function() {
    //     $('#editModal').modal('hide');
    //     toaster.pop('success', 'Task is updated.');
    //   });
    // }
    // 
    // -Jni9LTk-Qr5Sxsv_wRl

  }
]);
