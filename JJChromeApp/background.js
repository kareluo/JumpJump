'use strict';

chrome.app.runtime.onLaunched.addListener(function(){
 chrome.app.window.create('./index.html', {
   'bounds': {
     'width': 360,
     'height': 640
    }
  });
});
