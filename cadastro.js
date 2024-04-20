class Settings {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

$(document).ready(function () {
    const http = new XMLHttpRequest();
    const url = Settings.URL + "api/Usuario/login";
    http.open("POST", url);
    http.setRequestHeader("Content-Type", "application/json");

    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) {
            let response = JSON.parse(http.response);
            sessionStorage.setItem("token", response.token);
            window.location.href = "conversations.html?id=" + response.id;
        }
    };

    $("#cadastro-button").click(function (event) {

        event.preventDefault();
        const username = $("#inputUsername").val();
        const password = $("#inputPassword").val();

        $.ajax({
            url: Settings.URL + "api/Usuario",
            type: "POST",
            data: JSON.stringify({ username: username, password: password }),
            contentType: "application/json",
            success: function (response) {
                // lógica de sucesso
                http.send(JSON.stringify({ username: username, password: password }));
            },
            error: function (xhr) {
                // lógica de erro
                var errorMessage = xhr.responseText ? xhr.responseText : "Erro desconhecido";
                $("#error").html(errorMessage);
                $("#error").show();
            }
        });
    });

    $("#cancelar-button").click(function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });

    $('#cadastrar-button').prop("disabled", true);

    $("#inputUsername").keyup(function () {
        let username = $(this).val();
        const regex = /^[a-zA-Z0-9]{1,20}$/;

        if (username.length > 0 && regex.test(username)) {
            $('#cadastrar-button').prop("disabled", false);
        } else {
            $('#cadastrar-button').prop("disabled", true);
        }
    });

    $("#inputPassword").keyup(function () {
        let confirmPw = $("#inputConfirmPw").val();
        let passwordInput = $(this).val();

        if (passwordInput.length > 0 && confirmPw !== passwordInput) {
            $('#inputConfirmPw').css("borderColor", "red");
            $("#error").html("Confirmação de senha não coincide com a original");
            $("#error").show();
            $('#cadastrar-button').prop("disabled", true);
        } else {
            $('#inputConfirmPw').css("borderColor", "");
            $("#error").hide();
            $('#cadastrar-button').prop("disabled", false);
        }
    });

    $("#inputConfirmPw").keyup(function () {
        let passwordInput = $("#inputPassword").val();
        let confirmPw = $(this).val();

        if (confirmPw.length > 0 && confirmPw !== passwordInput) {
            $(this).css("borderColor", "red");
            $("#error").html("Confirmação de senha não coincide com a original");
            $("#error").show();
            $('#cadastrar-button').prop("disabled", true);
        } else {
            $(this).css("borderColor", "");
            $("#error").hide();
            $('#cadastrar-button').prop("disabled", false);
        }
    });

});