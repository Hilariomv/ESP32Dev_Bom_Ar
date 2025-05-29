let currentIntervalMinutes = 10; // Variável global para armazenar o intervalo atual
let isSystemOn = false; // Estado inicial do sistema (desligado)

document.addEventListener('DOMContentLoaded', (event) => {
  // Inicializa o display do intervalo com o valor padrão
  document.getElementById('intervalo-display').textContent = `${currentIntervalMinutes} min`;
  // Inicializa o estado do switch e texto
  updatePowerStatus(isSystemOn);
});

function enviarConfig(intensidade) {
  const status = document.getElementById("status");

  // Feedback visual imediato
  status.textContent = '⏳ Enviando configuração...';
  status.style.background = '#fff3cd';
  status.style.borderColor = '#ffeaa7';
  status.style.color = '#856404';
  status.classList.add('show');

  // Usa o intervalo atual selecionado
  fetch(`/config?intensidade=${intensidade}&intervalo=${currentIntervalMinutes}`)
    .then(res => res.text())
    .then(msg => {
      status.textContent = `✅ Configurado: ${intensidade.toUpperCase()} - ${currentIntervalMinutes} min`;
      status.style.background = '#e8f5e8';
      status.style.borderColor = '#c3e6c3';
      status.style.color = '#2d5a3d';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    })
    .catch(err => {
      status.textContent = '❌ Erro na configuração';
      status.style.background = '#ffe8e8';
      status.style.borderColor = '#ffcccb';
      status.style.color = '#d32f2f';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    });
}

function acionarManual() {
  const status = document.getElementById("status");

  // Feedback visual imediato
  status.textContent = '⏳ Acionando dispositivo...';
  status.style.background = '#fff3cd';
  status.style.borderColor = '#ffeaa7';
  status.style.color = '#856404';
  status.classList.add('show');

  fetch('/manual')
    .then(res => res.text())
    .then(msg => {
      status.textContent = '🔥 Acionamento manual executado!';
      status.style.background = '#e8f5e8';
      status.style.borderColor = '#c3e6c3';
      status.style.color = '#2d5a3d';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    })
    .catch(err => {
      status.textContent = '❌ Erro no acionamento manual';
      status.style.background = '#ffe8e8';
      status.style.borderColor = '#ffcccb';
      status.style.color = '#d32f2f';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    });
}

// Funções para o Toggle Switch (Ligar/Desligar)
function togglePower() {
  const powerToggle = document.getElementById('powerToggle');
  isSystemOn = powerToggle.checked;
  updatePowerStatus(isSystemOn);
  sendPowerState(isSystemOn);
}

function updatePowerStatus(on) {
  const powerStatusLabel = document.getElementById('powerStatus');
  if (on) {
    powerStatusLabel.textContent = 'Sistema Ligado';
    powerStatusLabel.style.color = '#2d5a3d'; // Verde
  } else {
    powerStatusLabel.textContent = 'Sistema Desligado';
    powerStatusLabel.style.color = '#d32f2f'; // Vermelho
  }
}

function sendPowerState(state) {
  const status = document.getElementById("status");
  status.textContent = `⏳ ${state ? 'Ligando' : 'Desligando'} sistema...`;
  status.style.background = '#fff3cd';
  status.style.borderColor = '#ffeaa7';
  status.style.color = '#856404';
  status.classList.add('show');

  fetch(`/power?state=${state ? 'on' : 'off'}`)
    .then(res => res.text())
    .then(msg => {
      status.textContent = `✅ Sistema ${state ? 'Ligado' : 'Desligado'}!`;
      status.style.background = '#e8f5e8';
      status.style.borderColor = '#c3e6c3';
      status.style.color = '#2d5a3d';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    })
    .catch(err => {
      status.textContent = `❌ Erro ao ${state ? 'ligar' : 'desligar'} o sistema`;
      status.style.background = '#ffe8e8';
      status.style.borderColor = '#ffcccb';
      status.style.color = '#d32f2f';
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), 3000);
    });
}

// Funções para o Seletor de Minutos (Relógio)
function openTimePicker() {
  document.getElementById('timePickerModal').style.display = 'flex'; // Mostra o modal
  document.getElementById('selectedMinutes').textContent = currentIntervalMinutes; // Define o valor atual
}

function closeTimePicker() {
  document.getElementById('timePickerModal').style.display = 'none'; // Esconde o modal
}

function changeMinutes(delta) {
  let newMinutes = parseInt(document.getElementById('selectedMinutes').textContent) + delta;
  // Definir limites razoáveis para os minutos (ex: 1 a 120 minutos)
  if (newMinutes < 1) {
    newMinutes = 1;
  } else if (newMinutes > 120) {
    newMinutes = 120;
  }
  document.getElementById('selectedMinutes').textContent = newMinutes;
}

function applyTimeSelection() {
  currentIntervalMinutes = parseInt(document.getElementById('selectedMinutes').textContent);
  document.getElementById('intervalo-display').textContent = `${currentIntervalMinutes} min`;
  closeTimePicker();
  // Automaticamente envia a nova configuração de tempo, mantendo a intensidade atual (ou uma padrão se não tiver)
  // Para simplificar, podemos enviar a intensidade atual (se houver um estado ativo)
  // Ou, podemos apenas atualizar o display e o usuário clica na intensidade novamente.
  // Por simplicidade, vamos apenas atualizar o display e o valor interno.
  // A configuração será enviada quando o usuário clicar em uma intensidade.
}

// Previne zoom duplo-toque no iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);