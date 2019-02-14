const {
  GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLInputObjectType,
} = require('graphql');
const axios = require('axios');
const _ = require('lodash');
const PermissionsHelper = require('./helpers/PermissionsHelper');
const UTIL = require('../utils/AxiosUtils');
const { userDataByToken } = require('../../utils/auth');
const config = require('../../config');

const params = {
  token: null,
  permissionsGroupOld: [],
  permissionsSystem: [],
};
const optionsAxios = ((method, url) => UTIL.optionsAxios(method, url, params.token));
const setToken = (token => (params.token = token));
const getUser = (token => userDataByToken(token));

// The default name of group, this group is fixed on system
const ADMIN_GROUP_NAME = 'admin';

/**
 *  Just a call to get all permissions available
 * @returns {*}
 */
function axiosPermissionsSystem() {
  return axios(optionsAxios(UTIL.GET, '/auth/pap/permission?type=system')).then((res) => {
    params.permissionsSystem = res.data.permissions;
  }).catch((error) => {
    console.log(error);
  });
}

/**
 * Just a call to get all permissions of a group
 * @param group
 * @returns {*}
 */
function axiosPermissionsGroup(group) {
  return axios(optionsAxios(UTIL.GET, `/auth/pap/group/${group}/permissions`)).then((res) => {
    params.permissionsGroupOld = res.data.permissions;
  }).catch((error) => {
    console.log(error);
  });
}

/**
 * GraphQlType for output of permissions
 * @type {GraphQLObjectType}
 */
const PermissionOutput = new GraphQLObjectType({
  name: 'PermissionResponse',
  description: 'Permission - Subject with theirs actions',
  fields: {
    subject: { type: GraphQLString, description: 'Subject' },
    actions: { type: new GraphQLList(GraphQLString), description: 'List actions of a subject' },
  },
});

/**
 * GraphQlType for Input of permissions
 * @type {GraphQLInputObjectType}
 */
const PermissionInput = new GraphQLInputObjectType({
  name: 'PermissionRequest',
  description: 'Permission - Subject with theirs actions',
  fields: {
    subject: { type: GraphQLString, description: 'Subject' },
    actions: { type: new GraphQLList(GraphQLString), description: 'List actions of a subject' },
  },
});

/**
 *
 * @param parentValue
 * @returns {Promise<*>}
 * @constructor
 */
const UserResolve = async (parentValue) => {
  if (parentValue.profile !== ADMIN_GROUP_NAME) {
    return axios(UTIL.optionsAxios(UTIL.GET, `/pap/group/${parentValue.profile}/permissions`, '', config.base_auth_url_graphql)).then(res => PermissionsHelper.parsePermissionsFromAuthBack(res.data.permissions)).catch((e) => {
      console.log(e);
    });
  }
  return axios(UTIL.optionsAxios(UTIL.GET, '/pap/permission?type=system', '', config.base_auth_url_graphql)).then(res => PermissionsHelper.parsePermissionsFromAuthBack(res.data.permissions)).catch((e) => {
    console.log(e);
  });
};
/**
 *  Join the info about user, with permissions of that user.
 *  If the user is of group admin, will be return all permissions available
 * @type {GraphQLObjectType}
 */
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Infos about user',
  fields: () => ({
    username: { type: GraphQLString },
    id: { type: GraphQLString },
    profile: { type: GraphQLString },
    service: { type: GraphQLString },
    permissions: {
      type: new GraphQLList(PermissionOutput),
      resolve: UserResolve,
    },
  }),
});

const LoginResolve = parentValue => ({
  username: parentValue.user.username,
  id: parentValue.user.userid,
  profile: parentValue.user.profile,
});

/**
 * Login Type of GraphQL
 * @type {GraphQLObjectType}
 */
const LoginType = new GraphQLObjectType({
  name: 'Login',
  description: 'Object with token and infos about the user',
  fields: () => ({
    jwt: { type: GraphQLString, description: 'JWT token' },
    user: {
      type: UserType,
      resolve: LoginResolve,
    },
  }),
});

/**
 *  Response for update of permissions
 * @type {GraphQLObjectType}
 */
const Response = new GraphQLObjectType({
  name: 'Response',
  description: 'Response of all updates of permissions',
  fields: {
    message: { type: GraphQLString, description: 'Message with description of status' },
    status: { type: GraphQLInt, description: 'Code of status. Eg.: 200' },
    subject: { type: GraphQLString, description: 'Subject of permission associated  status.' },
    action: { type: GraphQLString, description: 'Action of permission associated  status.' },
  },
});

/**
 *  This RootQuery in permissions return all permissions by group
 *  or if  group is empty  the all permissions available.
 * @type {GraphQLObjectType}
 */
