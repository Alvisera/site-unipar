var stompClient = null;
var username = null;

document.getElementById("container").style.display = "block";

    function enterChatRoom() {
        username = document.getElementById("username").value.trim();
    
        if(username){
            var welcomeForm = document.getElementById("container");
            welcomeForm.classList.add('hide');
            setTimeout(() => {
                welcomeForm.style.display = 'none';
                var chatRoom = document.getElementById('chat-room');
                chatRoom.style.display = 'block';
                setTimeout(() => { chatRoom.classList.add('show'); }, 10);
                var menuHamburguer = document.getElementById('menu-hamburguer');
                menuHamburguer.style.display = 'none';
                
            }, 550);
            connect();
        } else {
            alert("Por favor, inserir um nickname");
        }
    }

    function connect() {

        var socket = new SockJS('http://localhost:8080/chat-websocket', {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame){
            console.log('conectando...'+ frame);

            stompClient.subscribe('/topic/public', function(messageOutput) {
                showMessage(JSON.parse(messageOutput.body));
            });

            stompClient.send("/app/addUser", {}, JSON.stringify({
                sender: username,
                type :'JOIN'
            }));
        });
    }
    function showMessage(message) {
        console.log("Mensagem recebida:", message); // Verifica se a mensagem está chegando
    
        var messageElement = document.createElement('div');
        messageElement.classList.add('message');
    
        if (message.type === 'JOIN') {
            messageElement.innerText = message.sender       + " entrou na sala.";
        } else if (message.type === 'LEAVE') {
            messageElement.innerText = message.sender + " saiu da sala.";
        } else if (message.type === 'CHAT') {
            var textElement = document.createElement('span');
            textElement.innerText = message.sender + " disse: " + message.content;
            messageElement.appendChild(textElement);
        }
    
        console.log("Adicionando mensagem ao DOM.");
        document.getElementById('messages').appendChild(messageElement);
    }

    function sendMessage() {
        var messageContent = document.getElementById("messageInput").value.trim();
    
        if (messageContent && stompClient) {
            var chatMessage = {
                sender: username,
                content: messageContent,
                type: 'CHAT'
            };
            stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
            document.getElementById("messageInput").value = ''; 
        }
    }

    function leaveChat(){
        if (stompClient){
            var chatMessage = {
                sender: username,
                type: 'LEAVE'
            };
        stompClient.send("/app/leaveUser",{},JSON.stringify(chatMessage));
        stompClient.disconnect(()=>{
            console.log("Desconectado");

        
            var chatRoom = document.getElementById("chat-room");
            chatRoom.classList.remove('show');
            setTimeout(() => {
                chatRoom.style.display = "none";
                var welcomeForm = document.getElementById('container');
                welcomeForm.style.display = 'block';
                setTimeout(() => { welcomeForm.classList.remove('hide'); }, 10);
            }, 550); 
        });


        
        }
    }

    document.getElementById("messageInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage(); 
        }
    });

    document.getElementById("username").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            enterChatRoom(); 
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (document.getElementById('chat-room').style.display === 'block') {
                leaveChat();
            }
        }
    });