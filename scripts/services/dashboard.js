'use strict';

app.factory('Dashboard', ['FURL', '$firebase', '$q', function (FURL, $firebase, $q) {
	

	var ref = new Firebase(FURL);

	var Dashboard = {

		getTaskForUser: function(uid) {
			var defer = $q.defer();

			$firebase(ref.child('user_tasks').child(uid))
				.$asArray()
					.$loaded()
						.then(function(tasks) {
							defer.resolve(tasks);
						}, function(err) {
							defer.reject(err);
						});

						return defer.promise;
		}
	};

	return Dashboard;
}]);