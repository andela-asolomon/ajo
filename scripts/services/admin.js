'use strict';

app.factory('Admin', ['FURL', '$firebase',
  function(FURL, $firebase) {

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
      	var groupRef = ref.child('group').child(id);
        return groupRef.on('value', function(snap) {
          cb(snap.val());
        });
      }
    };

    return Admin;
  }

]);
