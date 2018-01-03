'use strict';

const GAP_MILLIS = 700;

const WINDOW = chrome.app.window.current();

(exports => {

  const EVENT_ON_ERROR = 1;
  const EVENT_ON_PATH = 2;
  const EVENT_ON_INSTALLED = 3;
  const EVENT_ON_BIT = 4;
  const EVENT_ON_SIZE = 5;

  const REQUEST_PATH = 1;
  const REQUEST_BIT = 2;
  const REQUEST_INSTALL = 3;
  const REQUEST_SIZE = 4;
  const REQUEST_CONNECT = 5;
  const REQUEST_PUSH_APK = 6;

  const WS_PORT = 12723;
  const HTTP_PORT = 8888;
  const WS_URI = "ws://127.0.0.1:" + WS_PORT;

  function Arnold(serial, callback) {
    this.bit = null;
    this.path = null;
    this.serial = serial;
    this.callback = callback;

    this.size = {
      width: 360,
      height: 640
    };

    this.callback({
      stanza: 'size',
      size: this.size
    });

    this.drawer = new Drawer((code, event) => {
      switch (code) {
        case Drawer.EVENT_ON_OPEN:
          console.log("EVENT_ON_OPEN");
          $('.tips-container').hide();
          break;
      }
    });

    this.client = new ArnoldClient('127.0.0.1', 5037, serial);

    this.client.forward(WS_PORT, WS_PORT);
    this.client.forward(HTTP_PORT, HTTP_PORT);
  };

  Arnold.prototype._request = function(request) {
    switch (request.code) {
      case REQUEST_PATH:
        console.log("REQUEST_PATH");
        window.tips.innerText = "正在获取路径中...";
        if(this.path) {
          this._onEvent({
            code: EVENT_ON_PATH,
            path: this.path
          });
        } else {
          this.client.path(result => {
            console.log("result:" + result);
            this._onEvent({
              code: EVENT_ON_PATH,
              path: result
            });
          });
        }
        break;
      case REQUEST_INSTALL:
        console.log("REQUEST_INSTALL");
        window.tips.innerText = "正在安装客户端...";
        this.client.installApk(request.path, () => {
          this._onEvent({
            code: EVENT_ON_INSTALLED
          });
        });
        break;

      // TODO
      case REQUEST_BIT:
        console.log("REQUEST_BIT");
        window.tips.innerText = "正在获取CPU信息...";
        this.bit = 64;
        if(this.bit) {
          this._onEvent({
            code: EVENT_ON_BIT,
            bit: 64
          });
        } else {
          this.client.bit(result => {
            result = result | "";
            console.log(result);
            this._onEvent({
              code: EVENT_ON_BIT,
              bit: result
            });
          });
        }
        break;
      case REQUEST_SIZE:
        console.log("REQUEST_SIZE");
        window.tips.innerText = "正在获取屏幕尺寸...";
        if(this.size) {
          this._onEvent({
            code: EVENT_ON_SIZE,
            bit: this.size
          });
        } else {
          this.client.size(size => {
            if(size && size.width && size.height) {
              this._onEvent({
                code: EVENT_ON_SIZE,
                bit: size
              });
            }
          });
        }
        break;
      case REQUEST_CONNECT:
        console.log("REQUEST_CONNECT:" + this.bit);
        window.tips.innerText = "正在连接中...";
        this.client.arnold(this.path, this.bit, result => {
          setTimeout(() => {
            this.drawer.connect(WS_URI);
          }, 1000);
        });
        break;
      case REQUEST_PUSH_APK:
        console.log("REQUEST_PUSH_APK");
        let file_sync_client = new FileSyncClient("127.0.0.1", 5037, this.serial);
        let dstPath = "/data/local/tmp/apk"+(new Date).getTime()+".apk";
        file_sync_client.pushFile("assets/apk/arnold_client.apk", dstPath, () => {
          console.log(dstPath);
          this._request({
            code: REQUEST_INSTALL,
            path: dstPath
          })
        });
        break;
      default:
    }
  };

  Arnold.prototype.canvas = function() {
    return this.drawer.player.canvas;
  };
  
  Arnold.prototype._onEvent = function(event) {
    console.log(event);
    switch (event.code) {
      case EVENT_ON_PATH:
        this.path = event.path;
        if(this.path) {
          console.log("path:" + this.path);
          this._request({code:REQUEST_BIT});
        } else {
          this._request({code:REQUEST_PUSH_APK});
        }
        break;
      case EVENT_ON_INSTALLED:
        console.log("EVENT_ON_INSTALLED:");
        this._request({code:REQUEST_BIT});
        break;
      case EVENT_ON_BIT:
        this.bit = event.bit;
        console.log("EVENT_ON_BIT:" + this.bit);
        this._request({code:REQUEST_CONNECT});
        break;
      case EVENT_ON_SIZE:
        this.size = event.size;
        console.log("EVENT_ON_INSTALLED:" + this.size);
        this.callback({
          stanza: 'size',
          size: this.size
        });
        break;
      default:

    }
  }

  Arnold.prototype.check = function(callback) {
    if(this.path && this.bit) {
      callback();
    } else {
      new Promise((resolve, reject) => {
        if(this.path) {
          resolve();
        } else {
          window.tips.innerText = "获取路径中...";
          this.client.path(result => {
            this.path = result;
            resolve();
          });
        }
      })
      .then(() => {
        if(this.bit) {
          return;
        } else {
          return new Promise((resolve, reject) => {
            this.client.bit(result => {
              this.bit = result;
              resolve();
            })
          });
        }
      })
      .then(() => {
        callback();
      })
      .catch(error => {
        console.log(error);
      });
    }
  };

  Arnold.prototype.connect = function() {
    this._request({code:REQUEST_PATH});
  };

  exports.Arnold = Arnold;

})(window);

function resize() {
  if(WINDOW.isFullscreen()) return;
  let bds = WINDOW.getBounds();
  if(bds === window.bounds) return;
  let size = arnold.size;
  bds.width = Math.round(size.width / size.height * bds.height);
  WINDOW.setBounds(window.bounds = bds);
  window.lastUpdateDate = new Date();
};

function onBoundsChanged() {
  if(window.requestResizeTimer) {
    clearTimeout(window.requestResizeTimer);
  }
  window.requestResizeTimer = setTimeout(() => {
    resize();
  }, GAP_MILLIS);
};

function onFullscreened() {
  console.log(onFullscreened);
  console.log(WINDOW.isFullscreen());
};

$(document).ready(function() {
  window.tips = document.getElementById('tips');

  window.serial = Utils.getQueryParameter(location.search, 'serial');
  window.arnold = new Arnold(serial, event => {
    if(event) {
      switch (event.stanza) {
        case 'size':
          let width_rate = event.size.width / event.size.height * 100;
          $('#screen')[0].style.width = width_rate + 'vh';
          onBoundsChanged();
          break;
      }
    }
  });

  $('#screen')[0].appendChild(arnold.canvas());

  arnold.connect();

  WINDOW.onBoundsChanged.addListener(() => onBoundsChanged());
  WINDOW.onFullscreened.addListener(() => onFullscreened());
});
