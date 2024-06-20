
var correctPassword = "Eicinp@r846";

function checkPassword() {
    var password = prompt("Insira a senha para prosseguir:");

    if (password !== correctPassword) {
        alert("senha incorreta! tente novamente");
        location.href = "index.html";
    }
}

checkPassword();