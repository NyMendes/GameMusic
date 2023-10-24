// Função para iniciar o jogo
const cc = document.querySelector('.containerCinco ')
cc.classList.remove('containerCinco')

const cu = document.querySelector('.containerUm')
cu.classList.add('containerUm')
cu.classList.remove('hidden')
const cd = document.querySelector('.containerDois')
const ct = document.querySelector('.containerTres')
const cq = document.querySelector('.containerQuatro')

function playGame() {
  cu.classList.add('hidden')
  cd.classList.remove('hidden')
}

function startGame() {
  //substitui o botão Iniciar jogo por uma contagem regressiva e dps cria um botao para chamar a promisse player
  cd.classList.add('hidden')
  ct.classList.remove('hidden')

  const cont = document.querySelector('.contador')
  const startButton = document.getElementById('start-game')
  startButton.remove()
  const countdown = document.createElement('h1')
  countdown.innerText = '3'
  cont.appendChild(countdown)
  setTimeout(() => {
    countdown.innerText = '2'
    setTimeout(() => {
      countdown.innerText = '1'
      setTimeout(() => {
        countdown.remove()
        ct.classList.add('hidden')
        cq.classList.remove('hidden')
      }, 1000)
    }, 1000)
  }, 1000)
}
let player
let trackName
let album_uri
let connect_to_device

window.onSpotifyWebPlaybackSDKReady = () => {
  //Trocar o token abaixo a cada hora, precisa estar logado, através do link https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started
  const token =
    'BQD90s5PRyuuesIoAPz6hwuD00LVKzfarWslzU5NJXiGphp25bU12ZQ86HG7E87gTARO9y-8U-3woh-NYLkI27GCTtzGiynZ-1zZJMC-97pb82g1qiUfTnwSlV0kTNod0CEyDbZ85CeunZa7PURcfKP_HN8BM1Xa0-N8nraPuKyMBnW0OCPhMOvIoW7-m165Gp_svNr0ZU7-wgBTBOopTf2R4H4a'
  //token
  player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => {
      cb(token)
    },
    volume: 0.9
  })
  // Robk:  'spotify:playlist:37i9dQZF1EQpj7X7UK8OOF'
  // Anos80: 'spotify:playlist:7owriGQK12LB9haE8PbJXe'
  // Pop: 'spotify:playlist:37i9dQZF1DX1ngEVM0lKrb'

  const radioButtons = document.querySelectorAll('input[type="radio"]')
  radioButtons.forEach(button => {
    button.addEventListener('click', () => {
      album_uri = button.value
      console.log(`Album seleciona: ${album_uri}`)
    })
  })

  player.addListener('ready', ({ device_id }) => {
    // console.log('Ready with Device ID', device_id)
    connect_to_device = () => {
      if (!album_uri) {
        setTimeout(connect_to_device, 500)
        return
      }
      fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            context_uri: album_uri, //.Random(),
            play: false
          }),
          headers: new Headers({
            Authorization: 'Bearer ' + token
          })
        }
      )
        .then(response => console.log(response))
        .then(data => {
          // Adicionar listener para o evento de mudança de estado de reprodução
          player.addListener('player_state_changed', ({ track_window }) => {
            trackName = track_window.current_track.artists[0].name
            trackName = trackName.toLowerCase()
            console.log('Current Track:', trackName)
          })
        })
    }
  })

  let chances = 3 // Inicialize com 3 chances
  let totalPontos = 0 // Inicialize com 0 pontos
  let rodadaAtual = 1 // Inicialize com a primeira rodada

  // Função para atualizar a pontuação do jogador
  function atualizarPontuacao(pontosGanhos) {
    totalPontos += pontosGanhos
    pontos.innerHTML = totalPontos
  }

  //botão play music para tocar a musica por 13 segundos
  // Função para lidar com o clique no botão "Play Music"
  const play = document.querySelector('#playButton')
  let isConected = false
  document.getElementById('play-music').addEventListener('click', () => {
    if (chances > 0) {
      // Reduz uma chance a cada clique
      chances--
      // Toca a música por 13 segundos
      if (!isConected) {
        play.classList.toggle('bi-play-fill')
        connect_to_device()
        isConected = true
      }
      setTimeout(() => {
        player.pause()
      }, 13000)
      player.togglePlay()
    } else {
      alert('Acabou suas chances')
      player.nextTrack()
      chances = 3 // Reinicialize as chances
      rodadaAtual++ // Vá para a próxima rodada

      if (rodadaAtual > 3) {
        // Final do jogo
        alert('Fim do jogo. Pontuação final: ' + totalPontos)
        cq.classList.add('hidden')
        cc.classList.add('containerCinco')
      }
    }
  })

  // Função para lidar com a resposta do jogador
  document.getElementById('btn-resposta').addEventListener('click', event => {
    event.preventDefault()
    let resposta = document.getElementById('resposta').value
    resposta = resposta.toLowerCase()

    if (resposta === trackName) {
      // O jogador acertou
      if (chances === 3) {
        atualizarPontuacao(1200)
      } else if (chances === 2) {
        atualizarPontuacao(900)
      } else if (chances === 1) {
        atualizarPontuacao(600)
      }

      alert('Você Acertou, Parabéns!')
      document.getElementById('resposta').value = ''
      player.nextTrack()
      chances = 3 // Reinicialize as chances
    } else {
      // O jogador errou
      alert('Você errou, tente novamente!')
      document.getElementById('resposta').value = ''
      player.nextTrack()
      chances = 3
    }
  })

  player.connect()
}
