var localUser = Titanium.App.Properties.getString("localUser");
var localPass = Titanium.App.Properties.getString("localPass");

var pulling = false;
var reloading = false;

function formatDate()
{
	var date = new Date;
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
}

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

var win = Ti.UI.currentWindow;
win.title = 'Feed';

var lastMsgId = 0;
var isFirst = 1;

var tableHeader = Ti.UI.createView({
	backgroundColor:"#e2e7ed",
	width:320,
	height:60
});

var actInd = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30,
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

var actIndMain = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text:"Last Updated: "+formatDate(),
	left:55,
	width:200,
	bottom:15,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:12},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

var statusLabel = Ti.UI.createLabel({
	text:"Pull to reload",
	left:55,
	width:200,
	bottom:30,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

// Create the tableView and add it to the window.
var tableview = Titanium.UI.createTableView({minRowHeight:58});
tableview.headerPullView = tableHeader;

win.add(tableview);
win.add(actIndMain);

function getFeed(){

	actIndMain.show();

	// create table view data object
	var data = [];
	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://oobzy.com/api/feed.php?userName="+localUser+"&password="+localPass+"&lastMsgId="+lastMsgId);

	xhr.onload = function()
	{
		try
		{
			var r = eval('('+this.responseText+')');

			if (r.count>0) {

			if (lastMsgId != 0 && isFirst != 1) {
				r.msgs = r.msgs.reverse();
			}

			for (var c=0;c<r.msgs.length;c++){

				var msgContent = r.msgs[c].msgContent;
				var user = r.msgs[c].userName;
				var avatar = r.msgs[c].userImg;
				var created_at = prettyDate(r.msgs[c].msgTime);

				var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto'});

				row.groupId = r.msgs[c].groupId;
				row.groupName = r.msgs[c].groupName;

				if (r.msgs[c].msgType == 4) {
					msgContent = 'Audio Message';
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
					text:user+"\nIn "+r.msgs[c].groupName,
					left:54,
					width:120,
					top:-40,
					bottom:2,
					height:36,
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
					top:20,
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

		tableview.setContentInsets({top:0},{animated:true});
		actInd.hide();
		actIndMain.hide();

		Ti.UI.currentTab.setBadge(null);

		reloading = false;
		statusLabel.text = "Pull down to refresh...";
		lastUpdatedLabel.text = "Last Updated: "+formatDate();

	};
	// Get the data
	xhr.send();

}

tableview.addEventListener('scroll',function(e)
{
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !pulling)
	{
		//var t = Ti.UI.create2DMatrix();
		//t = t.rotate(-180);
		pulling = true;
		//arrow.animate({transform:t,duration:180});
		statusLabel.text = "Release to refresh...";
	}
	else if (pulling && offset > -65.0 && offset < 0)
	{
		pulling = false;
		//var t = Ti.UI.create2DMatrix();
		//arrow.animate({transform:t,duration:180});
		statusLabel.text = "Pull down to refresh...";
	}
});

tableview.addEventListener('scrollEnd',function(e)
{
	if (pulling && !reloading && e.contentOffset.y <= -65.0)
	{
		reloading = true;
		pulling = false;
		//arrow.hide();
		actInd.show();
		statusLabel.text = "Reloading...";
		tableview.setContentInsets({top:60},{animated:true});
		//arrow.transform=Ti.UI.create2DMatrix();
		getFeed();
	}
});

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

win.addEventListener('focus', function() { getFeed(); });

Ti.App.addEventListener('resume', function(){
	getFeed();
});