const permissionQueryResolve = async (parentValue, { group }, context) => {
  setToken(context.token);
  if (group && group !== ADMIN_GROUP_NAME) {
    await axiosPermissionsGroup(group);
    return PermissionsHelper.parsePermissionsFromAuthBack(params.permissionsGroupOld);
  }
  await axiosPermissionsSystem();
  return PermissionsHelper.parsePermissionsFromAuthBack(params.permissionsSystem);
};
const PermissionsRootQuery = new GraphQLObjectType({
  name: 'PermissionsRootQuery',
  description: ' ',
  fields: {
    permissions: {
      type: new GraphQLList(PermissionOutput),
      description: 'Fetch permissions by user or all available with type System',
      args: {
        group: { type: GraphQLString, description: 'Name or id of group' },
      },
      resolve: permissionQueryResolve,
    },
  },
});

/**
 *  Init with all system permissions available and the old permissions of the group
 * @param group
 * @returns {Promise<void>}
 */
const initPermissions = async (group) => {
  try {
    const prom1 = axiosPermissionsSystem();
    const prom2 = axiosPermissionsGroup(group);
    await Promise.all([prom1, prom2]);
  } catch (e) {
    console.log(e);
  }
};

/**
 *  This call the api to create or delete a permission associated
 *
 * @param isCreate If is true is a create else is a delete
 * @param permId The id of permission will be associated
 * @param group The name of group will be associated
 * @param subjectAlias The alias of subject (in mapPermissions.Json)
 * @param actionAlias The alias of action (in mapPermissions.Json)
 * @returns {promise: (*|Promise<T | never>), response: *} promise and the response
 */
function updatePermAssociation(isCreate, permId, group, subjectAlias, actionAlias) {
  let response = null;
  const promise = axios(optionsAxios(isCreate ? UTIL.POST : UTIL.DELETE, `/auth/pap/grouppermissions/${group}/${permId}`)).then((res) => {
    response = {
      message: res.data.message,
      status: res.data.status,
      subject: subjectAlias,
      action: actionAlias,
    };
  }).catch((e) => {
    console.log(e);
  });
  return { promise, response };
}

const PermissionsMutationResolve = async (parentValue, { permissions, group }, context) => {
  setToken(context.token);
  return initPermissions(group).then(async () => {
    const responses = [];
    const promises = [];
    const permissionsGroupOld = _.groupBy(params.permissionsGroupOld, 'path');
    params.permissionsSystem.forEach((item) => {
      if (PermissionsHelper.patchExist(item.path)) {
        const subjectAlias = PermissionsHelper.getSubjectAlias(item.path);
        const actionAlias = PermissionsHelper.getActionAlias(item.path, item.method);

        const permOld = _.find(permissionsGroupOld[item.path], g => g.method === item.method && g.permission === 'permit');
        const permNew = _.find(permissions, g => g.subject === subjectAlias && _.find(g.actions, h => h === actionAlias));
        if (permOld && permNew) {
          return;
        }
        if (permOld || permNew) {
          const permId = item.id;
          const { promise, response } = updatePermAssociation(permNew, permId, group, subjectAlias, actionAlias);
          responses.push(response);
          promises.push(promise);
        }
      }
    });
    await Promise.all(promises);
    return responses;
  });
};

/**
 *  This mutation save (create or delete) the associated between permissions and groups
 * @type {GraphQLObjectType}
 */
const PermissionsMutation = new GraphQLObjectType({
  name: 'PermissionsMutation',
  description: ' ',
  fields: {
    permissions: {
      type: new GraphQLList(Response),
      description: 'Save permissions associated a group',
      args: {
        permissions: {
          type: new GraphQLList(PermissionInput),
        },
        group: { type: GraphQLString, description: 'Name or id of group' },
      },
      resolve: PermissionsMutationResolve,
    },
  },
});
/**
 *  This Mutation login in to the dojot and
 *  response with infos about user and theirs permissions.
 * @type {GraphQLObjectType}
 */
const LoginMutation = new GraphQLObjectType({
  name: 'LoginMutation',
  description: ' ',
  fields: {
    login: {
      type: LoginType,
      description: 'Login in to the dojot and response with infos about user and theirs permissions. ',
      args: { username: { type: GraphQLString }, passwd: { type: GraphQLString } },
      resolve(parentValue, { username, passwd }) {
        return axios.post(`${config.base_local_url_graphql}/auth`, { username, passwd })
          .then((resp) => {
            setToken(resp.data.token);
            return { jwt: resp.data.jwt, user: getUser(resp.data.jwt) };
          }).catch((e) => {
            console.log(e);
          });
      },
    },
  },
});

/**
 * RootQuery is required, even not used
 * @type {GraphQLObjectType}
 */
const LoginRootQuery = new GraphQLObjectType({
  name: 'LoginRootQuery',
  description: 'Not used yet',
  fields: {
    none: {
      type: GraphQLString,
    },
  },
});

/**
 *  Create obj GraphQLSchema for Login
 * @type {GraphQLSchema}
 */
const schemaLogin = new GraphQLSchema({
  description: 'Test',
  mutation: LoginMutation,
  query: LoginRootQuery,
});

/**
 * Create obj GraphQLSchema for Permissions
 * @type {GraphQLSchema}
 */
const schemaPermission = new GraphQLSchema({
  mutation: PermissionsMutation,
  query: PermissionsRootQuery,
});
module.exports = { schemaLogin, schemaPermission };
