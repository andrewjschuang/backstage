const PermissionHelper = require('../graphql/auth/helpers/PermissionsHelper');

const permMockIn = {
  permissions: [
    {
      id: 5,
      path: '/device/(.*)',
      name: 'ro_device',
      method: 'GET',
      permission: 'permit',
      type: 'system',
      created_date: '2019-01-16T13:35:39.127452',
      created_by: 0,
    },
    {
      id: 7,
      path: '/flows/(.*)',
      name: 'ro_flows',
      method: '(.*)',
      permission: 'permit',
      type: 'system',
      created_date: '2019-01-16T13:35:39.128686',
      created_by: 0,
    },
    {
      id: 8,
      path: '/device/(.*)',
      name: 'ro_device',
      method: '(.*)',
      permission: 'permit',
      type: 'system',
      created_date: '2019-01-16T13:35:39.127452',
      created_by: 0,
    },
  ],
};

const permMockOut = [
  {
    subject: 'device',
    actions: [
      'viewer',
      'modifier',
    ],
  },
  {
    subject: 'flows',
    actions: [
      'modifier',
    ],
  }];
// eslint-disable-next-line no-undef
test('Test Permission Helper Parses', () => {
  // eslint-disable-next-line no-undef
  expect(PermissionHelper.parsePermissionsFromAuthBack(permMockIn.permissions)).toMatchObject(permMockOut);
});
