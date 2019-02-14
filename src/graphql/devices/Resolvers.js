const axios = require('axios');
const UTIL = require('../utils/AxiosUtils');

const params = {
  token: null,
};
const setToken = ((token) => { params.token = token; });
const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));

const Resolvers = {
  Query: {
    async history(root, { ids, qty = 1 }, context) {
      setToken(context.token);
      // setToken('O token vem aqui');
      const list = [];
      const promises = [];

      ids.forEach((id) => {
        const promise = (axios(optionsAxios(UTIL.GET, `/history/device/${id}/history?lastN=${qty}&attr=atAvg&attr=rhAvg&attr=wsMx&attr=pcVol`))).then((resp) => {
          const {
            wsMx, atAvg, rhAvg, pcVol,
          } = resp.data;
          list.push({
            id,
            atAvg,
            pcVol,
            wsMx,
            rhAvg,
          });
        });
        promises.push(promise);
      });

      await (Promise.all(promises));
      return list;
    },
  },
};

module.exports = Resolvers;
