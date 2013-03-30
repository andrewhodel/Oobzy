var localUser = Titanium.App.Properties.getString("localUser");
var localPass = Titanium.App.Properties.getString("localPass");
var isPlaying = 0;

// creates a 'pretty date' from a unix time stamp
function prettyDate(time){
	var monthname = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	var date = new Date(time*1000),
	diff = (((new Date()).getTime() - date.getTime()) / 1000),
	day_diff = Math.floor(diff / 86400);
	if ( isNaN(day_diff) || day_diff < 0 ){
		return '';
	}
	if(day_diff >= 31){
		var date_year = date.getFullYear();
		var month_name = monthname[date.getMonth()];
		var date_month = date.getMonth() + 1;
		if(date_month < 10){
			date_month = "0"+date_month;
		}
		var date_monthday = date.getDate();
		if(date_monthday < 10){
			date_monthday = "0"+date_monthday;
		}
		return date_monthday + " " + month_name + " " + date_year;
	}
	return day_diff == 0 && (
		diff < 60 && "just now" ||
		diff < 120 && "1 minute ago" ||
		diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
		diff < 7200 && "1 hour ago" ||
		diff < 86400 && "about " + Math.floor( diff / 3600 ) + " hours ago") ||
	day_diff == 1 && "Yesterday" ||
	day_diff < 7 && day_diff + " days ago" ||
	day_diff < 31 && Math.ceil( day_diff / 7 ) + " week" + ((Math.ceil( day_diff / 7 )) == 1 ? "" : "s") + " ago";
}

var lastMsgId = 0;
var isFirst = 1;

var postMessage = Titanium.UI.createTextField({
	color:'#336699',
	top:10,
	left:10,
	width:300,
	height:40,
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

var win = Ti.UI.currentWindow;

var plus = Titanium.UI.createButton({
	title:'+'
});

plus.addEventListener('click', function() {

	var iwin = Titanium.UI.createWindow({
		url:'groupInvite.js',
		backgroundColor:'#ffffff',
		barColor:'#333333',
	});

	iwin.groupId = win.groupId;
	iwin.groupName = win.groupName;

	Titanium.UI.currentTab.open(iwin,{animated:true});
	iwin.addEventListener('close', function() { iwin.close(); });

});

if (win.groupId.length>15) {
	win.setRightNavButton(plus);
}



// Create the tableView and add it to the window.
var tableview = Titanium.UI.createTableView({
	minRowHeight:58,
	top: 95
});

var micBtn = Titanium.UI.createButton({
	backgroundImage:'mic.png',
	top:63,
	left: 95,
	width: 12,
	height:24,
});

var locBtn = Titanium.UI.createButton({
	backgroundImage:'location.png',
	top:65,
	left: 55,
	width: 20,
	height:20,
});

var picBtn = Titanium.UI.createButton({
	backgroundImage:'camera.png',
	top:65,
	left: 10,
	width: 24,
	height:18,
});

var notifyString = Titanium.UI.createLabel({
	text:'Group Notifications',
	top:52,
	left: 130,
	color:'#000',
	height:'auto',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:10
	},
	textAlign:'left'
});

var shouldNotify = Titanium.UI.createSwitch({
	top: 67,
	left: 130
});

shouldNotify.addEventListener('change',function(e) {

	// set notification status

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	if (e.value == true) {
		var send = 1;
	} else {
		var send = 0;
	}
	xhr.open("GET","http://oobzy.com/api/group.php?userName="+localUser+"&password="+localPass+"&groupId="+groupId+"&doNotify="+send);
	xhr.send({ });

});

picBtn.addEventListener('click',function(e) {

	Titanium.Media.showCamera({
 
		success:function(event) {

			var image = event.media;

			var xhr = Ti.Network.createHTTPClient();

			xhr.timeout = 1000000;
			xhr.open("POST","http://oobzy.com/api/upload.php?userName="+localUser+"&password="+localPass+"&groupId="+groupId);
			xhr.send({
				media:image,
			});
 
 
		},cancel:function() {
		},error:function(error) {

			var a = Titanium.UI.createAlertDialog({title:'Camera'});

			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Sorry, your device does not have a camera.');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
 
			// show alert
			a.show();
		},
		saveToPhotoGallery:true,
		allowEditing:true,
		mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
	});

});

micBtn.addEventListener('click',function(e) {

	var win = Titanium.UI.createWindow({
                url:'record.js',
                backgroundColor:'#ffffff',
                barColor:'#333333',
        });

        // send selected item's title to detail page
        win.groupId = groupId;
        win.groupName = groupName;

        Titanium.UI.currentTab.open(win,{animated:true});

        win.addEventListener('close', function() { win.close(); });

});

locBtn.addEventListener('click',function(e) {

	actInd.show();

	Titanium.Geolocation.purpose = 'Send Location';
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 4;

	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			alert('Your device has no location');
			return;
		}

		var latitude = e.coords.latitude; 
		var longitude = e.coords.longitude;

		var xhr = Ti.Network.createHTTPClient();

		xhr.timeout = 1000000;
		xhr.open("GET","http://oobzy.com/api/post.php?userName="+localUser+"&password="+localPass+"&groupId="+groupId+"&msgContent="+postMessage.value+"&msgType=3&msgUrl="+latitude+","+longitude);
		xhr.send();
		postMessage.value = '';
		postMessage.blur();
		actInd.hide();
	});

});

