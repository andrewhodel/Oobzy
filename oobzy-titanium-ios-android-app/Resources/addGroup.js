var localUser = Titanium.App.Properties.getString("localUser", "");
var localPass = Titanium.App.Properties.getString("localPass", "");

var win = Titanium.UI.currentWindow;

var groupname = Titanium.UI.createTextField({
	color:'#336699',
	top:70,
	left:10,
	width:300,
	height:40,
	autocorrect: false,
	hintText:'Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(groupname);

var groupdesc = Titanium.UI.createTextField({
	color:'#336699',
	top:120,
	left:10,
	width:300,
	height:40,
	autocorrect: false,
	hintText:'Description',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(groupdesc);

var pubBtn = Titanium.UI.createButton({
	title:'Public',
	top:170,
	width:150,
	height:35,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(pubBtn);

var groupIsPublic = 1;

pubBtn.addEventListener('click',function(e) {

	if (groupIsPublic == 1) {
		groupIsPublic = 0;
		pubBtn.title = 'Private';
	} else {
		groupIsPublic = 1;
		pubBtn.title = 'Public';
	}

});

var addBtn = Titanium.UI.createButton({
	title:'Create Group',
	top:220,
	width:250,
	height:35,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(addBtn);

var oobzyTitle = Titanium.UI.createLabel({
        text:'Create New Group',
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

addBtn.addEventListener('click',function(e) {

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/group.php?userName="+localUser+"&password="+localPass+"&add=1&groupName="+groupname.value+"&groupDesc="+groupdesc.value+"&groupIsPublic="+groupIsPublic);

	xhr.onload = function() {

		try
		{
			var r = eval('('+this.responseText+')');
			if (r.success == 1) {
				alert('group created');
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
