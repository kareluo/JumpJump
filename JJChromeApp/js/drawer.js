'use strict';

(exports => {

  const EVENT_ON_OPEN = 1;
  const EVENT_ON_MESSAGE = 2;
  const EVENT_ON_CLOSE = 3;
  const EVENT_ON_ERROR = 4;

  function Drawer(callback) {
    this.uri = null;
    this.client = null;
    this.callback = callback;
    this.player = new Player({
      useWorker: true,
      webgl: "auto",
    });
    this.player.canvas.className = 'player';
  };

  Drawer.prototype.connect = function(uri) {
    console.log(uri);
    this.uri = uri;
    this.client = new WebSocket(this.uri);
    this.client.binaryType = "arraybuffer";
    this.client.onopen = this._onOpen.bind(this);
    this.client.onmessage = this._onMessage.bind(this);
    this.client.onclose = this._onClose.bind(this);
    this.client.onerror = this._onError.bind(this);
  }

  Drawer.prototype._onOpen = function(event) {
    console.log("_onOpen" + event);
    if(this.callback) {
      this.callback(EVENT_ON_OPEN, event);
    }
  };

  Drawer.prototype._onMessage = function(event) {
    this.player.decode(event.data);
  };

  Drawer.prototype._onClose = function(event) {
    console.log("_onClose:");
    console.log(event);
    if(this.callback) {
      this.callback(EVENT_ON_CLOSE, event);
    }
  };

  Drawer.prototype._onError = function(event) {
    console.log("_onError:");
    console.log(event);
    if(this.callback) {
      this.callback(EVENT_ON_ERROR, event);
    }
  };

  Drawer.EVENT_ON_OPEN = EVENT_ON_OPEN;
  Drawer.EVENT_ON_MESSAGE = EVENT_ON_MESSAGE;
  Drawer.EVENT_ON_CLOSE = EVENT_ON_CLOSE;
  Drawer.EVENT_ON_ERROR = EVENT_ON_ERROR;

  exports.Drawer = Drawer;

})(window);
