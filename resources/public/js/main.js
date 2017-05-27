var $ = (q) => document.querySelector(q);
HTMLElement.prototype.on = HTMLElement.prototype.addEventListener;

var username;
var modal = $('.modal');
var nameEle = $('.username');
var nameCommit = $('.name-commit');
var nameDisplay = $('.name-display');
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
  var schema = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  var url = schema + window.location.host + '/ws';
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log('client: ws connected.');
  };
  ws.onmessage = (e) => {
    var json = JSON.parse(e.data);
    if(json.type === 'join'){
      if(json.data.message === 'ok'){
        modal.classList.add('hidden');
        nameDisplay.innerText = username;
        toEle.focus();
      }else {
        var toast = ToastController.toast({message: json.data.message});
        toast.present();

      }
      return;
    }
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

nameEle.focus();


function join(name) {

  send({type: 'join',
              payload: {username: name}}) ;
};

var toEle = $('input[name="to"]');
var msgEle = $('input[name="message"]');

nameCommit.on('click', (e) => {
  username = nameEle.value.trim();
  if(!username){
    var toast = ToastController.toast({message: 'Username can not be empty!'});
    toast.present();
    return;
  }

  join(username);

});

// ------------------------------
toEle.on('keydown', (e) => {
  if(e.key === 'Enter') {
    msgEle.focus();
  }
});

var sendButton = $('#send');
var msgContainer = $('.messages');

function addMessage(json) {
  var ele = document.createElement('div');
  var c = '';
  console.log(json);
  switch(json.type){
  case 'error':
    c = '<b>' + json.type +'</b>: ' +json.payload.message;
    break;
  case 'chat':  // from other
    c =  '<div class="chat chat-other"><div class="chat-item">'+
      '<div class="chat-title">'+ json.payload.from+
      '</div><div class="bubble bubble-other">' + json.payload.message+
    '</div></div></div>';

    break;
  case 'server':
    c =  '<b>' + json.type +'</b>: ' +json.payload.message;
    break;
  case 'me':
        c =  '<div class="chat chat-self"><div class="chat-item">'+
      '<div class="chat-title">'+ 'Me'+
      '</div><div class="bubble bubble-self">' + json.payload.message+
    '</div></div></div>';

    break;
  default:
    c='unknown data format.';
    break;
  }

  ele.innerHTML = c;
  msgContainer.appendChild(ele);
  var bottom = msgContainer.scrollHeight-msgContainer.scrollTop;
  if(bottom !== msgContainer.clientHeight) {
    msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight;
  }
}

function submit(){
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
  addMessage({type:'me', payload: {message: msg}});
}

msgEle.on('keydown', (e) => {
  if(e.metaKey && e.key==='Enter') {
    submit();
  }
});

sendButton.on('click', (e) => {
  submit();
});


// init...
createConn();
