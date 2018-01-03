'use strict';

const ws_uri = "ws://127.0.0.1:8089";

$(document).ready(() => {

  chrome.app.window.current().onBoundsChanged.addListener(() => onBoundsChanged());

  let arrow = {
    isTouch: false,
    begin: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 0
    }
  };

  let nBaseRatioInput = $("input[name='base_ratio']");
  let nDistanceInput = $("input[name='distance']");

  let fetchScreenshot = function(uri) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
      let src = window.URL.createObjectURL(xhr.response);
      $("#screenshot")[0].src = src;
    }
    xhr.open('GET', uri, true);
    xhr.send();
  }

  this.drawer = new Drawer((code, event) => {
    switch (code) {
      case Drawer.EVENT_ON_OPEN:
        console.log("EVENT_ON_OPEN");
        // $('.tips-container').hide();
        break;
    }
  });

  $('.screen')[0].appendChild(this.drawer.player.canvas);

  ChromeAdb.shell({
    host: "127.0.0.1",
    port: 5037,
    serial: "5LM0216114009168"
  }, "sh -c \"CLASSPATH=/data/app/me.kareluo.jjump.client-2/base.apk /system/bin/app_process64 /system/bin me.kareluo.jjump.client.JJClientKt\"")


  setTimeout(() => {
    this.drawer.connect(ws_uri);
  }, 2000);
  // ChromeAdb.shell({
  //   host: "127.0.0.1",
  //   port: 5037,
  //   serial: "5LM0216114009168"
  // }, "adb forward tcp:9000 tcp:8088")
  // adb forward tcp:8088 tcp:8088

  function freshMouse() {

    var canvas = $("#board")[0];
      var context = canvas.getContext('2d');

      context.clearRect(0, 0, canvas.width, canvas.height);

      if(arrow.isTouch) {
        // console.log(arrow);
        context.beginPath();

        context.moveTo(arrow.begin.x, arrow.begin.y);
        context.lineTo(arrow.end.x, arrow.end.y);
        // complete custom shape
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = 'blue';
        context.stroke();

      }
  }

  let uri = "http://127.0.0.1:8088/screenshot";

  $("input[name='jump']").click(() => {
    jump();

  });

  function jump() {
    let duration = nBaseRatioInput.val() * nDistanceInput.val();

    duration = Math.ceil(duration);

    console.log("duration = " + duration);

    ChromeAdb.shell({
      host: "127.0.0.1",
      port: 5037,
      serial: "5LM0216114009168",
      onResponse: response => {
        console.log(response);
      }
    }, "input swipe 200 200 200 200 " + duration);
  }

  $("input[name='refresh']").click(() => {
    fetchScreenshot(uri);
  });

  function updateDistance() {
    let dx = arrow.begin.x - arrow.end.x;
    let dy = arrow.begin.y - arrow.end.y;
    let dist = Math.sqrt(dx * dx, dy * dy);
    console.log(dist);

    $("input[name='distance']").val(dist);

    if(dy > 0) {
      jump();
    }
  }

  $("#board").mousedown(e => {
    arrow.isTouch = true;

    arrow.begin.x = e.clientX - $(".screen-win")[0].offsetLeft;
    arrow.begin.y = e.clientY - $(".screen-win")[0].offsetTop;
    freshMouse();
  });

  $("#board").mousemove(e => {
    arrow.end.x = e.clientX - $(".screen-win")[0].offsetLeft;
    arrow.end.y = e.clientY - $(".screen-win")[0].offsetTop;
    freshMouse();
  });

  $("#board").mouseup(e => {
    arrow.isTouch = false;
    arrow.end.x = e.clientX - $(".screen-win")[0].offsetLeft;
    arrow.end.y = e.clientY - $(".screen-win")[0].offsetTop;
    updateDistance();
  });

  let touch_pads = $(".touch-pad");
  if(touch_pads && touch_pads.length > 0) {
    let touch_pad = touch_pads[0];
    let screen_win = $(".screen-win");
    let w = screen_win.width(), h = screen_win.height();
    console.log("w=" + w + ",h=" + h);
    touch_pad.width = w;
    touch_pad.height = h;
  }

});
