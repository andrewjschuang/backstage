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
  dateFrom.setDate(dateFrom.getDate() - num_days);
  if (dateTo.getHours() >= start_of_day) {
    dateFrom.setDate(dateFrom.getDate() + 1);
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

  var three_days_before = new Date();
  three_days_before.setDate(three_days_before.getDate() - 3);
  if (three_days_before.getHours() >= start_of_day) {
    three_days_before.setDate(three_days_before.getDate() + 1);
  }
  three_days_before.setHours(start_of_day);
  three_days_before.setMinutes(0);
  three_days_before.setSeconds(0);
  three_days_before.setMilliseconds(0);

  var result = {
    hours: [{
      ts: new Date(three_days_before),
      value: 0,
      value_acc: 0
    }],
    days: [{
      ts: new Date(dateFrom),
      value: 0
    }]
  };

  var hours = dateTo.getHours();
  if (dateTo.getHours() < start_of_day) {
    hours += 72;
  } else {
    hours += 48;
  }

  var hour = three_days_before;
  for (let i = hour.getHours() + 1; i <= hours; i++) {
    hour.setHours(i % 24);
    let next_day = Math.floor(i / 24);
    var ts = new Date(hour);
    ts.setDate(hour.getDate() + next_day);
    result.hours.push({
      ts: ts,
      value: 0,
      value_acc: 0
    });
  }

  for (let i = 0; i < num_days - 1; i++) {
    var day = new Date(dateFrom.setDate(dateFrom.getDate() + 1));
    result.days.push({
      ts: new Date(day),
      value: 0
    });
  }

  axios.get(url, headers)
    .then(function (response) {
      // console.log(`got ${JSON.stringify(response.data, null, 2)}`);

      for (let data of response.data) {
        let ts = new Date(data['ts']);
        let today = hour.getDate();

        if (ts.getDate() == today) {
          for (let i = 0; i < result.hours.length; i++) {
            if (ts.getHours() == result.hours[i].ts.getHours()) {
              result.hours[i].value = Number(data['value']);
              result.hours[i].value_acc = Number(data['value']);
              break;
            }
          }
        }

        for (let i = result.days.length - 1; i >= 0; i--) {
          if (ts > result.days[i].ts) {
            result.days[i].value += Number(data['value']);
            break;
          }
        }
      }

      for (let i = 1; i < result.hours.length; i++) {
        result.hours[i].value_acc += result.hours[i - 1].value_acc;
      }

      for (let i = result.days.length - 1; i > 0; i--) {
        result.days[i - 1].value += result.days[i].value;
      }

      // console.log(result);
      resolve(result);
    })
    .catch(function (error) {
      reject(error.response.data);
    });
});

module.exports = { accumulatedRain };
