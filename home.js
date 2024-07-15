class Settings {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

function loginButtonClick(event) {
	event.preventDefault();
	Login();
}

function keyPressed(event) {
	if (event.key == 'Enter') {
		event.preventDefault();
		Login();
	}
}

function Login() {
	const username = document.getElementById("inputUsername").value;
	const password = document.getElementById("inputPassword").value;
	const overlay = document.getElementById("overlay");

	overlay.style.display = 'flex';

	axios.post(Settings.URL + "api/Usuario/login", { 
		username: username, 
		password: password 
	  })
	  .then(function (response) {
		sessionStorage.setItem("token", response.data.token);
		window.location.href = "conversations.html?id=" + response.data.id;
	  })
	  .catch(function (error) {
		overlay.style.display = 'none';
		const errorMessage = error.response.data ? error.response.data : "Erro desconhecido";
		alert(errorMessage);
	  });
}



