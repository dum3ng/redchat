var $ = (q) => document.querySelector(q);

var sendButton = $('#send');
var joinButton = $('#join');
var nameEle = $('input[name="username"]');
var toEle = $('input[name="to"]');
var msgEle = $('input[name="message"]');

var msgContainer = $('.messages');

function addMessage(json) {
  var ele = document.createElement('div');
  var c = '';
  if(json.type === 'error'){
    c = c + '<b>' + json.type +'</b>: ' +json.data.message;
  }else if(json.type==='chat') {
    c = c + '<i>from <b>' + json.data.from + '</b></i>:' +
      json.data.message;
  } else {
    c = c + '<b>' + json.type +'</b>: ' +json.data;
  }
  ele.innerHTML = c;
  msgContainer.appendChild(ele);
}

var ws;
var createConn = () => {
  ws = new WebSocket('ws://localhost:8080/ws');
  ws.onopen = () => {
    console.log('client: ws connected.');
  };
  ws.onmessage = (e) => {

    var json = JSON.parse(e.data);
    console.log(json);
    addMessage(json);

  };
};

var checkConn = () => {
  if(ws.readyState === ws.CONNECTING)
    return 0;
  if(ws.readyState === ws.OPEN)
    return 1;
  // create a new connection
  createConn();
  return 0;
};

var join = () => {
  var name = nameEle.value.trim();
  ws.send(JSON.stringify({type: 'join',
                          payload: {username: name}})) ;
};

joinButton.addEventListener('click', (e) => {
  join();
});

sendButton.addEventListener('click', (e) => {
  if(!checkConn) {
    addMessage({type:'client', data: 'socket not ready..'});
    return;
  }

  var name = nameEle.value;
  var toName = toEle.value;
  var msg = msgEle.value;
  if(name.trim()==='' || toName.trim()==='') {
    console.log('username or to name could not be empty');
    return;
  }
  ws.send(JSON.stringify({type: 'chat',
                          payload: {from: name, to: toName, message: msg}}));
  addMessage({type:'me', data: msg});

});


// init...
createConn();
