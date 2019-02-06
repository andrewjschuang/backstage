var axios = require('axios');

const accumulatedRain = (jwt, device_id, dateFrom, dateTo) => new Promise((resolve, reject) => {
  if (!(jwt && device_id && dateFrom)) {
    reject('required parameters: jwt, device_id, dateFrom');
  }

  var headers = {
    headers: {
      Authorization: 'Bearer ' + jwt
    }
  }

  var dojot_url = process.env.DOJOT_HOST || 'http://localhost:8000';
  dateFrom = '&dateFrom=' + dateFrom;
  dateTo = dateTo == undefined ? '' : '&dateTo=' + dateTo;
  var url = `${dojot_url}/history/device/${device_id}/history?attr=pcVol${dateFrom}${dateTo}`;
  
  axios.get(url, headers)
    .then(function (response) {
      var rain = 0;
      for (let data of response.data)
        rain += data['value'];
      resolve(rain);
    })
    .catch(function (error) {
      reject(error.response.data);
    });
});

module.exports = { accumulatedRain };
