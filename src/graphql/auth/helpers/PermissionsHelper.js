const _ = require('lodash');
const mapPermissionsJson = require('./MapPermissions');

class PermissionsHelper {
  /**
   *
   * @param res
   * @returns {Array}
   * * */
  static parsePermissionsFromAuthBack(permissions) {
    const arrayPermissions = [];
    const permissionsGroupByPath = _.groupBy(permissions, 'path');
    Object.keys(permissionsGroupByPath).forEach((key) => {
      if (mapPermissionsJson[key]) {
        arrayPermissions.push({
          actions: permissionsGroupByPath[key].map(y => mapPermissionsJson[y.path][y.method].action),
          subject: mapPermissionsJson[key].subject,
        });
      }
    });
    return arrayPermissions;
  }

  static getPermissionIdFromAuthBack(path, method, arrPermissionsFromAuthBack) {
    const permissionsSystemByPath = _.groupBy(arrPermissionsFromAuthBack, 'path');
    return permissionsSystemByPath[path].find(g => g.action === method && g.permission === 'permit').id;
  }

  /**
   *
   * @returns {Array}
   */
  static parsePossiblesPermissionsFromJson() {
    // if group is admin, create all permissions
    const arrayPermissions = [];
    Object.keys(mapPermissionsJson).forEach((key) => {
      arrayPermissions.push({
        actions: ['viewer', 'modifier'],
        subject: mapPermissionsJson[key].subject,
      });
    });
    return arrayPermissions;
  }


  static getSubjectAlias(path) {
    return mapPermissionsJson[path].subject;
  }

  static getActionAlias(path, method) {
    return mapPermissionsJson[path][method].action;
  }

  static patchExist(path) {
    return mapPermissionsJson[path];
  }
}

module.exports = PermissionsHelper;
