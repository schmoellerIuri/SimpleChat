class Settings {
    static URL = "https://api-simplechat.azurewebsites.net/";
}

let conversations = null;
let conversationsList = null;
let currentSelectedConversationId = null;

const token = sessionStorage.getItem("token");

if (token === null) {
    window.location.href = "index.html";
}

const userId = new URLSearchParams(window.location.search).get('id');

const socket = new WebSocket(`wss://api-simplechat.azurewebsites.net/ws?userId=${userId}`);

socket.onmessage = function (event) {
    const mensagemRecebida = event.data;

    if (mensagemRecebida === "ping")
        return;

    const divMensagens = document.querySelector(".mensagens-container");

    if (mensagemRecebida === currentSelectedConversationId && divMensagens !== null) {
        updateHtmlMensagens(currentSelectedConversationId, divMensagens);
    }
    else if (!isNaN(mensagemRecebida)) {
        window.location.href = "conversations.html?id=" + userId.toString();
    }
};

const urlUsr = Settings.URL + 'api/Usuario/' + userId.toString();

axios.get(urlUsr, {
    headers: {
        'Authorization': 'Bearer ' + token.toString()
    }
}).then((response) => {
    const user = response.data;
    const username = document.querySelector(".usuario-header");
    username.innerHTML = "<p> Bem vindo " + user.username + " !</p>" + "<div class = 'sair'><img src = 'images/logout.png' style = width = 80%; height = 80%;></div>";
    username.querySelector(".sair").addEventListener("click", function (event) {
        socket.close();
        window.location.href = "index.html";
    });
}).catch((error) => {
    if (error.response.status == 401) {
        window.location.href = "index.html";
    }
    else {
        alert("Erro ao carregar usuário, tente novamente mais tarde.");
        window.location.href = "index.html";
    }
});

axios.get(Settings.URL + "api/Conversa/" + userId.toString(),{
    headers: {
        'Authorization': 'Bearer ' + token.toString()
    }
}).then((response) => {
    conversations = response.data;
    carregaConversas();
}).catch((error) => {
    if (error.response.status == 401) {
        window.location.href = "index.html";
    }
    else {
        alert("Erro ao carregar conversas, tente novamente mais tarde.");
        window.location.href = "index.html";
    }
});

function conversasListClick(event) {
    if (isNaN(event.target.id))
        return;

    if (currentSelectedConversationId !== null) {
        let conversaAntiga = document.getElementById(currentSelectedConversationId);
        conversaAntiga.style = "";
    }

    currentSelectedConversationId = event.target.id;

    const divConversa = document.getElementById(currentSelectedConversationId);
    divConversa.style.backgroundColor = '#282a36';

    const divMensagens = document.querySelector(".mensagens");

    buildHtmlMensagens(currentSelectedConversationId, divMensagens);
}

const conversaInput = document.getElementById("conversaInput");

conversaInput.onkeyup = function (event) {
    event.preventDefault();
    conversationsList = conversations.filter(function (conversa) {
        let nomeUsuario = (conversa.user1.id == userId) ? conversa.user2.username : conversa.user1.username;
        return nomeUsuario.toLowerCase().includes(event.target.value.toLowerCase());
    });
    atualizarListaConversas();
};

function carregaConversas() {
    const conversationsListHtml = document.querySelector(".conversas ul");

    conversations.forEach(function (conversa) {

        const promise = fetchUser(conversa.idUser1);

        promise.then(function (response) {
            conversa.user1 = response;
            const newPromise = fetchUser(conversa.idUser2);
            newPromise.then(function (newResponse) {
                conversa.user2 = newResponse;
                nomeUsuario = (conversa.user1.id == userId) ? conversa.user2.username : conversa.user1.username;
                adicionarConversa(conversa.id, nomeUsuario, conversationsListHtml);
            });
        });
    });
}

async function fetchUser(id) {
    const response = await axios.get(Settings.URL + "api/Usuario/" + id, {
        headers: {
            'Authorization': 'Bearer ' + token.toString()
        }
    });
    return response.data;
}

