var $ = (q) => document.querySelector(q);
HTMLElement.prototype.on = HTMLElement.prototype.addEventListener;

var username;
//-------------ToastController----------------
var ToastController = {};
var container = $('.toast-container');
ToastController.toast = (msg)=>{
  var ele = document.createElement('div');
  ele.classList.add('toast');
  ele.innerText = msg.message;
  var Toast = {};
  Toast.element = ele;
  Toast.present = function(){
    container.prepend(ele);
    setTimeout(()=>{
       container.removeChild(ele);
    }, msg.duration || 2000);
  };

  return Toast;
};

// ---------- WebSocket ----------
var ws;
var createConn = () => {
  var url = 'ws://' + window.location.host + '/ws';
  ws = new WebSocket(url);
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
  // closing or closed, create a new connection
  createConn();
  return 0;
};

function send(m) {
  if(!checkConn()) {
    var toast = ToastController.toast({message: 'Connection not ready. Wait awhile and retry.'});
    toast.present();
    return;
  }
  ws.send(JSON.stringify(m));
}
// -------------Modal------------
var modal = $('.modal');
var nameEle = $('input[name="username"]');
var nameCommit = $('.name-commit');
var nameDisplay = $('.name-display');
nameEle.focus();


function join(name) {
  nameDisplay.innerText = name;
  send({type: 'join',
              payload: {username: name}}) ;
};

nameCommit.on('click', (e) => {
  username = nameEle.value.trim();
  if(!username){
    var toast = ToastController.toast({message: 'Username can not be empty!'});
    toast.present();
    return;
  }
  modal.classList.add('hidden');
  join(username);
});
// ------------------------------
var sendButton = $('#send');
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

sendButton.on('click', (e) => {

  var toName = toEle.value.trim();
  var msg = msgEle.value;
  if(toName==='') {
    var toast = ToastController.toast({message: 'receiver\'s name can not be empty!'});
    toast.present();
    return;
  }
  send({type: 'chat',
        payload: {from: username, to: toName, message: msg}});
  msgEle.value = '';
  msgEle.focus();
  addMessage({type:'me', data: msg});

});


// init...
createConn();
