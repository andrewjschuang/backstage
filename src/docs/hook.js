// eslint-disable-next-line import/no-unresolved
const hooks = require('hooks');

hooks.before('Check conflicts > Checking if there is a conflicting templates', (transactions, done) => {
  // eslint-disable-next-line no-param-reassign
  transactions.skip = true;
  done();
});
