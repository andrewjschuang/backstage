var axios = require('axios');

const accumulatedRain = (jwt, device_id, start_of_day, num_days) => new Promise((resolve, reject) => {
  start_of_day = start_of_day || 7;
  num_days = num_days || 3;

  if (!(jwt && device_id)) {
    reject('required parameters: jwt, device_id');
  }

  var headers = {
    headers: {
      Authorization: 'Bearer ' + jwt
    }
  }

  var dateTo = new Date();
  var dateFrom = new Date();

  if (dateTo.getHours() >= 7) {
    dateFrom.setDate(dateFrom.getDate() - num_days + 1);
  } else {
    dateFrom.setDate(dateFrom.getDate() - num_days);
  }
  dateFrom.setHours(start_of_day);
  dateFrom.setMinutes(0);
  dateFrom.setSeconds(0);
  dateFrom.setMilliseconds(0);

  dateFromString = dateFrom.toISOString();
  dateToString = dateTo.toISOString();

  console.log(`consulting history for device ${device_id}\n    from ${dateFromString} to ${dateToString}`);
  
  var dojot_url = process.env.DOJOT_HOST || 'http://localhost:8000';
  var url = `${dojot_url}/history/device/${device_id}/history?attr=pcVol&dateFrom=${dateFromString}&dateTo=${dateToString}`;

  var rain = [0];
  var intervals = [new Date(dateFrom)];
  for (let i = 0; i < num_days - 1; i++) {
    rain.push(0);
    intervals.push(new Date(dateFrom.setDate(dateFrom.getDate() + 1)));
  }

  axios.get(url, headers)
    .then(function (response) {
      // console.log(`got ${JSON.stringify(response.data, null, 2)}`);

      for (let data of response.data) {
        var ts = new Date(data['ts']);
        for (let i = intervals.length - 1; i >= 0; i--) {
          if (ts > intervals[i]) {
            rain[i] += Number(data['value']);
            break;
          }
        }
      }

      for (let i = 0; i < rain.length - 1; i++) {
        rain[i + 1] += rain[i];
      }

      resolve(rain);
    })
    .catch(function (error) {
      reject(error.response.data);
    });
});

module.exports = { accumulatedRain };
