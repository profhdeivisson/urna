// Configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDXQyVKuvuLz48YUfozyxi8Fq-k5RE3jqY",
    authDomain: "urnainpar.firebaseapp.com",
    projectId: "urnainpar",
    storageBucket: "urnainpar.appspot.com",
    messagingSenderId: "527956827942",
    appId: "1:527956827942:web:576b3eaa852a6995b3abe7"
  };

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
var db = firebase.firestore();

let seuVotoPara = document.querySelector('.d-1-1 span');
let cargo = document.querySelector('.d-1-2 span');
let descricao = document.querySelector('.d-1-4');
let aviso = document.querySelector('.d-2');
let lateral = document.querySelector('.d-1-right');
let numeros = document.querySelector('.d-1-3');

let etapaAtual = 0;
let numero = '';
let votoBranco = false;
let votos = [];
let etapas = [
    {
        titulo: 'VICE-REPRESENTANTE',
        numeros: 5,
    },
    {
        titulo: 'REPRESENTANTE',
        numeros: 2,
    }
]

function comecarEtapa() {
    let etapa = etapas[etapaAtual];

    let numeroHTML = '';
    numero = '';
    votoBranco = false;

    for(let i=0;i<etapa.numeros;i++) {
        if(i ===0) {
            numeroHTML += '<div class="numero pisca"></div>';
        } else{
            numeroHTML += '<div class="numero"></div>';
        }    
    }

    seuVotoPara.style.display = 'none';
    cargo.innerHTML = etapa.titulo;
    descricao.innerHTML = '';
    aviso.style.display = 'none';
    lateral.innerHTML = '';
    numeros.innerHTML = numeroHTML;
}

async function atualizaInterface(){
    // Pega a referência da coleção de candidatos
    var candidatosRef = db.collection("candidatos");

    try {
        // Pega todos os documentos da coleção
        var querySnapshot = await candidatosRef.get();

        var candidatoEncontrado = false;

        querySnapshot.forEach((doc) => {
            // doc.data() contém os dados de cada candidato
            var candidato = doc.data();
            // Agora você pode usar os dados do candidato para alimentar a urna
            if(candidato.numero === numero.toString()) {
                candidatoEncontrado = true;
                seuVotoPara.style.display = 'block';
                aviso.style.display = 'block';
                descricao.innerHTML = 'Nome: '+candidato.nome+'<br/>'+'Partido: '+candidato.partido;
                let fotosHTML = '';
                fotosHTML += '<div class="d-1-image"> <img src="'+candidato.fotos[0].url+'" alt="" />'+candidato.titulo+'</div>';
                lateral.innerHTML = fotosHTML;
            }
        });

        if (!candidatoEncontrado) {
            seuVotoPara.style.display = 'block';
            aviso.style.display = 'block';
            descricao.innerHTML = '<div class="aviso--grande pisca">VOTO NULO</div>';
        }
    } catch(error) {
        console.log("Erro ao pegar os dados: ", error);
    }
}



function clicou(n) {
    let somNumeros = new Audio();
    somNumeros.src = "audios/numeros.mp3";
    somNumeros.play();

    let elNumero = document.querySelector('.numero.pisca');
    if(elNumero !== null) {
        elNumero.innerHTML = n;
        //numero = '${numero}${n}';
        numero = numero+n;

        //fazer com que o campo de número pisque e após preenchido passe para o proximo campo
        elNumero.classList.remove('pisca');
        if( elNumero.nextElementSibling !== null){
            elNumero.nextElementSibling.classList.add('pisca');
        } else {
            atualizaInterface();
        }
    }
} 
function branco() {
    numero === ''
    votoBranco = true;

    seuVotoPara.style.display = 'block';
    aviso.style.display = 'block';
    numeros.innerHTML = '';
    descricao.innerHTML = '<div class="aviso--grande pisca">VOTO EM BRANCO</div>';
    lateral.innerHTML = '';

    
}
function corrige() {
    let somCorrige = new Audio();
    somCorrige.src = "audios/corrige.mp3";
    somCorrige.play();
    comecarEtapa();
}
async function confirma() {
    let etapa = etapas[etapaAtual];

    let votoConfirmado = false;
    let somConfirma = new Audio("audios/confirma.mp3");

    if(votoBranco === true) {
        votoConfirmado = true;
        somConfirma.play();

        votos.push({
            etapa: etapas[etapaAtual].titulo,
            voto: 'branco'
        });
    } else if(numero.length === etapa.numeros) {
        votoConfirmado = true;
        somConfirma.play();

        votos.push({
            etapa: etapas[etapaAtual].titulo,
            voto: numero
        });

        // Atualiza o número de votos no Firebase
        let candidatosRef = db.collection("candidatos");
        let snapshot = await candidatosRef.where('numero', '==', numero).get();
        
        if (!snapshot.empty) {
            let doc = snapshot.docs[0];
            await doc.ref.update({
                votos: firebase.firestore.FieldValue.increment(1)
            });
        }
    }

    if(votoConfirmado) {
        etapaAtual++;
        if(etapas[etapaAtual] !== undefined) {
            comecarEtapa();
        } else {
            document.querySelector('.tela').innerHTML = '<div class="aviso--gigante pisca">FIM</div>';
            console.log(votos);
        }
    }
}

comecarEtapa();