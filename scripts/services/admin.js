'use strict';

app.factory('Admin', ['FURL', '$firebase', 
	function (FURL, $firebase) {

		var ref = new Firebase(FURL);

		var Admin = {

			createGroup: function(group) {
			  var obj = {
			    name: group.name,
			    amount: group.amount,
			    days: group.days
			  }
				return $firebase(ref.child('group').child(group.createdBy)).$push(obj);
			},

			getGroup: function(id, cb) {
				return $firebase(ref.child('group').child(id).on('value', function(snap) {
					console.log("snap: ", snap.val());
				}));		
			}

		};

		return Admin;

}])
