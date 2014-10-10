var distance = require('google-distance-matrix');

var tripCache = {};

var getTripCacheKey = function(origin, destination) {
  return origin + '|' + destination;
};

var getTrip = function(from, to, cb) {
  var trip = tripCache[getTripCacheKey(from, to)];
  if (trip) {
    return cb(null, trip);
  }

  var origins = [from];
  var destinations = [to];

  distance.matrix(origins, destinations, function (err, distances) {
    if (err) {
        return console.log(err);
    }
    if(!distances) {
        return console.log('no distances');
    }
    if (distances.status == 'OK') {
      for (var i=0; i < origins.length; i++) {
        for (var j = 0; j < destinations.length; j++) {
          var origin = distances.origin_addresses[i];
          var destination = distances.destination_addresses[j];

          if (distances.rows[0].elements[j].status == 'OK') {

            var distance = distances.rows[i].elements[j].distance.value;
            var duration = distances.rows[i].elements[j].duration.value;

            var trip = {
              'origin': origin,
              'destination': destination,
              'distance': distance,
              'duration': duration
            };

            tripCache[getTripCacheKey(from, to)] = trip;

            return cb(null, trip);
          }
          else {
            return cb(
              new Error(destination + ' is not reachable from ' + origin), {
                'origin': origin,
                'destination': destination
              }
            );
          }
        }
      }
    }
  });
};

module.exports = {
  getTrip: getTrip
};
