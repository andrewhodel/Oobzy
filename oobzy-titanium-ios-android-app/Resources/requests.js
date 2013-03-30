var localUser = Titanium.App.Properties.getString("localUser");
var localPass = Titanium.App.Properties.getString("localPass");

var win = Ti.UI.currentWindow;

var actInd = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

win.add(actInd);

var view = Titanium.UI.createView({
	backgroundColor: "#FFFEEE",
	top:0
});

var friendRequests = Ti.UI.createTableView({
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	headerTitle: 'Friend Requests',
	top: 0,
	height: 180
});

var groupRequests = Ti.UI.createTableView({
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	headerTitle: 'Group Requests',
	top: 180
});

function getFeed() {

	actInd.show();

	var data = [];

	friendRequests.data = [];
	groupRequests.data = [];

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/requests.php?userName="+localUser+"&password="+localPass);

	xhr.onload = function()
	{
		try
		{
			var r = eval('('+this.responseText+')');
			if (r.friendRequestsCount+r.groupRequestsCount>0) {
				Ti.UI.currentTab.setBadge(r.friendRequestsCount+r.groupRequestsCount);
			} else {
				Ti.UI.currentTab.setBadge(null);
			}

			// show friend requests
			if (r.friendRequestsCount>0) {

				for (var c=0;c<r.friendRequests.length;c++){

					var bgcolor = (c % 2) == 0 ? '#fff' : '#eee';
					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});
					row.userId = r.friendRequests[c]._id;
					row.userName = r.friendRequests[c].userName;

					if (r.friendRequests[c].userBio == undefined || r.friendRequests[c].userBio == '') {
						r.friendRequests[c].userBio = 'No bio!';
					}

					// Create a vertical layout view to hold all the info labels and images for each tweet
					var post_view = Ti.UI.createView({
						height:'auto',
						layout:'vertical',
						left:5,
						top:5,
						bottom:5,
						right:5
					});

					if (r.friendRequests[c].isOnline == 1) {
						var oImg = 'greenIcon.png';
					} else {
						var oImg = 'grayIcon.png';
					}

					var onlineStatusImg = Ti.UI.createImageView({
						image: oImg,
						right: 15,
						top: 23,
						width: 9,
						height: 9
					});

					row.add(onlineStatusImg);

					var av = Ti.UI.createImageView({
							image:r.friendRequests[c].userImg,
							left:0,
							top:0,
							height:40,
							width:40
					});
					// Add the avatar image to the view
					post_view.add(av);

					var user_label = Ti.UI.createLabel({
						text:r.friendRequests[c].userName,
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

					if (r.friendRequests[c].userBio.length > 50) {
						r.friendRequests[c].userBio = r.friendRequests[c].userBio.substring(0,49)+'...';
					}

	                                var tweet_text = Ti.UI.createLabel({
	                                        text:r.friendRequests[c].userBio,
	                                        left:54,
	                                        top:0,
	                                        bottom:2,
	                                        height:'auto',
	                                        width:220,
	                                        textAlign:'left',
	                                        font:{fontSize:14}
	                                });
	                                // Add the tweet to the view
	                                post_view.add(tweet_text);

					// Add the vertical layout view to the row
					row.add(post_view);
					row.className = 'item'+c;

					friendRequests.appendRow(row);

				}

			}
			// show group requests
			if (r.groupRequestsCount>0) {

				for (var c=0;c<r.groupRequests.length;c++){

					var bgcolor = (c % 2) == 0 ? '#fff' : '#eee';

					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});

					row.groupId = r.groupRequests[c]._id;
					row.groupName = r.groupRequests[c].groupName;

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
							image:r.groupRequests[c].groupImg,
							left:0,
							top:0,
							height:40,
							width:40
						});
					// Add the avatar image to the view
					post_view.add(av);

					var user_label = Ti.UI.createLabel({
						text:r.groupRequests[c].groupName,
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

					if (r.groupRequests[c].groupDesc == undefined || r.groupRequests[c].groupDesc == '') {
						r.groupRequests[c].groupDesc = 'No description';
					}

        	                        var tweet_text = Ti.UI.createLabel({
        	                                text:r.groupRequests[c].groupDesc,
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

					// Add the vertical layout view to the row
					row.add(post_view);
					row.className = 'item'+c;

					groupRequests.appendRow(row);

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

friendRequests.addEventListener('click', function(e) {

	function a() {
		var xhr = Ti.Network.createHTTPClient();
		xhr.timeout = 1000000;
		xhr.open("GET","http://oobzy.com/api/requests.php?userName="+localUser+"&password="+localPass+"&acceptFriendRequest="+e.rowData.userId);
		xhr.send();

		xhr.onload = function() {
			getFeed();
		}

	}

	var dlg = Titanium.UI.createAlertDialog({
		message:'Accept '+e.rowData.userName+'\'s invite?', 
		buttonNames: ['Yes','No']
	});

	dlg.addEventListener('click', function(ev) {
		if (ev.index == 0) { // clicked "Yes"
			a(); 
		}
	});

	dlg.show();

});

groupRequests.addEventListener('click', function(e) {

	function a() {
		var xhr = Ti.Network.createHTTPClient();
		xhr.timeout = 1000000;
		xhr.open("GET","http://oobzy.com/api/requests.php?userName="+localUser+"&password="+localPass+"&acceptGroupRequest="+e.rowData.groupId);
		xhr.send();

		xhr.onload = function() {
			getFeed();
		}

	}

	var dlg = Titanium.UI.createAlertDialog({
		message:'Accept '+e.rowData.groupName+'\'s invite?', 
		buttonNames: ['Yes','No']
	});

	dlg.addEventListener('click', function(ev) {
		if (ev.index == 0) { // clicked "Yes"
			a(); 
		}
	});

	dlg.show();

});

view.add(friendRequests);
view.add(groupRequests);
win.add(view);

win.addEventListener('focus', function() { getFeed(); });
