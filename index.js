var stompClient = null;
var username = null;

const welcomeForm = document.getElementById('welcome-form');
const chatRoom = document.getElementById('chat-room');
const messageArea = document.getElementById('message-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const usernameInput = document.getElementById('username');

// Esconde a sala de chat por padrão ao carregar a página
chatRoom.style.display = 'none';

messageForm.addEventListener('submit', sendMessage, true);

// Função para entrar na sala de chat
function enterChatRoom() {
    username = usernameInput.value.trim();
    if (username) {
        // Esconde o formulário de login e mostra o chat
        welcomeForm.style.display = 'none';
        chatRoom.style.display = 'flex';
        connect();
    } else {
        alert("Por favor, insira um nome de usuário.");
    }
}

// Função para sair da sala de chat
function leaveChatRoom() {
    if (stompClient) {
        var chatMessage = {
            sender: username,
            type: "LEAVE"
        };
        stompClient.send("/app/leaveUser", {}, JSON.stringify(chatMessage));
        stompClient.disconnect(() => {
            console.log("Desconectado");
            // Mostra o formulário de login e esconde o chat
            welcomeForm.style.display = 'block';
            chatRoom.style.display = 'none';

            messageArea.innerHTML = '';
            stompClient = null;
            username = null;
        });
    }
}

// Função para enviar uma mensagem
function sendMessage(event) {
    event.preventDefault();
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            content: messageContent,
            type: "CHAT"
        };
        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = "";
    }
}

// Função para exibir uma mensagem na tela
function showMessage(message) {
    const messageLi = document.createElement('li');

    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        messageLi.classList.add('event-message');
        const p = document.createElement('p');
        p.textContent = message.sender + (message.type === 'JOIN' ? ' entrou no chat!' : ' saiu do chat!');
        messageLi.appendChild(p);
    }
    // Mensagens de chat dos usuários
    else {
        const isSender = message.sender === username;
        messageLi.classList.add(isSender ? 'sender-li' : 'receiver-li');

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isSender ? 'sender' : 'receiver');

        if (!isSender) {
            const senderNameDiv = document.createElement('div');
            senderNameDiv.classList.add('sender-name');
            senderNameDiv.textContent = message.sender;
            messageDiv.appendChild(senderNameDiv);
        }

        const messageContentP = document.createElement('p');
        messageContentP.textContent = message.content;
        messageDiv.appendChild(messageContentP);
        messageLi.appendChild(messageDiv);
    }

    messageArea.appendChild(messageLi);
    // Rola a tela para a mensagem mais recente
    messageArea.scrollTop = messageArea.scrollHeight;
}


// Função para conectar ao servidor WebSocket
function connect() {
    const socket = new SockJS('http://localhost:8080/chat-websocket');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("Conectado: " + frame);

        stompClient.subscribe("/topic/public", function(messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });

        // Envia a mensagem de entrada do usuário
        stompClient.send("/app/addUser", {}, JSON.stringify({ sender: username, type: 'JOIN' }));

    }, function(error) {
        console.error("Erro de conexão: " + error);
        alert("Não foi possível conectar ao servidor de chat. Verifique o console.");

        welcomeForm.style.display = 'block';
        chatRoom.style.display = 'none';
    });
}