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

// Cria a conexão WebSocket

const socket = new WebSocket(`wss://api-simplechat.azurewebsites.net/ws?userId=${userId}`);

socket.onmessage = function (event) {
    const mensagemRecebida = event.data;

    if (mensagemRecebida === "ping")
        return;

    const divMensagens = document.querySelector(".mensagens-container");

    if (mensagemRecebida === currentSelectedConversationId && divMensagens !== null) {
        updateHtmlMensagens(currentSelectedConversationId, divMensagens);
    }
    else if (!isNaN(mensagemRecebida)){
        window.location.href = "conversations.html?id=" + userId.toString();
    }

};

$(document).ready(function () {
    const HttpUsr = new XMLHttpRequest();
    const urlUsr = Settings.URL + 'api/Usuario/' + userId.toString();
    HttpUsr.open("GET", urlUsr);
    HttpUsr.setRequestHeader("Authorization", "Bearer " + token.toString());

    HttpUsr.send();

    HttpUsr.onreadystatechange = (e) => {
        if (HttpUsr.status == 401) {
            window.location.href = "index.html";
        }

        const user = JSON.parse(HttpUsr.responseText);
        const username = document.querySelector(".usuario-header");
        username.innerHTML = "<p> Bem vindo " + user.username + " !</p>" + "<div class = 'sair'><img src = 'images/logout.png' style = width = 80%; height = 80%;></div>";
        username.querySelector(".sair").addEventListener("click", function (event) {
            window.location.href = "index.html";
            socket.close();
        });
    };


    $("#adicionar-conversa-button").click(function (event) {
        var modal = document.getElementById('dialog-box');
        $('overlay').fadeIn();
        modal.showModal();
    });

    $.ajax({
        url: Settings.URL + "api/Conversa/" + userId.toString(),
        type: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.toString()
        },
        success: function (response) {
            conversations = response;
            carregaConversas();
        },
        error: function (xhr) {
            if (xhr.status == 401)
                window.location.href = "index.html";
        }
    });

    $("#conversas-list").click(function (event) {
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
    });

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
        var promises = [];

        conversations.forEach(function (conversa) {
            var promise = new Promise(function (resolve, reject) {
                $.ajax({
                    url: Settings.URL + "api/Usuario/" + conversa.idUser1,
                    type: "GET",
                    contentType: "application/json",
                    headers: {
                        "Authorization": "Bearer " + token.toString()
                    },
                    success: function (response) {
                        conversa.user1 = response;
                        resolve();
                    },
                    error: function (xhr) {
                        if (xhr.status == 401)
                            window.location.href = "index.html";
                        reject();
                    }
                });
            });

            promises.push(promise);

            promise = new Promise(function (resolve, reject) {
                $.ajax({
                    url: Settings.URL + "api/Usuario/" + conversa.idUser2,
                    type: "GET",
                    contentType: "application/json",
                    headers: {
                        "Authorization": "Bearer " + token.toString()
                    },
                    success: function (response) {
                        conversa.user2 = response;
                        resolve();
                    },
                    error: function (xhr) {
                        if (xhr.status == 401)
                            window.location.href = "index.html";
                        reject();
                    }
                });
            });

            promises.push(promise);
        });

        Promise.all(promises).then(function () {
            // após as duas chamadas AJAX serem completadas, atualiza a lista de conversas
            conversationsList = conversations;
            atualizarListaConversas();
        }).catch(function () {
            // lógica de tratamento de erro
        });
    }

    function atualizarListaConversas() {
        const listaConversas = $(".conversas ul");
        listaConversas.empty(); // Limpa a lista de conversas antes de atualizá-la

        // atualiza a lista de conversas na interface com o usuário
        conversationsList.forEach(function (conversa) {
            let nomeUsuario = (conversa.user1.id == userId) ? conversa.user2.username : conversa.user1.username;

            listaConversas.append("<li id = " + conversa.id.toString() + ">" + nomeUsuario + "</li>");
        });
    }
});

async function getMensagens(idConversa) {

    let promise = new Promise(function (resolve, reject) {
        $.ajax({
            url: Settings.URL + "api/Mensagem/" + idConversa,
            type: "GET",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + token.toString()
            },
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                if (xhr.status == 401)
                    window.location.href = "index.html";
                reject();
            }
        });
    });

    return promise;
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
    let mensagens = await getMensagens(idConversa);

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

    $("#sendButton").click(function (event) {
        if (inputText.value != "") {
            event.preventDefault();
            SendMessage(inputText);
        }
    });

    $("#messageInput").keypress(function (event) {
        if (event.key == 'Enter' && this.value != "") {
            event.preventDefault();
            SendMessage(this);
        }
    });
}

function SendMessage(inputText) {
    $.ajax({
        url: Settings.URL + "api/Mensagem",
        type: "POST",
        data: JSON.stringify({ conversaId: currentSelectedConversationId, remetenteId: userId, conteudo: inputText.value }),
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + token.toString()
        },
        success: function (response) {
            inputText.value = "";
        },
        error: function (xhr) {
            if (xhr.status == 401)
                window.location.href = "index.html";
        }
    });
}