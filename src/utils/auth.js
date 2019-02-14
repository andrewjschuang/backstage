/* jshint node: true */
/* jshint esversion: 6 */

const getToken = (tenant) => {
  const payload = { service: tenant, username: 'backstage' };
  return `${Buffer.from('jwt auth', 'base64').toString()}.${
    Buffer.from(JSON.stringify(payload), 'base64').toString()}.${
    Buffer.from('dummy signature', 'base64').toString()}`;
};

const b64decode = (data) => {
  if (typeof Buffer.from === 'function') {
    return Buffer.from(data, 'base64').toString();
  }
  return (Buffer.from(data, 'base64')).toString();
};

class UnauthorizedError {
  constructor() {
    this.message = 'Authentication (JWT) required for API';
  }
}

class InvalidTokenError {
  constructor() {
    this.message = 'Invalid authentication token given';
  }
}

function userDataByToken(rawToken) {
  const tokenData = JSON.parse(b64decode(rawToken.split('.')[1]));
  return {
    username: tokenData.username,
    userid: tokenData.userid,
    profile: tokenData.profile,
    service: tokenData.service,
  };
}

const authParse = (req, res, next) => {
  const rawToken = req.get('authorization');
  if (rawToken === undefined) {
    return next();
  }

  const token = rawToken.split('.');
  if (token.length !== 3) {
    console.error('Got invalid request: token is malformed', rawToken);
    return res.status(401).send(new InvalidTokenError());
  }

  req.token = rawToken;
  req.user = userDataByToken(rawToken);
  return next();
};

const authEnforce = (req, res, next) => {
  if (req.path.match(/(\.png|svg$)|(keymap\.json$)/)) {
    console.log('will ignore ', req.path);
    return next();
  }

  if (req.user === undefined || req.user.trim() === '') {
    // valid token must be supplied
    console.error('Got invalid request: user is not defined in token: ', req.get('authorization'));
    return res.status(401).send(new UnauthorizedError());
  }

  if (req.service === undefined || req.service.trim() === '') {
    // valid token must be supplied
    return res.status(401).send(new UnauthorizedError());
  }
  return next();
};

module.exports = {
  authParse, authEnforce, getToken, b64decode, userDataByToken,
};