var postBtn = Titanium.UI.createButton({
	title:'Send',
	top:60,
	right: 10,
	width:70,
	height:35,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});


postMessage.addEventListener('return',function(e) {

	doPost();

});

postBtn.addEventListener('click',function(e) {

	doPost();

});

function doPost() {

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/post.php?userName="+localUser+"&password="+localPass+"&groupId="+groupId+"&msgContent="+postMessage.value);
	xhr.send();
	postMessage.value = '';
	postMessage.blur();

}

var actInd = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

Ti.UI.currentWindow.add(postMessage);
Ti.UI.currentWindow.add(tableview);
Ti.UI.currentWindow.add(postBtn);
Ti.UI.currentWindow.add(locBtn);
Ti.UI.currentWindow.add(micBtn);
Ti.UI.currentWindow.add(picBtn);
Ti.UI.currentWindow.add(actInd);

// get group vars
var groupId = Ti.UI.currentWindow.groupId;
var groupName = Ti.UI.currentWindow.groupName;

Ti.UI.currentWindow.title = groupName;

function getFeed(){

	if (isFirst == 1) {
		actInd.show();
	}

	// create table view data object
	var data = [];

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/feed.php?userName="+localUser+"&password="+localPass+"&groupId="+groupId+"&lastMsgId="+lastMsgId);

	xhr.onload = function()
	{
		try
		{
			var r = eval('('+this.responseText+')');

			if (isFirst == 1) {
				// if this isn't a direct message, show notify setting
				if (groupId.length>15 && (r.notify == 1 || r.notify == 0)) {
					shouldNotify.value = r.notify;
					Ti.UI.currentWindow.add(shouldNotify);
					Ti.UI.currentWindow.add(notifyString);
				}
			}

			if (r.count>0) {

			if (lastMsgId != 0 && isFirst != 1) {
				r.msgs = r.msgs.reverse();
			}

			for (var c=0;c<r.msgs.length;c++){

				var msgContent = r.msgs[c].msgContent;
				var user = r.msgs[c].userName;
				var avatar = r.msgs[c].userImg;
				var created_at = prettyDate(r.msgs[c].msgTime);

				if (r.msgs[c].msgType == 3 || r.msgs[c].msgType == 2 || r.msgs[c].msgType == 4) {
					var hasChildVal = true;
				} else {
					var hasChildVal = false;
				}

				if (r.msgs[c].msgType == 4) {
					msgContent = 'Click to play audio message';
				}

				var row = Ti.UI.createTableViewRow({hasChild:hasChildVal,height:'auto'});

				row.msgType = r.msgs[c].msgType;
				row.msgUrl = r.msgs[c].msgUrl;
				row.msgSender = r.msgs[c].userName;

				// Create a vertical layout view to hold all the info labels and images for each tweet
				var post_view = Ti.UI.createView({
					height:'auto',
					layout:'vertical',
					left:5,
					top:5,
					bottom:5,
					right:5
				});

				var av = Ti.UI.createImageView({
						image:avatar,
						left:0,
						top:0,
						height:40,
						width:40
					});
				// Add the avatar image to the view
				post_view.add(av);

				var user_label = Ti.UI.createLabel({
					text:user,
					left:54,
					width:120,
					top:-40,
					bottom:2,
					height:16,
					textAlign:'left',
					color:'#444444',
					font:{fontFamily:'Trebuchet MS',fontSize:14,fontWeight:'bold'}
				});
				// Add the username to the view
				post_view.add(user_label);

				var date_label = Ti.UI.createLabel({
					text:created_at,
					right:0,
					top:-18,
					bottom:2,
					height:14,
					textAlign:'right',
					width:110,
					color:'#444444',
					font:{fontFamily:'Trebuchet MS',fontSize:12}
				});
				// Add the date to the view
				post_view.add(date_label);

				var tweet_text = Ti.UI.createLabel({
					text:msgContent,
					left:54,
					top:0,
					bottom:2,
					height:'auto',
					width:236,
					textAlign:'left',
					font:{fontSize:14}
				});
				// Add the tweet to the view
				post_view.add(tweet_text);

				if (r.msgs[c].msgType == 2) {
					var newImg = Ti.UI.createImageView({
						image:r.msgs[c].msgUrl,
						left:54,
						top:10,
						height:200,
						width: 200
					});

					post_view.add(newImg);
				}

				// Add the vertical layout view to the row
				row.add(post_view);
				row.className = 'item'+c;

				if (lastMsgId != 0 && isFirst != 1) {
					tableview.insertRowBefore(0,row);
				} else {
					tableview.appendRow(row);
				}

				if (isFirst == 1) {
					if (c==0) {
						lastMsgId = r.msgs[c]._id;
					}
				} else {
					if (c==r.msgs.length-1) {
						lastMsgId = r.msgs[c]._id;
					}
				}

			}

		}

		}
		catch(E){
			alert(E);
		}

		isFirst = 0;
		actInd.hide();

	};
	// Get the data
	xhr.send();
}

getFeed();

setInterval(getFeed, 5000);

tableview.addEventListener('click', function(e)
{

	if (e.rowData.hasChild == true && isPlaying == 0) {

		if (e.rowData.msgType == 4) {
			// play audio
			Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;

			actInd.show();
			isPlaying = 1;
			var sound = Titanium.Media.createSound({url:e.rowData.msgUrl,preload:true});
			sound.play();

			sound.addEventListener('complete', function(e) {
				actInd.hide();
				isPlaying = 0;
			});

			sound.addEventListener('error', function(e) {
				actInd.hide();
				isPlaying = 0;
			});

		} else {
			// open focus.js
			var win = Titanium.UI.createWindow({
	        	        url:'focus.js',
	        	        backgroundColor:'#ffffff',
	        	        barColor:'#333333',
	        	});

	        	// send selected item's title to detail page
	        	win.msgType = e.rowData.msgType;
	        	win.msgUrl = e.rowData.msgUrl;
			win.msgSender = e.rowData.msgSender;

	        	Titanium.UI.currentTab.open(win,{animated:true});

	        	win.addEventListener('close', function() { win.close(); });

		}

	} else if (isPlaying == 1) {
		alert('currently playing another audio message');
	}

});

