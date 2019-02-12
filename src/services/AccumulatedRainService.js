var axios = require('axios');

function initialize_date(date, beginning_hour, d, h, min, s, ms) {
  date.setDate(d);

  if (date.getHours() >= beginning_hour) {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(h);
  date.setMinutes(min);
  date.setSeconds(s);
  date.setMilliseconds(ms);

  return date;
}

const accumulatedRain = (dojot_host, jwt, device_id, beginning_hour, n_days_before_daily, n_days_before_hourly) => new Promise((resolve, reject) => {
  beginning_hour = beginning_hour || 7;
  n_days_before_daily = n_days_before_daily || 3;
  n_days_before_hourly = n_days_before_hourly || 3;

  if (!(device_id)) {
    reject('required parameters: device_id');
  }

  var dateTo = new Date();
  var dateFrom = new Date();
  var days_before = new Date();

  dateFrom = initialize_date(dateFrom, beginning_hour, dateFrom.getDate() - n_days_before_daily, beginning_hour, 0, 0, 0);
  days_before = initialize_date(days_before, beginning_hour, days_before.getDate() - n_days_before_hourly, beginning_hour, 0, 0, 0);

  dateFromString = dateFrom.toISOString();
  dateToString = dateTo.toISOString();

  var result = {
    hours: [{
      ts: new Date(days_before),
      value: 0,
      value_acc: 0
    }],
    days: [{
      ts: new Date(dateFrom),
      value: 0
    }]
  };

  var hours = dateTo.getHours();
  if (dateTo.getHours() < beginning_hour) {
    hours += n_days_before_hourly * 24;
  } else {
    hours += (n_days_before_hourly - 1) * 24;
  }

  var hour = new Date(days_before);
  for (let i = days_before.getHours() + 1; i <= hours; i++) {
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

  for (let i = 0; i < n_days_before_daily - 1; i++) {
    var day = new Date(dateFrom.setDate(dateFrom.getDate() + 1));
    result.days.push({
      ts: new Date(day),
      value: 0
    });
  }

  console.log(`consulting history for device ${device_id}\n    from ${dateFromString} to ${dateToString}`);
  var history;
  if (dojot_host) {
    history = dojot_host + '/history';
  } else {
    history = 'http://history:8000';
  }
  var url = `${history}/device/${device_id}/history?attr=pcVol&dateFrom=${dateFromString}&dateTo=${dateToString}`;

  axios({
    url,
    method: "get",
    headers: {
      Authorization: jwt
    }
  })
    .then(function (response) {
      // console.log(`got ${JSON.stringify(response.data, null, 2)}`);

      for (let data of response.data) {
        let ts = new Date(data['ts']);

        for (let i = 0; i < result.hours.length; i++) {
          if (ts.getDate() == result.hours[i].ts.getDate() && ts.getHours() == result.hours[i].ts.getHours()) {
            result.hours[i].value = Number(data['value']);
            result.hours[i].value_acc = Number(data['value']);
            break;
          }
        }

        for (let i = result.days.length - 1; i >= 0; i--) {
          if (ts > result.days[i].ts) {
            result.days[i].value += Number(data['value']);
            break;
          }
        }

        hour.setHours(hour.getHours() + 1);
      }

      for (let i = 1; i < result.hours.length; i++) {
        result.hours[i].value_acc += result.hours[i - 1].value_acc;
      }

      for (let i = result.days.length - 1; i > 0; i--) {
        result.days[i - 1].value += result.days[i].value;
      }

      // console.log(result);
      return resolve(result);
    })
    .catch(function (error) {
      return reject(error);
    });
});

module.exports = { accumulatedRain };
