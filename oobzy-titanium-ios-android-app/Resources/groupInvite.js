var localUser = Titanium.App.Properties.getString("localUser", "");
var localPass = Titanium.App.Properties.getString("localPass", "");

var win = Titanium.UI.currentWindow;

var username = Titanium.UI.createTextField({
	color:'#336699',
	top:60,
	left:10,
	width:300,
	height:40,
	autocorrect: false,
	hintText:'username',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(username);

var addBtn = Titanium.UI.createButton({
	title:'Send Group Invite',
	top:110,
	width:250,
	height:35,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(addBtn);

var oobzyTitle = Titanium.UI.createLabel({
        text:'Invite friend to '+win.groupName,
	top:10,
        color:'#000',
        width:250,
        height:'auto',
        font:{
                fontFamily:'Helvetica Neue',
                fontSize:16
        },
        textAlign:'center'
});
win.add(oobzyTitle);

addBtn.addEventListener('click',function(e) {

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/group.php?userName="+localUser+"&password="+localPass+"&invite=1&groupId="+win.groupId+"&friendName="+username.value);

	xhr.onload = function() {

		try
		{
			var r = eval('('+this.responseText+')');
			if (r.success == 1) {
				alert('group invite sent to '+username.value);
				win.close();
			} else {
				alert(r.error);
			}
		}
		catch(E){
			alert(E);
		}

	};
	// Get the data
	xhr.send();

});
