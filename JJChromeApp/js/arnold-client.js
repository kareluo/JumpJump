  'use strict';

(exports => {

  const ARNOLD_CLIENT_PACKAGE = 'me.kareluo.arnold';
  const LIST_BIT = "ls -l /system/bin/app_process*";
  const LAUNCHER_COMMAND = 'am start -n "me.kareluo.arnold/me.kareluo.arnold.MainActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER';

  function ArnoldClient (host, port, deviceId) {
    this.host = host;
    this.port = port;
    this.deviceId = deviceId;
  }

  ArnoldClient.prototype.path = function(callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => {
      client.sendMessage(ADBClient.shellCommand("pm path " + ARNOLD_CLIENT_PACKAGE), result => {
        if(result === 'OKAY') {
          // just waitting.
        } else {
          if(result && result.match(/package:/i)) {
            client.disconnect();
            callback(result.replace(/[\n]/ig,'').replace(/package:/i, ''));
          } else throw new Error(result);
        }
      });
    })
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  ArnoldClient.prototype.size = function(callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.shellCommand("wm size"), result => {
      if(result === 'OKAY') {
        // just waitting.
      } else {
        console.log(result);
        let ret = {};
        let value = result || "";
        let size = value.match(/\d+/g);
        if(size && size.length == 2) {
          ret = {
            width: parseInt(size[0]),
            height: parseInt(size[1])
          };
        }
        callback(ret);
      }
    }))
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  ArnoldClient.prototype.forward = function(local, remote) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.hostCommand("forward:tcp:" + local + ";tcp:" + remote), result => {
      console.log(result);
    }))
    .then(result => {
      console.log(result);
    })
    .catch(error => {
      console.log(error);
      client.disconnect();
    })
  };

  ArnoldClient.prototype.installApk = function(path, callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.shellCommand('pm install -r ' + path), result => {
      if(result === 'OKAY') {
        // just waitting.
      } else {
        client.disconnect();
        if(result && result.toLowerCase() === 'success') {
          callback();
        } else throw new Error(result);
      }
    }))
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  ArnoldClient.prototype.launcher = function (callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.shellCommand(LAUNCHER), result => {
      if(result === 'OKAY') {
        // just waitting, command send success.
      } else {
        if(result.match(/Starting:/g)) {
          // launcher maybe success, but shell exec success.
          client.disconnect();
        } else {
          throw new Error(result);
        }
      }
    }))
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  // TODO
  ArnoldClient.prototype.bit = function (callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.shellCommand(LIST_BIT), result => {
      if(result === 'OKAY') {
        // just waitting.
      } else {
        if(result) {
          if(result.indexOf('app_process64') != -1) {
            callback('64');
          } else if(result.indexOf('app_process32') != -1) {
            callback('32');
          } else {
            callback('');
          }
        }
      }
    }))
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  ArnoldClient.prototype.arnold = function (path, bit, callback) {
    let client = new TCPClient(this.host, this.port);
    console.log(ADBClient.shellCommand('sh -c "CLASSPATH=' + path + ' /system/bin/app_process' + bit + ' /system/bin me.kareluo.arnold.ArnoldKt"'));

    client.connect()
    .then(() => ADBClient.transport(client, this.deviceId))
    .then(() => client.sendMessage(ADBClient.shellCommand('sh -c "CLASSPATH=' + path + ' /system/bin/app_process' + bit + ' /system/bin me.kareluo.arnold.ArnoldKt"'), result => {
      console.log(result);
      if(result === 'OKAY') {
        callback(result);
      }
    }))
    .catch(error => {
      console.log(error);
      client.disconnect();
    });
  };

  exports.ArnoldClient = ArnoldClient;

})(window);