function atualizarListaConversas() {
    const listaConversas = document.querySelector(".conversas ul");
    listaConversas.innerHTML = "";

    conversationsList.forEach(function (conversa) {
        let nomeUsuario = (conversa.user1.id == userId) ? conversa.user2.username : conversa.user1.username;
        adicionarConversa(conversa.id, nomeUsuario, listaConversas);
    });
}

function adicionarConversa(id, nomeUsuario, conversationsListHtml) {
    const listItem = document.createElement("li");
    listItem.id = id;
    listItem.textContent = nomeUsuario;
    conversationsListHtml.appendChild(listItem);
}

async function getMensagens(idConversa) {
    return axios.get(Settings.URL + "api/Mensagem/" + idConversa.toString(), {
        headers: {
            'Authorization': 'Bearer ' + token.toString()
        }
    });
}

async function buildHtmlMensagens(idConversa, div) {

    let listaMensagens = [];

    div.innerHTML = "";

    div.style.justifyContent = 'flex-end';

    div.style.flexDirection = 'column';

    div.style.alignItems = 'start';

    const usrName = document.getElementById(idConversa.toString()).innerHTML;

    listaMensagens.push("<div class = 'mensagens-header'>" + usrName + "</div>");

    listaMensagens = listaMensagens.concat(await updateHtmlMensagens(idConversa, null));

    buildHtmlInputBox(div, listaMensagens);
}

async function updateHtmlMensagens(idConversa, div) {
    const response = await getMensagens(idConversa);
    let mensagens = response.data;

    let listaMensagens = [];

    listaMensagens.push("<div class = 'mensagens-container'>");

    mensagens.reverse();

    mensagens.forEach(function (mensagem) {

        if (mensagem.remetenteId == userId) {
            listaMensagens.push("<div class = 'message' style = 'justify-content: end;'>");
            listaMensagens.push("<div class = 'sent-message'>" + mensagem.conteudo + "</div>");
        }
        else {
            listaMensagens.push("<div class = 'message' style = 'justify-content: start;'>");
            listaMensagens.push("<div class = 'received-message' style = 'justify-content: end;'>" + mensagem.conteudo + "</div>");
        }

        listaMensagens.push("</div>");
    });

    listaMensagens.push("</div>");

    if (div !== null) {
        listaMensagens.shift();
        listaMensagens.pop();
        div.innerHTML = listaMensagens.join("");
    }
    else
        return listaMensagens;
}

function buildHtmlInputBox(div, listaMensagens) {
    listaMensagens.push("<div class = 'input-box'><input type='text' id='messageInput' placeholder='Digite sua mensagem...'><button id='sendButton'><img src = 'images/enviar.png'></button></div>");
    div.innerHTML = listaMensagens.join("");

    const inputText = document.getElementById("messageInput");

    document.getElementById("sendButton").onclick = sendButtonClick;

    inputText.onkeydown = messageInputKeyDown;
}

function sendButtonClick(event) {
    const inputText = document.getElementById("messageInput");
    if (inputText.value != "") {
        event.preventDefault();
        SendMessage(inputText);
    }
}

function messageInputKeyDown(event) {
    if (event.key == 'Enter' && this.value != "") {
        event.preventDefault();
        SendMessage(this);
    }
}

function adicionarConversaClick() {
    var modal = document.getElementById('dialog-box');
    document.getElementById("overlay").style.display = 'flex';
    modal.style.display = 'flex';
};

function SendMessage(inputText) {
    axios.post(Settings.URL + "api/Mensagem", {
        conversaId: currentSelectedConversationId,
        remetenteId: userId,
        conteudo: inputText.value
    }, {
        headers: {
            'Authorization': 'Bearer ' + token.toString()
        }
    }).then(() => {
        inputText.value = "";
    }).catch(function (error) {
        if (error.response.status == 401)
            window.location.href = "index.html";
    });
}