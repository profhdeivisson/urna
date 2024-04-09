// Configurações do Firebase
import { firebaseConfig } from './firebaseConfig.js';

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
var db = firebase.firestore();

// Referência ao Firebase Storage
var storage = firebase.storage();

function verificarCandidato(titulo, numero, nome, partido) {
    return db.collection("candidatos")
    .where("titulo", "==", titulo)
    .where("numero", "==", numero)
    .where("nome", "==", nome)
    .where("partido", "==", partido)
    .get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) {
            alert("Candidato já cadastrado!");
            document.getElementById('candidatoForm').reset(); // Limpa todos os campos do formulário
            return false;
        } else {
            return true;
        }
    })
    .catch((error) => {
        console.error("Erro ao verificar candidato: ", error);
        return false;
    });
}

// Evento de submit do formulário
document.getElementById('candidatoForm').addEventListener('submit', function(e) {
    // Previne o comportamento padrão do formulário
    e.preventDefault();

    // Pega os valores dos campos do formulário
    var nome = document.getElementById('nome').value;
    var numero = document.getElementById('numero').value;
    var partido = document.getElementById('partido').value;
    var cargo = document.getElementById('cargo').value;
    var foto = document.getElementById('foto').files[0]; // Este é o objeto File da foto

    // Verifica a quantidade de dígitos do número baseado no cargo escolhido
    if ((cargo == 'VICE-REPRESENTANTE' && numero.length != 5) || (cargo == 'REPRESENTANTE' && numero.length != 2)) {
        alert('A quantidade de dígitos do número está incorreta para o cargo escolhido.');
        return;
    }

    // Verifica se o candidato já está cadastrado
    verificarCandidato(cargo, numero, nome, partido).then((isNotRegistered) => {
        if (isNotRegistered) {
            // Se o candidato não estiver cadastrado, chama a função para adicionar o candidato
            adicionarCandidato(cargo, numero, nome, partido, foto); // Passa o objeto File diretamente
        }
    });
});

function adicionarCandidato(titulo, numero, nome, partido, foto) {
    // Cria uma referência ao arquivo no Firebase Storage
    var storageRef = storage.ref('fotos/' + foto.name);

    // Faz o upload do arquivo
    var uploadTask = storageRef.put(foto);

    // Mostra o ícone de "loading"
    document.getElementById('loadingIcon').style.display = 'inline';

    uploadTask.on('state_changed', function(snapshot){
        // Você pode adicionar código aqui para monitorar o progresso do upload
    }, function(error) {
        // Trata qualquer erro que ocorrer durante o upload
        console.error("Erro ao fazer upload da foto: ", error);
    }, function() {
        // Quando o upload for concluído, oculta o ícone de "loading"
        document.getElementById('loadingIcon').style.display = 'none';
        // Quando o upload for concluído, recupera a URL de download da foto
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            // Adiciona o candidato ao Firestore com a URL de download da foto
            db.collection("candidatos").add({
                titulo: titulo,
                votos: 0,
                numero: numero,
                nome: nome,
                partido: partido,
                fotos: [{url: downloadURL, legenda: titulo}] // Usa a URL de download aqui
            })
            .then((docRef) => {
                alert("Candidato registrado!");
                document.getElementById('candidatoForm').reset(); // Limpa todos os campos do formulário
            })
            .catch((error) => {
                alert("Erro ao adicionar candidato");
                console.error("Erro ao adicionar candidato: ", error);
            });
        });
    });
}
