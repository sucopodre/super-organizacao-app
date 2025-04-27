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

// Enviar formulário
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const responsible = document.getElementById("responsible").value;
  const deadline = document.getElementById("deadline").value;
  const description = document.getElementById("description").value;
  

  const task = {
    id: Date.now(),
    title,
    responsible,
    deadline,
    description,
    done: false
  };

  saveTask(task);
  displayTask(task);
  scheduleNotification(task); // Agendar notificação para lembrete
  notifyTaskCreated(task);  // Notificação de criação da tarefa

  taskForm.reset();
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

  // Notificação de remoção de tarefa
  function notifyTaskRemoved(id) {
    // Busca a tarefa pelo ID
    const task = getTaskById(id);
    
    if (task && Notification.permission === "granted") {
      new Notification("Tarefa Removida", {
        body: `A tarefa '${task.title}' foi removida.`,
        icon: "icons/icon-192x192.png",
      });
    }
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
if ("Notification" in window) {
    // O navegador suporta notificações
  }
  window.addEventListener('load', function () {
    if (Notification.permission === "default") {
      // Solicita permissão se o usuário ainda não tiver respondido à solicitação
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          console.log("Permissão concedida para notificações!");
          // Agora você pode enviar notificações
        } else {
          console.log("Permissão negada para notificações.");
        }
      });
    }
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log("Service Worker registrado com sucesso:", registration);
    }).catch(function(error) {
      console.log("Falha ao registrar o Service Worker:", error);
    });
  }
  const date = new Date(task.deadline + "T00:00:00"); // Adiciona horário


  function showNotification() {
    if (Notification.permission === "granted") {
      new Notification("Sua tarefa foi concluída!");
    }
  }
  

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
  

  function displayTask(task) {
    const li = document.createElement("li");
    li.id = `task-${task.id}`;
    li.classList.toggle("done", task.done);
  
    li.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <label style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" onchange="toggleDone(${task.id})" ${task.done ? 'checked' : ''}/>
          Concluído?
        </label>
        <button onclick="removeTask(${task.id})" style="background: red;">Remover</button>
      </div>
      <strong>${task.title}</strong><br>
      Responsável: ${task.responsible}<br>
      Vencimento: ${task.deadline}<br>
      ${task.description}
    `;
  
    taskList.appendChild(li);
  }
  
  function toggleDone(id) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(t => t.id === id);
    
    if (task) {
      task.done = !task.done;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      
      // Atualiza apenas o item modificado em vez de recarregar toda a lista
      const taskElement = document.getElementById(`task-${id}`);
      if (taskElement) {
        taskElement.classList.toggle("done", task.done);
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = task.done;
        }
      }
    }
  }

  
// Função para pegar uma tarefa pelo ID
function getTaskById(id) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  return tasks.find(t => t.id === id);
}

// Notificações agendadas (após 1 hora da criação)
function scheduleNotification(task) {
  if (!("Notification" in window)) return;

  const date = new Date(task.deadline);
  const now = new Date();
  const timeout = date.getTime() - now.getTime() - (1000 * 60 * 60); // 1 hora antes

  if (timeout > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Lembrete de Tarefa", {
          body: `${task.title} - ${task.description}`,
          icon: "icons/icon-192x192.png"
        });
      }
    }, timeout);
  }
}
