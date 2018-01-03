/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


function _ArrayBufferToString(buf, callback) {
  var fr = new FileReader();
  fr.onload = function(e) {
    callback(e.target.result);
  };
  var blob=new Blob([ buf ], { type: 'application/octet-stream' });
  fr.readAsText(blob);
};

function _StringToArrayBuffer(str, callback) {
  var bb = new Blob([str]);
  var fr = new FileReader();
  fr.onload = function(e) {
     callback(e.target.result);
  };
  fr.readAsArrayBuffer(bb);
};

function _AdbCommandWithLength(command) {
  return command.length.toString(16).padStart(4, '0') + command;
};

function Commons() {

};
Commons.stab = _StringToArrayBuffer;
Commons.acwl = _AdbCommandWithLength;
Commons.abts = _ArrayBufferToString;

/* harmony default export */ __webpack_exports__["a"] = (Commons);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__chrome_adb__ = __webpack_require__(2);




// ChromeAdb.shell({
//   host: "127.0.0.1",
//   port: 5037,
//   serial: "5LM0216114009168",
//   onResponse: function (result) {
//     console.log("result=" + result);
//   },
//   onError: function(error) {
//     console.log("error=" + error);
//   }
// }, "input tap 100 100");

window.ChromeAdb = __WEBPACK_IMPORTED_MODULE_0__chrome_adb__["a" /* default */];


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__adb_client__ = __webpack_require__(3);




function ChromeAdb() {

};

ChromeAdb.devices = function(config) {
  new __WEBPACK_IMPORTED_MODULE_0__adb_client__["a" /* default */]().exec(config, "devices-l");
};

ChromeAdb.exec = function(config, cmd) {
  new __WEBPACK_IMPORTED_MODULE_0__adb_client__["a" /* default */]().exec(config, cmd);
};

ChromeAdb.shell = function(config, command) {
  new __WEBPACK_IMPORTED_MODULE_0__adb_client__["a" /* default */]().shell(config, command);
};

/* harmony default export */ __webpack_exports__["a"] = (ChromeAdb);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tcp_client__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__adb_utils__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__commons__ = __webpack_require__(0);






function ADBClient() {

};

ADBClient.prototype.exec = function (config, command) {
  let _tcp_client = new __WEBPACK_IMPORTED_MODULE_0__tcp_client__["a" /* default */](config);
  _tcp_client.connect(() => {
    _tcp_client.sendText(__WEBPACK_IMPORTED_MODULE_1__adb_utils__["a" /* default */].withHost(command));
  });
};

ADBClient.prototype.shell = function (config, command) {
  let rCount = 0;
  let callback = {
    host: config.host,
    port: config.port,
    onReceive: (data) => {
      __WEBPACK_IMPORTED_MODULE_2__commons__["a" /* default */].abts(data, message => {
        rCount ++;
        switch (message) {
          case "OKAY":
            if(rCount === 1) {
                _tcp_client.sendText(__WEBPACK_IMPORTED_MODULE_1__adb_utils__["a" /* default */].withShell(command));
            }
            break;
          default:

            break;
        }
      });
    }
  };

  let _tcp_client = new __WEBPACK_IMPORTED_MODULE_0__tcp_client__["a" /* default */](callback);
  _tcp_client.connect(() => {
    _tcp_client.sendText(__WEBPACK_IMPORTED_MODULE_1__adb_utils__["a" /* default */].withTransport(config.serial));
  });
};

/* harmony default export */ __webpack_exports__["a"] = (ADBClient);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__commons__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__byte_builder__ = __webpack_require__(5);





function TCPClient(config) {
  this.config = config || {};
  this.config.host = this.config.host || "127.0.0.1";
  this.config.port = this.config.port || 80;
  
  this.socketId = null;
  this.bufs = new __WEBPACK_IMPORTED_MODULE_1__byte_builder__["a" /* default */](1024);
};

