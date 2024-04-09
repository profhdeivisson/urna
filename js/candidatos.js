// Configurações do Firebase
import { firebaseConfig } from './firebaseConfig.js';

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
var db = firebase.firestore();

// Referência ao Firebase Storage
var storage = firebase.storage();
var idDoCandidato;

// Função para listar os candidatos
function listarCandidatos() {
    db.collection("candidatos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var candidato = doc.data();
            var candidatoDiv = document.createElement('div');
            idDoCandidato = doc.id
            candidatoDiv.className = 'candidato'
            candidatoDiv.id = idDoCandidato

            // Cria um contêiner para a imagem e o ícone de upload
            var imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.width = '100px';
            imgContainer.style.height = '100px';

            // Cria um elemento de imagem para a foto do candidato
            var fotoImg = document.createElement('img');
            fotoImg.src = candidato.fotos[0].url; // Usa a URL da imagem do Firestore
            fotoImg.style.width = '100%';
            fotoImg.style.height = '100%';
            
            imgContainer.appendChild(fotoImg);
            // Adiciona o contêiner da imagem ao candidatoDiv
            candidatoDiv.appendChild(imgContainer);                    

            // Adiciona o conteúdo do candidato
            candidatoDiv.innerHTML += '<div><h3>' + candidato.titulo + '</h3>' +
                                    '<p>Nome: ' + candidato.nome + '</p>' +
                                    '<p>Número: ' + candidato.numero + '</p>' +
                                    '<p>Qtd de Votos: ' + candidato.votos + '</p>' +
                                    '<p>Partido: ' + candidato.partido + '</p></div>';
            

            
            // Adiciona o botão de editar ao candidatoDiv
            var uploadImgBtn = document.createElement('button');
            uploadImgBtn.innerHTML = 'Mudar imagem';
            uploadImgBtn.className = 'uploadImgBtn'; // Adiciona a classe CSS ao botão
            uploadImgBtn.onclick = (function(idDoCandidato) {
                return function() {
                    var fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*'
                    fileInput.onchange = function(e) {
                        var file = e.target.files[0];

                        // Faz o upload do arquivo para o Firebase Storage
                        var storageRef = firebase.storage().ref('fotos/' + file.name);
                        var uploadTask = storageRef.put(file);

                        uploadTask.on('state_changed', function(snapshot) {
                            // Você pode adicionar código aqui para monitorar o progresso do upload
                        }, function(error) {
                            // Trata qualquer erro que ocorrer durante o upload
                            console.error("Erro ao fazer upload da foto: ", error);
                        }, function() {
                            // Quando o upload for concluído, atualiza a URL da foto no Firestore
                            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                                db.collection("candidatos").doc(idDoCandidato).update({
                                    fotos: [{url: downloadURL}]
                                }).then(function() {
                                    alert("Imagem atualizada com sucesso"); // Emite o alerta
                                    location.reload(); // Recarrega a página
                                });
                            });
                        });
                    };
                    fileInput.click();
                };
            })(idDoCandidato);
            candidatoDiv.appendChild(uploadImgBtn);

            // Adiciona o botão de editar ao candidatoDiv
            var editarBtn = document.createElement('button');
            editarBtn.innerHTML = 'Editar';
            editarBtn.className = 'editar'; // Adiciona a classe CSS ao botão
            editarBtn.onclick = function() {
                // Pega o id do candidato que você quer editar
                idDoCandidato = doc.id;

                // Pega os dados do candidato do Firebase
                var docRef = db.collection("candidatos").doc(idDoCandidato);

                docRef.get().then((doc) => {
                    if (doc.exists) {
                        // Preenche o modal com os dados do candidato
                        document.getElementById('cargo').value = doc.data().titulo;
                        document.getElementById('numero').value = doc.data().numero;
                        document.getElementById('nome').value = doc.data().nome;
                        document.getElementById('partido').value = doc.data().partido;
                        // Mostra o modal
                        $('#modalEditarCandidato').show();
                    } else {
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
            };
            candidatoDiv.appendChild(editarBtn);

            //Quando o botão de salvar for clicado, atualiza os dados no Firebase
            document.getElementById('salvar').onclick = function() {
                var titulo = document.getElementById('cargo').value;
                var numero = document.getElementById('numero').value;
                var nome = document.getElementById('nome').value;
                var partido = document.getElementById('partido').value;
                // Verifica a quantidade de dígitos do número baseado no cargo escolhido
                if ((titulo == 'VICE-REPRESENTANTE' && numero.length != 5) || (titulo == 'REPRESENTANTE' && numero.length != 2)) {
                    alert('A quantidade de dígitos do número está incorreta para o cargo escolhido.');
                    return;
                }

                // Atualiza os dados no Firebase
                db.collection("candidatos").doc(idDoCandidato).update({
                    titulo: titulo,
                    numero: numero,
                    nome: nome,
                    partido: partido
                })
                .then(() => {
                    alert("Candidato atualizado com sucesso!");
                    // Atualiza a página
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Erro ao atualizar candidato: ", error);
                });
            };

            // Cria um botão de excluir
            var excluirBtn = document.createElement('button');
            excluirBtn.innerHTML = 'Excluir';
            excluirBtn.className = 'excluir'; // Adiciona a classe CSS ao botão
            excluirBtn.onclick = function() {
                // Confirma se o usuário realmente deseja excluir o candidato
                if (confirm('Você realmente deseja excluir este candidato?')) {
                    // Exclui o candidato do Firestore
                    db.collection("candidatos").doc(doc.id).delete().then(() => {
                        alert("Candidato excluído com sucesso!");
                        // Remove o candidato da lista
                        candidatoDiv.parentNode.removeChild(candidatoDiv);
                    }).catch((error) => {
                        console.error("Erro ao excluir candidato: ", error);
                    });
                }
            };
            candidatoDiv.appendChild(excluirBtn);

            document.getElementById('candidatos').appendChild(candidatoDiv);
        });
    });
}

// Chama a função para listar os candidatos
listarCandidatos();