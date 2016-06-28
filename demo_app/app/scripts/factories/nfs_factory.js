/**
 * Nfs factory
 */
window.maidsafeDemo.factory('nfsFactory', [ function(Shared) {
  'use strict';
  var self = this;
  var mime = require('mime');
  var ROOT_PATH = {
    APP: 'app',
    DRIVE: 'drive'
  };
  var fs = require('fs');
  var request = require('request');

  // create new directory
  self.createDir = function(dirPath, isPrivate, userMetadata, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    dirPath = dirPath[0] === '/' ? dirPath.slice(1) : dirPath;
    var payload = {
      url: this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath,
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        isPrivate: isPrivate,
        userMetadata: userMetadata
      }
    };
    (new this.Request(payload, callback)).send();
  };

  // get specific directory
  self.getDir = function(callback, dirPath, isPathShared) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var URL = this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath;
    var payload = {
      url: URL,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.deleteDirectory = function(dirPath, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/directory/' + rootPath + '/' + dirPath;
    var payload = {
      url: url,
      method: 'DELETE',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.deleteFile = function(filePath, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var payload = {
      url: this.SERVER + 'nfs/file/' + rootPath + '/' + filePath,
      method: 'DELETE',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.createFile = function(filePath, metadata, isPathShared, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
    var payload = {
      url: url,
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        metadata: metadata
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.modifyFileContent = function(filePath, isPathShared, localPath, offset, callback) {
    offset = offset || 0;
    var self = this;
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
    var fileStream = fs.createReadStream(localPath).on('data', function(chunk) {
      callback(null, chunk.length);
    });
    fileStream.pipe(request.put(url, {
      headers: {
        'Content-Type': mime.lookup(filePath),
        'Range': 'Bytes=' + offset + '-'
      },
      auth: {
        'bearer': self.getAuthToken()
      }
    }, function(err) {
      callback(err);
    }));
  };

  self.getFile = function(filePath, isPathShared, downloadPath, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + 'nfs/file/' + rootPath + '/' + filePath;
    var headers = {
      auth: {
      'bearer': this.getAuthToken()
      }
    };
    request.get(url, headers)
    .on('response', function(response) {
      if (response.statusCode !== 200 && response.statusCode !== 206) {
        callback('Failed with status ' + response.statusMessage);
      }
    })
    .on('data', function(d) {
      callback(null, d.length);
    })
    .pipe(fs.createWriteStream(downloadPath));
  };

  var rename = function(path, isPathShared, newName, isFile, callback) {
    var rootPath = isPathShared ? ROOT_PATH.DRIVE : ROOT_PATH.APP;
    var url = this.SERVER + (isFile ? 'nfs/file/metadata/' : 'nfs/directory/') + rootPath + '/' + path;
    var payload = {
      url: url,
      method: 'PUT',
      headers: {
        authorization: 'Bearer ' + this.getAuthToken()
      },
      data: {
        name: newName
      }
    };
    (new this.Request(payload, callback)).send();
  };

  self.renameDirectory = function(dirPath, isPathShared, newName, callback) {
    rename(dirPath, isPathShared, newName, false, callback);
  };

  self.renameFile = function(oldPath, isPathShared, newPath, callback) {
    rename(dirPath, isPathShared, newName, true, callback);
  };
  return self;
} ]);
