class Settings {
    static URL = "https://api-simplechat.azurewebsites.net/"; 
}

const divPassword = document.getElementById("inputPassword");
const divUsername = document.getElementById("inputUsername");
const divConfirmPw = document.getElementById("inputConfirmPw");
const divError = document.getElementById("error");
const cadastrarButton = document.getElementById("cadastro-button");

function cadastroButtonClick(event) {
    event.preventDefault();

    const username = divUsername.value;
    const password = divPassword.value;

    if(!validateForm()){
      alert("Dados inválidos");
      return;
    }

    const overlay = document.getElementById("overlay");
    overlay.style.display = 'flex';

    axios.post(Settings.URL + "api/Usuario", { 
      username: username, 
      password: password 
	  })
	  .then(function (response) {
      login(username,password);
	  })
	  .catch(function (error) {
      overlay.style.display = 'none';
      const errorMessage = error.response.data ? error.response.data : "Erro desconhecido";
      alert(errorMessage);
	  });
}

function validateForm(){
    const username = divUsername.value;
    const regex = /^[a-zA-Z0-9]{1,20}$/;
    if (username.length > 0 && !regex.test(username)){
        return false;
    }
    if(divPassword.value != divConfirmPw.value){
        return false;
    }
    return true;
}

function login(username, password){
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

function cancelarButtonClick(event) {
    event.preventDefault();
    window.location.href = "index.html";
}

function passwordKeyUp() {
    let passwordInput = divPassword.value;
    let confirmPw = divConfirmPw.value;

    checkPasswordMatching(passwordInput,confirmPw);
}

function checkPasswordMatching(password,confirmation){
    if (password.length > 0 && confirmation !== password) {
        divConfirmPw.style.borderColor = 'red';
        divPassword.style.borderColor = 'red';
        divError.textContent = "Confirmação de senha não coincide com a original";
        divError.style.display = 'block';
    } else {
        divConfirmPw.style.borderColor = '';
        divPassword.style.borderColor = '';
        divError.style.display = 'none';
    }
}