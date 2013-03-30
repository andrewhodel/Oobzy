var localUser = Titanium.App.Properties.getString("localUser");
var localPass = Titanium.App.Properties.getString("localPass");

var win = Ti.UI.currentWindow;
win.title = 'Groups';

var edit = Titanium.UI.createButton({
	title:'Edit'
});

edit.addEventListener('click', function() {
	win.setRightNavButton(cancel);
	tableview.editing = true;
});

var cancel = Titanium.UI.createButton({
	title:'Done',
	style:Titanium.UI.iPhone.SystemButtonStyle.DONE
});

cancel.addEventListener('click', function() {
	win.setRightNavButton(edit);
	tableview.editing = false;
});

win.setRightNavButton(edit);

var plus = Titanium.UI.createButton({
	title:'+'
});

plus.addEventListener('click', function() {

	var win = Titanium.UI.createWindow({
		url:'addGroup.js',
		backgroundColor:'#ffffff',
                barColor:'#333333',
	});

        Titanium.UI.currentTab.open(win,{animated:true});

	win.addEventListener('close', function() { win.close(); });

});

win.setLeftNavButton(plus);

// Create the tableView and add it to the window.
var tableview = Titanium.UI.createTableView({minRowHeight:58});

tableview.addEventListener('delete',function(e) {
	// process deletion of group

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/group.php?userName="+localUser+"&password="+localPass+"&remove=1&groupId="+e.row.groupId);

	xhr.send();

});

Ti.UI.currentWindow.add(tableview);

var actInd = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

win.add(actInd);

function getFeed(){

	actInd.show();

	tableview.data = [];

	// create table view data object
	var data = [];
	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/groups.php?userName="+localUser+"&password="+localPass);

	xhr.onload = function()
	{
		try
		{
			var r = eval('('+this.responseText+')');

			if (r.count>0) {
				for (var c=0;c<r.groups.length;c++){

					var bgcolor = (c % 2) == 0 ? '#fff' : '#eee';

					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});

					row.groupId = r.groups[c]._id;
					row.groupName = r.groups[c].groupName;

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
							image:r.groups[c].groupImg,
							left:0,
							top:0,
							height:40,
							width:40
						});
					// Add the avatar image to the view
					post_view.add(av);

					var user_label = Ti.UI.createLabel({
						text:r.groups[c].groupName,
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

					if (r.groups[c].groupDesc == undefined || r.groups[c].groupDesc == '') {
						r.groups[c].groupDesc = 'No description';
					}

        	                        var tweet_text = Ti.UI.createLabel({
        	                                text:r.groups[c].groupDesc,
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

					tableview.appendRow(row);

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

win.addEventListener('focus', function() { getFeed(); });

tableview.addEventListener('click', function(e)
{
    var win = Titanium.UI.createWindow({
		url:'group.js',
		backgroundColor:'#ffffff',
                barColor:'#333333',
	});
 
	// send selected item's title to detail page
	win.groupId = e.rowData.groupId;
	win.groupName = e.rowData.groupName;

        Titanium.UI.currentTab.open(win,{animated:true});

	win.addEventListener('close', function() { win.close(); });

});
