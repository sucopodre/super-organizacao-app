// Referências aos elementos
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const themeToggle = document.getElementById("theme-toggle");

// Carregar tarefas salvas ao iniciar
window.addEventListener("load", () => {
  loadTasks();
  loadTheme();
  requestNotificationPermission();  // Solicitar permissão de notificação
});

// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado:', registration.scope);
      })
      .catch(err => {
        console.log('Falha no registro do SW:', err);
      });
  });
}

// Manipulador de envio do formulário
taskForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const responsible = document.getElementById('responsible').value;
  const deadline = document.getElementById('deadline').value;
  const description = document.getElementById('description').value;

  const taskData = {
    title: title,
    responsible: responsible,
    deadline: deadline,
    description: description
  };

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzR6J1AM58gdWQFbRAE2hERu5phnKNhLLoRBxuj-uXg/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const result = await response.json();

    if (result.result === "sucesso") {
      // Exibe a tarefa na lista de tarefas no site
      const taskItem = document.createElement('li');
      taskItem.textContent = `${title} - ${responsible} - ${deadline} - ${description}`;
      taskList.appendChild(taskItem);

      // Limpa o formulário
      taskForm.reset();
    }
  } catch (error) {
    console.error('Erro ao adicionar a tarefa:', error);
  }
});

// Função para agendar notificações
function scheduleNotification(task) {
  if (!("Notification" in window)) return;

  if (!task.deadline) return;

  const deadlineDate = new Date(task.deadline);
  if (isNaN(deadlineDate.getTime())) return;

  const now = new Date();
  const timeout = deadlineDate.getTime() - now.getTime() - (3600000); // 1 hora antes

  if (timeout > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Lembrete de Tarefa", {
          body: `${task.title} - ${task.description}`,
          icon: "icons/icon-192x192.png",
          vibrate: [200, 100, 200]
        });
      }
    }, timeout);
  }
}

// Solicitar permissão para notificações
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Permissão de notificação concedida");
      } else {
        console.log("Permissão de notificação negada");
      }
    });
  }
}

// Alternar tema
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Salvar tarefa no localStorage
function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Carregar tarefas do localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(displayTask);
}

// Mostrar tarefa na tela
function displayTask(task) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${task.title}</strong><br>
    Responsável: ${task.responsible}<br>
    Vencimento: ${task.deadline}<br>
    ${task.description}
    <button onclick="removeTask(${task.id})">Remover</button>
  `;
  li.id = `task-${task.id}`;
  taskList.appendChild(li);
}

// Remover tarefa
function removeTask(id) {
  const task = getTaskById(id);
  if (!task) return;

  const confirmDelete = confirm(`Tem certeza que deseja remover a tarefa "${task.title}"?`);

  if (!confirmDelete) return;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  const li = document.getElementById(`task-${id}`);
  if (li) li.remove();
  
  notifyTaskRemoved(id);  // Notificação de remoção da tarefa
}

// Função para pegar uma tarefa pelo ID
function getTaskById(id) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  return tasks.find(t => t.id === id);
}

// Tema salvo
function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  }
}

// Notificação de criação de tarefa
function notifyTaskCreated(task) {
  if (Notification.permission === "granted") {
    new Notification("Nova Tarefa Criada!", {
      body: `A tarefa '${task.title}' foi criada com sucesso.`,
      icon: "icons/icon-192x192.png",
    });
  }
}

// Notificação de remoção de tarefa
function notifyTaskRemoved(id) {
  const task = getTaskById(id);

  if (task && Notification.permission === "granted") {
    new Notification("Tarefa Removida", {
      body: `A tarefa '${task.title}' foi removida.`,
      icon: "icons/icon-192x192.png",
    });
  }
}

// Tarefa enviada para o Google Apps Script
document.getElementById("seu-formulario").addEventListener("submit", function(e) {
  e.preventDefault();

  const titulo = document.getElementById("tituloTarefa").value;
  const responsavel = document.getElementById("responsavel").value;
  const prazo = document.getElementById("prazo").value;
  const descricao = document.getElementById("descricao").value;

  fetch("https://script.google.com/macros/s/AKfycbxhrg1FkcfHnaJdC4n7cS3CY3F8rntGgpFVzzESsiahKbB3yoOu9mXLrHtzOEWV3lbMlw/exec", {
    method: "POST",
    body: new FormData(document.getElementById("seu-formulario"))
  })
  .then(response => response.text())
  .then(data => {
    alert("Tarefa enviada com sucesso!");
    console.log(data);
    document.getElementById("seu-formulario").reset();
  })
  .catch(error => {
    alert("Erro ao enviar tarefa.");
    console.error(error);
  });
});

