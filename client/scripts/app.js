$(document).ready(function() {
  //   global username variable is stored in URL string which is accessed by window.location.search. Slice to get just username
  var userName = window.location.search.slice(10);

  var rooms = [];

  //populate the array of rooms with all unique rooms
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    // sets data parameter based on user input above
    data: {
      order: "-createdAt",
      limit: 500
    },
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      for(var i = 0; i < data.results.length; i++) {
        if(rooms.indexOf(data.results[i].roomname) === -1) {
          rooms.push(data.results[i].roomname);

        }
      }
      for(var j = 0; j < rooms.length; j++) {
        console.log(j);
        var $option = $('<option value=' + rooms[j] + '>' + rooms[j] + '</option>');
        console.log($option);
        $('select').append($option);
      }
    },
    error: function (data) {
      console.error('chatterbox: Failed to receive message');
    }
  });



  // build event listener on send button, using text from input box
  $('.sendButton').on('click', function() {
    var message = {
      'username': userName,
      'text': $('.messageInput').val(),
      'roomname': $('.roomInput').val() || 'default'
    };
    // ajax call to POST message
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  });

  //map of dangerous characters to a hex representation
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "\n": "<br>"
  };

  // escaping html for XSS attacks
  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]|[\n]/g, function (s) {
      return entityMap[s];
    });
  }

  // abstracted function to GET data based on user input for 'dataObject'
  var messageGetter = function(dataObject) {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      // sets data parameter based on user input above
      data: dataObject,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        //clear messages before appending, or duplicate entries will appear
        $('.messages').html('');
        //looping through returned data, formatting and appending each data point to the DOM
        for(var i = 0; i < data.results.length; i++) {
          //set each data point to variable datum
          var datum = data.results[i];
          //create jquery pTag with message text
          var $pTag =  $('<p> ' + escapeHtml(datum.text) + " " +'</p>');
          // set jquery username to span with class usernameSpan
          var $username = $('<span class="usernameSpan"></span>');
          // set attribute 'usersname' to '$username'
          $username.attr('usersname', escapeHtml(datum.username));
          // add username to jquery username object
          $username.text(escapeHtml(datum.username)+ ":")
          if(friendsList.indexOf(escapeHtml(datum.username)) !== -1) {
            $pTag.addClass('friends');
          }
          $username.prependTo($pTag);

          var $roomname = $('<span class="roomnameSpan"></span>');
          $roomname.attr('roomsname', escapeHtml(datum.roomname));
          $roomname.text("room: " + escapeHtml(datum.roomname))
          $roomname.appendTo($pTag);


          $('.messages').append($pTag);
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });
  }

  //set roomID to global scope for use in callback functions
  var roomID;
  var friendsList = [];
  // callback function for setInterval and other
  var chatRefresh = function() {
    var dataToPassIn = {
      order: "-createdAt"
    }
    // roomID only gets set when a user clicks on a room
    if(roomID) {
      dataToPassIn.where = {
        roomname: roomID
      }
    }
    messageGetter(dataToPassIn);
  }

  //initial call to refresh page for new chats
  var allMessageRefresh = setInterval(chatRefresh,10000);


  //right now this is breaking on rooms with a space in their name. it only selects the first word.
  $('.messages').on("click",".roomnameSpan",function() {
    console.log(this);
    //chatRefresh logic depends on roomID variable, setting roomID makes subsequent refreshes show only messages from roomID
    roomID = $(this).attr('roomsname');
    chatRefresh();
  });

  $('.messages').on("click",".usernameSpan",function() {
    console.log(this);
    //chatRefresh logic depends on roomID variable, setting roomID makes subsequent refreshes show only messages from roomID

    friendsList.push($(this).attr('usersname'));
    console.log(friendsList);
    chatRefresh();
  });

  //take user back to overall lobby
  $('.home').on('click',function() {
    roomID = false;
    chatRefresh();
  });
  chatRefresh();

});

//give user a list of rooms to choose from
//
//backbone
