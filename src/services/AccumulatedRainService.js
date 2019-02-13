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

function compare_dates(comparison, d1, d2) {
  if (d1.getFullYear() == d2.getFullYear()) {
    if (d1.getMonth() == d2.getMonth()) {
      if (d1.getDate() == d2.getDate()) {
        if (d1.getHours() == d2.getHours()) {
          if (comparison == 'h') {
            return 'h';
          }
        }
        if (comparison == 'd') {
          return 'd';
        }
      }
      if (comparison == 'm') {
        return 'm';
      }
    }
    if (comparison == 'y') {
      return 'y';
    }
  }
  return null;
}

const accumulatedRain = (dojot_host, jwt, device_id, beginning_hour, n_days_before_daily, n_days_before_hourly) => new Promise((resolve, reject) => {
  beginning_hour = beginning_hour || 7;
  n_days_before_daily = n_days_before_daily || 3;
  n_days_before_hourly = n_days_before_hourly || 3;

  if (!(device_id)) {
    reject('required parameters: device_id');
  }

  var dateTo = new Date();
  var date_before_daily = new Date();
  var date_before_hourly = new Date();

  date_before_daily = initialize_date(date_before_daily, beginning_hour, date_before_daily.getDate() - n_days_before_daily, beginning_hour, 0, 0, 0);
  date_before_hourly = initialize_date(date_before_hourly, beginning_hour, date_before_hourly.getDate() - n_days_before_hourly, beginning_hour, 0, 0, 0);

  dateFromString = date_before_daily < date_before_hourly ? date_before_daily.toISOString() : date_before_hourly.toISOString();
  dateToString = dateTo.toISOString();

  var result = {
    hours: [{
      ts: new Date(date_before_hourly),
      value: 0,
      value_acc: 0
    }],
    days: [{
      ts: new Date(date_before_daily),
      value: 0
    }]
  };

  var hours = dateTo.getHours();
  if (dateTo.getHours() < beginning_hour) {
    hours += n_days_before_hourly * 24;
  } else {
    hours += (n_days_before_hourly - 1) * 24;
  }

  var hour = new Date(date_before_hourly);
  for (let i = date_before_hourly.getHours() + 1; i <= hours; i++) {
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
    var day = new Date(date_before_daily.setDate(date_before_daily.getDate() + 1));
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
    method: 'get',
    headers: {
      Authorization: jwt
    }
  })
    .then(function (response) {
      // console.log(`got ${JSON.stringify(response.data, null, 2)}`);

      for (let data of response.data) {
        let ts = new Date(data.ts);
        let value = Number(data.value);

        for (let i = 0; i < result.days.length; i++) {
          if (compare_dates('d', ts, result.days[i].ts) == 'd') {
            result.days[i].value += value;
            break;
          }
        }

        for (let i = 0; i < result.hours.length; i++) {
          if (compare_dates('h', ts, result.hours[i].ts) == 'h') {
            result.hours[i].value += value;
            result.hours[i].value_acc += value;
            break;
          }
        }
      }

      for (let i = 1; i < result.hours.length; i++) {
        result.hours[i].value_acc += result.hours[i - 1].value_acc;
      }

      for (let i = 1; i < result.days.length; i++) {
        result.days[i].value += result.days[i - 1].value;
      }

      // console.log(result);
      return resolve(result);
    })
    .catch(function (error) {
      return reject(error);
    });
});

module.exports = { accumulatedRain };
