let database = firebase.database().ref();
const yourVideo = document.querySelector('#yourVideo');
const friendsVideo = document.querySelector('#friendsVideo');
const yourId = Math.floor(Math.random() * 10000000000);
const servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
const pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate ? sendMessage(yourID, JSON.stringify({'ice': event.candidate})) : console.log("Sent all Ice"));
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);



function sendMessage(senderId, data) {
    const msg = database.push({sender: senderId,
                               message: data
                            });
    msg.remove();
};

function readMessage(data) {
    let msg = JSON.parse(data.val().message);
    let sender = data.val().sender;
    if(sender != yourId) {
        if(msg.ice != undefined) {
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        } else if (msg.sdp.type == 'offer') {
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .then(() => pc.createAnswer())
            .then(answer = pc.setLocalDescription(answer))
            .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        } else if (msg.sdp.type == 'answer') {
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
};

database.on('child_added', readMessage);

function showMyFace() {
    navigator.mediaDevices.getUserMedia({audio: true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream = pc.addStream(stream));
};

function showFriendsFace() {
    pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
};
