var stompClient = null;
var username = null


function enterChatRoom() {
    username = document.getElementById("username").value;

    if (username) {
        connect();
    } else {
        alert("Por favor, insira um username");
        return;
    }

    function connect() {
        var socket = new SockJS('naovaiserlocalhost:8080/chat-websocket', {

            headers: {
                'ngrok-skip-browser-warning': 'true'
            }

        });
    }

}