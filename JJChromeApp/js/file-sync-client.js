'use strict';

(exports => {

  function FileSyncClient(host, port, serial) {
    this.host = host;
    this.port = port;
    this.serial = serial;
  }

  FileSyncClient.MKID = (a, b, c, d) => {
    return a.charCodeAt(0) << 0  |
           b.charCodeAt(0) << 8  |
           c.charCodeAt(0) << 16 |
           d.charCodeAt(0) << 24 ;
  };

  FileSyncClient.ID_SEND = FileSyncClient.MKID('S', 'E', 'N', 'D');
  FileSyncClient.ID_DATA = FileSyncClient.MKID('D', 'A', 'T', 'A');
  FileSyncClient.ID_DONE = FileSyncClient.MKID('D', 'O', 'N', 'E');

  FileSyncClient.MAX_SIZE = 65536;

  FileSyncClient.prototype.pushFile = function(srcPath, dstPath, callback) {
    let client = new TCPClient(this.host, this.port);
    client.connect()
    .then(() => ADBClient.transport(client, this.serial))
    .then(() => client.send(ADBClient.withLenth("sync:")))
    .then(result => {
      if(result === 'OKAY') {
        let dstPathAndMode = dstPath + ",33206";
        let buf = new ArrayBuffer(8);
        let viw = new DataView(buf);
        viw.setUint32(0, FileSyncClient.ID_SEND, true);
        viw.setUint32(4, dstPathAndMode.length, true);
        client.sendBuffer(buf, info => {
          return client.send(dstPathAndMode);
        });
      } else throw new Error('sync: failed.');
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        Utils.getFileEntry(srcPath, fileEntry => {
          fileEntry.file(file => {
            var fr = new FileReader();
            fr.onload = function(e) {
              let sbs = (buffer, offset) => {
                if(offset >= buffer.byteLength) {
                  resolve();
                  return;
                }

                let end = offset + FileSyncClient.MAX_SIZE;
                if(end > buffer.byteLength) {
                  end = buffer.byteLength;
                }

                let buf = new ArrayBuffer(8);
                let viw = new DataView(buf);
                viw.setUint32(0, FileSyncClient.ID_DATA, true);
                viw.setUint32(4, end - offset, true);
                client.sendBuffer(buf, info => {
                  client.sendBuffer(buffer.slice(offset, end), info => {
                    sbs(buffer, offset + FileSyncClient.MAX_SIZE);
                  });
                });
              };
              sbs(e.target.result, 0);
            };
            fr.readAsArrayBuffer(file);
          });
        });
      });
    })
    .then(() => {
      let buf = new ArrayBuffer(8);
      let viw = new DataView(buf);
      viw.setUint32(0, FileSyncClient.ID_DONE, true);
      viw.setUint32(4, 0, true);
      client.sendBuffer(buf, info => {
        client.disconnect();
        callback();
      });
    })
    .catch(error => {
      console.log(error);
      client.disconnect();
    })
  };

  exports.FileSyncClient = FileSyncClient;

})(window);
