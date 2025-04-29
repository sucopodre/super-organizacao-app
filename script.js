// Referências aos elementos
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const themeToggle = document.getElementById("theme-toggle");

// URL do seu Web App do Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhrg1FkcfHnaJdC4n7cS3CY3F8rntGgpFVzzESsiahKbB3yoOu9mXLrHtzOEWV3lbMlw/exec';

// Carregar tarefas e tema ao iniciar
window.addEventListener("load", () => {
  loadTasks();
  loadTheme();
  requestNotificationPermission();
  registerServiceWorker();
});

// Função para salvar tarefa no localStorage
function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Solicitar permissão para notificações
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

// Função para registrar o Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado:', registration.scope);
      })
      .catch(err => {
        console.log('Falha no registro do SW:', err);
      });
  }
}
const response = await fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taskData),
});

const data = await response.json();  // Tenta converter a resposta em JSON
console.log(data);  // Verifique o conteúdo retornado

// Manipulador de envio do formulário
taskForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const responsible = document.getElementById('responsible').value;
  const deadline = document.getElementById('deadline').value;
  const description = document.getElementById('description').value;

  const taskData = { title, responsible, deadline, description };

  try {
    // Envia a tarefa para o Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    

    // Verifica se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro na resposta do servidor: ${response.status}`);
    }

    // Tenta converter a resposta em JSON
    const result = await response.json();

    if (result.result === "sucesso") {
      // Exibe na lista
      displayTask(taskData);
      // Salva localmente
      saveTask(taskData);
      // Notificação
      notifyTaskCreated(taskData);
      // Limpa o formulário
      taskForm.reset();
      alert("Tarefa enviada e salva!");
    } else {
      alert("Erro ao salvar tarefa no servidor.");
    }
  } catch (error) {
    console.error('Erro ao enviar:', error);
    alert("Erro: " + error.message);
  }
});

// Mostrar tarefa na tela
function displayTask(task) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${task.title}</strong><br>
    Responsável: ${task.responsible}<br>
    Vencimento: ${task.deadline}<br>
    ${task.description}
  `;
  taskList.appendChild(li);
}

// Carregar tarefas do localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(displayTask);
}

// Alternar tema escuro
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Carregar o tema salvo
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

// Notificar nova tarefa
function notifyTaskCreated(task) {
  if (Notification.permission === "granted") {
    new Notification("Nova Tarefa Criada!", {
      body: `Tarefa: ${task.title}`,
      icon: "/icons/logo_192x192.png",
    });
  }
}
