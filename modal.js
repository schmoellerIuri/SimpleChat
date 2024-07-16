class SettingsModal {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

const modal = document.getElementById('dialog-box');
const span = document.getElementsByClassName('close')[0];
const userFilter = document.getElementById('userNameInput');
const divUsersList = document.getElementById('usuarios-list');
const btnCriarConversa = document.getElementById('criar-conversa');
var users = [];
var usersConversationsIds = [];
var selectedUserId = null;

const url = SettingsModal.URL + 'api/Usuario';

const loggedUserId = new URLSearchParams(window.location.search).get('id');

const urlConversas = SettingsModal.URL + 'api/Conversa/' + loggedUserId.toString();

axios.get(urlConversas, {
	headers: {
		'Authorization': 'Bearer ' + token.toString()
	}
}).then((response) => {
	let conversations = response.data;
	conversations.forEach(function (conversation) {
		if (conversation.idUser1 == loggedUserId)
			usersConversationsIds.push(conversation.idUser2);
		else
			usersConversationsIds.push(conversation.idUser1);
	});
	axios.get(url, {
		headers:
			{ 'Authorization': 'Bearer ' + token.toString() }
	}).then((response) => {
		users = response.data;
		users = users.filter(function (user) {
			return user.id != loggedUserId && !usersConversationsIds.includes(user.id);
		});
		ChangeList(users);
	});
}).catch((error) => {
	if (error.response.status == 401) {
		window.location.href = "index.html";
	}
	else {
		alert("Erro ao carregar conversas, tente novamente mais tarde.");
		window.location.href = "index.html";
	}
});

span.onclick = function () {
	document.getElementById("overlay").style.display = 'none';
	if (selectedUserId !== null) {
		let oldUser = document.getElementById(selectedUserId + 'user');
		oldUser.style.border = '1px solid #282a36';
		selectedUserId = null;
	}

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

	const url = SettingsModal.URL + 'api/Conversa';
	
	axios.post(url, newConversation, {
		headers: {
			'Authorization': 'Bearer ' + token.toString()
		}
	}).then((response) => {
		modal.close();
		window.location.href = "conversations.html?id=" + loggedUserId.toString();
	}).catch((error) => {
		if (error.response.status == 401) {
			window.location.href = "index.html";
		}
		else {
			alert("Erro ao criar conversa, tente novamente mais tarde.");
			window.location.href = "index.html";
		}
		selectedUserId = null;
	});
}