$(document).ready(function() {
  //   global username variable is stored in URL string which is accessed by window.location.search. Slice to get just username
  var userName = window.location.search.slice(10);
  // build event listener on send button, using text from input box
  $('.sendButton').on('click', function() {
    var message = {
      'username': userName,
      'text': $('.input').val(),
      'roomname': 'default'
    };

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
  // callback function for setInterval to receive messages and then append to dom
  var chatRefresh = function() {
    $.ajax({
      // format is url + ? + parameter.
      // - reverses order of parameter "createdAt" to be the most recent messages
      url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        //clear messages before appending, or duplicate entries will appear
        $('.messages').html('');
        for(var i = 0; i < data.results.length; i++) {
          var pTag = "<p class=" + escapeHtml(data.results[i].roomname) + ">" + escapeHtml(data.results[i].username) + ': ' + escapeHtml(data.results[i].text) + ' room: ' + escapeHtml(data.results[i].roomname) + "</p>";
          // pTag.attr("class",escapeHtml(data.results[i].roomname));
          // $('.messages').on("click","p",function() {
          //   var roomID = this.attr('id');
          // })
          $('.messages').append(pTag);
        }
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });

  }
  setInterval(chatRefresh,2000);

});
