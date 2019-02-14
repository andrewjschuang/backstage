const axios = require('axios');
const moment = require('moment');
const UTIL = require('../utils/AxiosUtils');

const params = {
  token: null,
};
const setToken = ((token) => {
  params.token = token;
});


const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));

const Resolvers = {
  Query: {
    async rain(root, { id, initial = '2019-02-13', final = '' }, context) {
      setToken(context.token);
      // setToken('O token vem aqui');

      const resp = await axios(optionsAxios(UTIL.GET, `/history/STH/v1/contextEntities/type/device/id/${id}/attributes/pcVol?dateFrom=${initial}&dateTo=${final}`));
      const { values, name } = resp.data.contextResponses[0].contextElement.attributes[0];

      const perHour = [];
      const perDay = [];
      let tempHour = {
        hourPartial: 0, timestamp: 0, hourAccumulated: 0,
      };
      let tempDay = {
        dayPartial: 0, timestamp: 0, dayAccumulated: 0,
      };
      let hourAccumulated = 0;
      let dayAccumulated = 0;
      values.forEach((item) => {
        const day = moment(item.recvTime).local().format('DD/MM');
        const hour = moment(item.recvTime).local().format('DD/MM HH');

        if (tempHour.timestamp === 0) tempHour.timestamp = item.recvTime;
        if (hour === moment(tempHour.timestamp).local().format('DD/MM HH')) {
          tempHour.hourPartial = item.attrValue + tempHour.hourPartial;
          tempHour.timestamp = item.recvTime;
        } else {
          hourAccumulated = tempHour.hourPartial + hourAccumulated;
          tempHour.hourAccumulated = hourAccumulated.toFixed(2);
          tempHour.hourPartial = tempHour.hourPartial.toFixed(2);

          perHour.push(tempHour);
          tempHour = { hourPartial: item.attrValue, timestamp: item.recvTime, hourAccumulated: 0 };
        }

        if (tempDay.timestamp === 0) tempDay.timestamp = item.recvTime;
        if (day === moment(tempDay.timestamp).local().format('DD/MM')) {
          tempDay.dayPartial = item.attrValue + tempDay.dayPartial;
          tempDay.timestamp = item.recvTime;
        } else {
          dayAccumulated = tempDay.dayPartial + dayAccumulated;
          tempDay.dayAccumulated = dayAccumulated.toFixed(2);
          tempDay.dayPartial = tempDay.dayPartial.toFixed(2);

          perDay.push(tempDay);
          tempDay = { dayPartial: item.attrValue, timestamp: item.recvTime, dayAccumulated: 0 };
        }
      });
      return {
        deviceId: id, name, perHour, perDay,
      };
    },
  },
};

module.exports = Resolvers;
