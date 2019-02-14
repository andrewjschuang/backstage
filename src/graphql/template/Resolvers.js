const axios = require('axios');
const UTIL = require('../utils/AxiosUtils');

const params = {
  token: null,
};
const setToken = ((token) => { params.token = token; });
const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));
const reservedLabelImg = ['desired_version', 'version', 'update', 'update_result', 'state'];

const Resolvers = {
  Query: {
    async template(root, { id }) {
      // setToken(context.token);
      setToken('Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZW82dVYyamQ4TmtwQ1M4a2lZUkZmSVJqS1N6Rm5MaSIsImlhdCI6MTU1MDA3NDg1OSwiZXhwIjoxNTUwMDc1Mjc5LCJwcm9maWxlIjoiYWRtaW4iLCJncm91cHMiOlsxXSwidXNlcmlkIjoxLCJqdGkiOiIyYWVhODE1NTY3MDQxYTMyMGVkMzA0YTM5NWQ2NWRjMSIsInNlcnZpY2UiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.3qShdfvMC4L2sxWQhenZC301IbN8lqrzeDA94-1RV50');
      let templateData = null;
      await axios(optionsAxios(UTIL.GET, `/template/${id}`)).then((res) => {
        templateData = res.data;
      }).catch((error) => {
        console.log(error);
      });
      if (templateData) {
        const { attrs } = templateData;
        const attrImg = [];
        if (attrs) {
          templateData.attrs = attrs.filter((attr) => {
            if (attr.metadata && attr.metadata.length > 0) {
              const attrNew = attr.metadata.find(meta => reservedLabelImg.includes(meta.label));
              if (attrNew) {
                attrImg.push(attr);
                return false;
              }
            }
            return true;
          });
        }
        templateData.img_attrs = attrImg;
      }
      return templateData;
    },
  },
};

module.exports = Resolvers;