TCPClient.prototype._create = function (callback) {
  chrome.sockets.tcp.create({}, info => {
    if(chrome.runtime.lastError) {
      this._onError(chrome.runtime.lastError);
    } else {
      callback(info.socketId);
    }
  });
};

TCPClient.prototype._connect = function (callback) {
  chrome.sockets.tcp.connect(this.socketId, this.config.host, this.config.port, result => {
    if(chrome.runtime.lastError) {
      this._onError(chrome.runtime.lastError);
    } else if (result < 0) {
      this._onError("Unable to connect server: " + result);
    } else {
      this._onOpen();
      if(callback) callback();
    }
  });
};

TCPClient.prototype._onOpen = function() {
  chrome.sockets.tcp.onReceive.addListener(this._onReceive.bind(this));
  chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError.bind(this));
  if(this.config.onOpen) {
    this.config.onOpen();
  }
};

TCPClient.prototype._onReceive = function(info) {
  if (info.socketId === this.socketId && info.data) {
    if(this.config.onReceive) {
      this.config.onReceive(info.data);
    }
    if(this.config.onResponse) {
      this.bufs.append(info.data);
    }
  }
};

TCPClient.prototype._onReceiveError = function(info) {
  if (info.socketId === this.socketId) {
    if(info.resultCode === -100) {
      this._onClose();
    } else {
      this._onError("Unable to receive data from socket: " + info.resultCode);
    }
  }
};

TCPClient.prototype._onError = function(error) {
  if(this.config.onError) {
    this.config.onError(error);
  }
};

TCPClient.prototype._onClose = function() {
  chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
  chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
  this.socketId = null;
  if(this.config.onResponse) {
    __WEBPACK_IMPORTED_MODULE_0__commons__["a" /* default */].abts(this.bufs.toArrayBuffer(), message => {
      this.config.onResponse(message);
    });
  }
  if(this.config.onClose) {
    this.config.onClose();
  }
};

TCPClient.prototype.connect = function(callback) {
  return this._create(socketId => {
    this.socketId = socketId;
    this._connect(callback);
  });
};

TCPClient.prototype.send = function(buffer, callback) {
  chrome.sockets.tcp.send(this.socketId, buffer, info => {
    if(callback) callback(info);
  });
};

TCPClient.prototype.sendText = function(message, callback) {
  __WEBPACK_IMPORTED_MODULE_0__commons__["a" /* default */].stab(message, buffer => {
    this.send(buffer, callback);
  });
};

/* harmony default export */ __webpack_exports__["a"] = (TCPClient);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


function ByteBuilder(maxLength = 1024) {
   this.maxLength = maxLength;
   this.offset = 0;
   this.buffers = new Uint8Array(new ArrayBuffer(maxLength));
};

ByteBuilder.prototype.append = function(buffer) {
   if(buffer) {
     if(this.offset + buffer.byteLength <= this.maxLength) {
       this.buffers.set(new Uint8Array(buffer), this.offset);
       this.offset += buffer.byteLength;
     }
   }
};

ByteBuilder.prototype.clear = function() {
   this.offset = 0;
};

ByteBuilder.prototype.isEmpty = function() {
   return this.offset == 0;
};

ByteBuilder.prototype.toArrayBuffer = function() {
   return this.buffers.slice(0, this.offset);
};

/* harmony default export */ __webpack_exports__["a"] = (ByteBuilder);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


function ADBUtils() {

};

ADBUtils.withShell = function (cmd) {
  return ADBUtils.withLength("shell:" + cmd);
};

ADBUtils.withHost = function (cmd) {
  return ADBUtils.withLength("host:" + cmd);
};

ADBUtils.withTransport = function(serial) {
  return ADBUtils.withHost("transport:" + serial);
};

ADBUtils.withLength = function(cmd) {
  return cmd.length.toString(16).padStart(4, '0') + cmd;
};

/* harmony default export */ __webpack_exports__["a"] = (ADBUtils);


/***/ })
/******/ ]);