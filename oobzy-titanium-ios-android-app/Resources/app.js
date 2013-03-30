// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');

var localUser = Titanium.App.Properties.getString("localUser", "");
var localPass = Titanium.App.Properties.getString("localPass", "");

function validUser() {

	// create tab group
	var tabGroup = Titanium.UI.createTabGroup();

	var win1 = Titanium.UI.createWindow({  
	    title:'Feed',
	    backgroundColor:'#fff',
	    url:'feed.js'
	});
	var tab1 = Titanium.UI.createTab({  
	    icon:'feed.png',
	    title:'Feed',
	    window:win1
	});

	var win2 = Titanium.UI.createWindow({  
	    title:'Groups',
	    backgroundColor:'#fff',
	    url:'groups.js'
	});
	var tab2 = Titanium.UI.createTab({  
	    icon:'groups.png',
	    title:'Groups',
	    window:win2
	});

	var win3 = Titanium.UI.createWindow({  
	    title:'Friends',
	    backgroundColor:'#fff',
	    url:'friends.js'
	});
	var tab3 = Titanium.UI.createTab({  
	    icon:'friends.png',
	    title:'Friends',
	    window:win3
	});

	var win4 = Titanium.UI.createWindow({  
	    title:'Requests',
	    backgroundColor:'#fff',
	    url:'requests.js'
	});
	var tab4 = Titanium.UI.createTab({  
	    icon:'requests.png',
	    title:'Requests',
	    window:win4
	});

	// add tabs
	tabGroup.addTab(tab1);  
	tabGroup.addTab(tab2);  
	tabGroup.addTab(tab3);  
	tabGroup.addTab(tab4);  

	// open tab group
	tabGroup.open();

	function successCallback(e) {
	    var request = Titanium.Network.createHTTPClient({
	        onload:function(e) {
	            if (request.status != 200 || request.status != 201) {
	                request.onerror(e);
	                return;
	            }
	        },
	        onerror:function(e) {
	            alert("Register with Push Service failed. Error: "+ e.error);
	        }
	    });
 
		var xhr = Ti.Network.createHTTPClient();
		xhr.timeout = 1000000;
		xhr.open("GET","http://oobzy.com/api/apn.php?userName="+localUser+"&password="+localPass+"&token="+e.deviceToken);
		xhr.send();

	}

	function errorCallback(e) {
	    Ti.API.info("Error during registration: " + e.error);
	}

	function messageCallback(e) {

		// we got a push notification
		// should check if it's a new message or a new request and
		// increase the badge count for either the Feed or Requests tab

		// feed
		if (e.d.type == 'msg') {
			tab1.badge = tab1.badge+1;
		}

		// requests
		if (e.d.type == 'req') {
			tab4.badge = e.d.count;
		}

	}

	// push notifications
	Titanium.Network.registerForPushNotifications({
	    types:[
	        Titanium.Network.NOTIFICATION_TYPE_BADGE,
	        Titanium.Network.NOTIFICATION_TYPE_ALERT,
	        Titanium.Network.NOTIFICATION_TYPE_SOUND
	    ],
	    success: successCallback,
	    error: errorCallback,
	    callback: messageCallback
	});

}

if (localUser != '') {

	validUser();

} else {

	// launch login window

	var win = Titanium.UI.createWindow({

	});

	var username = Titanium.UI.createTextField({
		color:'#336699',
		top:70,
		left:10,
		width:300,
		height:40,
		autocorrect: false,
		hintText:'Username',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	win.add(username);

	var password = Titanium.UI.createTextField({
		color:'#336699',
		top:120,
		left:10,
		width:300,
		height:40,
		autocorrect: false,
		hintText:'Password',
		passwordMask:true,
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	win.add(password);

	var loginBtn = Titanium.UI.createButton({
		title:'Login',
		top:180,
		width:90,
		height:35,
		borderRadius:1,
		font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
	});
	win.add(loginBtn);

	var oobzyStr = Titanium.UI.createLabel({
	        id:'oobzyStr',
	        text:'Signup at http://oobzy.com',
		top:45,
	        color:'#000',
	        width:250,
	        height:'auto',
	        font:{
	                fontFamily:'Helvetica Neue',
	                fontSize:12
	        },
	        textAlign:'center'
	});
	win.add(oobzyStr);

	var oobzyTitle = Titanium.UI.createLabel({
	        id:'oobzyTitle',
	        text:'Oobzy - Social Chat',
		top:10,
	        color:'#000',
	        width:250,
	        height:'auto',
	        font:{
	                fontFamily:'Helvetica Neue',
	                fontSize:26
	        },
	        textAlign:'center'
	});
	win.add(oobzyTitle);

loginBtn.addEventListener('click',function(e) {

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/login.php?userName="+username.value+"&password="+password.value);

	xhr.onload = function()
	{
		try
		{
			var r = eval('('+this.responseText+')');

			if (r.success == 1) {
				// valid login
				Titanium.App.Properties.setString("localUser", username.value);
				Titanium.App.Properties.setString("localPass", password.value);
				win.close();
				validUser();

			} else {
				alert('invalid login');
			}

		}

		catch(E){
			alert(E);
		}

	};
	// Get the data
	xhr.send();

});

	win.open();

}

Ti.App.addEventListener('pause', function(){
	// log user out

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/login.php?userName="+localUser+"&password="+localPass+"&logout=1");
	xhr.send({ });

});

Ti.App.addEventListener('resume', function(){
});
