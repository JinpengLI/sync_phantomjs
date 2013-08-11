var system = require('system');
var fs = require('fs');

// maybe need run several times
var page_url = "https://github.com/login";
var github_login = "your github login";
var github_pw = "your github password";

// see png files in /tmp/*.png

//parameters
/*/
if (system.args.length < 2)
{
    console.log("Parameter error.");
    phantom.exit();
}
page_url = system.args[1];
//*/

var page = new WebPage(), testindex = 0, loadInProgress = false;
var next_page_timer_max = 1000;
var next_page_timer = next_page_timer_max;
page.onConsoleMessage = function(msg) {
  console.log(msg);
};
page.onLoadStarted = function() {
  loadInProgress = true;
  console.log("load started");
  var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
  console.log('Current page ' + currentUrl +' will gone...');
  console.log('Now loading a new page...');
};
page.onLoadFinished = function() {
  // loadInProgress = false;
  console.log("load finished");
  var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
  console.log('Current page ' + currentUrl +' is loaded...');
};
page.onResourceReceived = function(response) {
	//console.log("onResourceReceived");
	next_page_timer = next_page_timer_max;
   //console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
};


var steps = [
  //0. load main page
  function(){
    //Load Login Page
    page.open(page_url);
    var set_ret = {};
    set_ret['wait'] = true;
    set_ret['next'] = 1;
    return set_ret;
  },
  //1. click to verify the login and password
  function() {
    page.evaluate(function(strlogin, strpw) {
    	var ev = document.createEvent("MouseEvent");
		ev.initMouseEvent(
			"click",
			true, true,
			window, null,
			0, 0, 0, 0,
			false, false, false, false,
			0, null);
		console.log(strlogin);
		console.log(strpw);
		login = document.getElementById("login_field");
		login.setAttribute('value', strlogin);
		pw = document.getElementById("password");
		pw.setAttribute('value', strpw);
		commits = document.getElementsByName("commit");
		commits[0].dispatchEvent(ev);
    }, github_login, github_pw);
    var set_ret = {};
    set_ret['wait'] = true;
    set_ret['next'] = 1;
    return set_ret;
  }
];

interval = setInterval(function() {
  //console.log(next_page_timer);
  next_page_timer = next_page_timer - 1;
  if (next_page_timer<0){//wait for too long to load
  	loadInProgress = false;
  }
  if (!loadInProgress && typeof steps[testindex] == "function") {
    console.log("============step " + (testindex) + "===========");
    var set_ret = {};
    set_ret = steps[testindex]();
    testindex = testindex + set_ret['next'];
    loadInProgress = set_ret['wait'];
    console.log(loadInProgress);
    next_page_timer = next_page_timer_max;
    var pic_name = '/tmp/step'+testindex+'_'+Math.random()+'.png';
    page.render(pic_name);
    //fs.remove(pic_name);
  }
  if (!loadInProgress && typeof steps[testindex] != "function") {
    console.log("test complete!");
    var pic_name = '/tmp/step'+'_'+Math.random()+ '.png';
    page.render(pic_name );
    //fs.remove(pic_name);
    phantom.exit();
  }
}, 5);
