$(document).ready(function() {
  //   global username variable is stored in URL string which is accessed by window.location.search. Slice to get just username
  var userName = window.location.search.slice(10);
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
        console.log(data)
        //clear messages before appending, or duplicate entries will appear
        $('.messages').html('');
        //looping through returned data, formatting and appending each data point to the DOM
        for(var i = 0; i < data.results.length; i++) {
          var pTag = "<p class=" + escapeHtml(data.results[i].roomname) + ">" + escapeHtml(data.results[i].username) + ': ' + escapeHtml(data.results[i].text) + ' room: ' + escapeHtml(data.results[i].roomname) + "</p>";
          $('.messages').append(pTag);
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });
  }

  //set roomID to global scope for use in callback functions
  var roomID;
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
  var allMessageRefresh = setInterval(chatRefresh,2000);


  //right now this is breaking on rooms with a space in their name. it only selects the first word.
  $('.messages').on("click","p",function() {
    //chatRefresh logic depends on roomID variable, setting roomID makes subsequent refreshes show only messages from roomID
    roomID = $(this).attr('class');
  });
});

//take user back to overall lobby
//give user a list of rooms to choose from
//add in new input box to let the user choose room to send message to
//
//let user "friend" other users and bold their messages
//
//backbone
