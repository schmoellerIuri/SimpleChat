class Settings {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

$(document).ready(function () {
	$("#login-button").click(function (event) {
		event.preventDefault();
		Login();
	});

	$("#inputPassword").keypress(function (event) {
		if (event.key == 'Enter') {
			event.preventDefault();
			Login();
		}
	});

	function Login() {
		const username = $("#inputUsername").val();
		const password = $("#inputPassword").val();
		$.ajax({
			url: Settings.URL + "api/Usuario/login",
			type: "POST",
			data: JSON.stringify({ username: username, password: password }),
			contentType: "application/json",
			success: function (response) {
				// lógica de sucesso
				sessionStorage.setItem("token", response.token);
				window.location.href = "conversations.html?id=" + response.id;
			},
			error: function (xhr) {
				// lógica de erro
				var errorMessage = xhr.responseText ? xhr.responseText : "Erro desconhecido";
				$("#error").html(errorMessage);
				$("#error").show();
			}
		});
	}
});



