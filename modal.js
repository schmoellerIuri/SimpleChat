class SettingsModal {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

const tkn = sessionStorage.getItem("token");

if (tkn === null) {
	window.location.href = "index.html";
}

const modal = document.getElementById('myModal');
const span = document.getElementsByClassName('close')[0];
const userFilter = document.getElementById('userNameInput');
const divUsersList = document.getElementById('usuarios-list');
const btnCriarConversa = document.getElementById('criar-conversa');
var users = [];
var usersConversationsIds = [];
var selectedUserId = null;

const Http = new XMLHttpRequest();
const url = SettingsModal.URL + 'api/Usuario';

const loggedUserId = new URLSearchParams(window.location.search).get('id');
const HttpConversas = new XMLHttpRequest();
const urlConversas = SettingsModal.URL + 'api/Conversa/' + loggedUserId.toString();
HttpConversas.open("GET", urlConversas);
HttpConversas.setRequestHeader("Authorization", "Bearer " + tkn.toString());

HttpConversas.send();

HttpConversas.onreadystatechange = (e) => {
	if (HttpConversas.status == 401) {
		window.location.href = "index.html";
		return;
	}

	let conversations = JSON.parse(HttpConversas.responseText);
	conversations.forEach(function (conversation) {
		if (conversation.idUser1 == loggedUserId)
			usersConversationsIds.push(conversation.idUser2);
		else
			usersConversationsIds.push(conversation.idUser1);
	});
	Http.open("GET", url);
	Http.setRequestHeader("Authorization", "Bearer " + tkn.toString());
	Http.send();
}


Http.onreadystatechange = (e) => {
	if (HttpConversas.status == 401) {
		window.location.href = "index.html";
		return;
	}

	users = JSON.parse(Http.responseText);
	users = users.filter(function (user) {
		return user.id != loggedUserId && !usersConversationsIds.includes(user.id);
	});
	ChangeList(users);
}

span.onclick = function () {
	if (selectedUserId !== null) {
		let oldUser = document.getElementById(selectedUserId + 'user');
		oldUser.style.border = '1px solid #282a36';
		selectedUserId = null;
	}

	modal.style.display = 'none';
}

window.onclick = function (event) {
	if (event.target == modal)
		modal.style.display = 'none';
}

userFilter.onkeyup = function (event) {
	event.preventDefault();
	const filteredUsers = users.filter(function (user) {
		return user.username.toLowerCase().includes(userFilter.value.toLowerCase());
	});

	ChangeList(filteredUsers);
}

function ChangeList(users) {
	divUsersList.innerHTML = '';

	users.forEach(function (user) {
		var div = document.createElement('li');
		div.setAttribute('class', 'user');
		div.setAttribute('id', user.id + 'user');
		div.innerHTML = user.username;
		divUsersList.appendChild(div);
	});
}

divUsersList.onclick = function (event) {
	if (!event.target.id.includes('user'))
		return;

	if (selectedUserId !== null) {
		let oldUser = document.getElementById(selectedUserId + 'user');
		oldUser.style.border = '1px solid #282a36';
	}

	selectedUserId = event.target.id.split('user')[0];
	event.target.style.border = '1px solid #fff';
}

btnCriarConversa.onclick = function (event) {
	event.preventDefault();
	if (selectedUserId === null)
		return;

	let oldUser = document.getElementById(selectedUserId + 'user');
	oldUser.style.border = '1px solid #282a36';

	const newConversation = {
		idUser1: loggedUserId,
		idUser2: selectedUserId
	};

	const Httpcreate = new XMLHttpRequest();
	const url = SettingsModal.URL + 'api/Conversa';
	Httpcreate.open("POST", url);
	Httpcreate.setRequestHeader("Content-Type", "application/json");
	Httpcreate.setRequestHeader("Authorization", "Bearer " + tkn.toString());
	Httpcreate.send(JSON.stringify(newConversation));

	Httpcreate.onreadystatechange = (e) => {
		if (HttpConversas.status == 401) {
			window.location.href = "index.html";
			return;
		}

		if (Http.readyState == 4 && Http.status == 200) {
			modal.style.display = 'none';
			window.location.href = "conversations.html?id=" + loggedUserId.toString();
		}
		selectedUserId = null;
	}
}