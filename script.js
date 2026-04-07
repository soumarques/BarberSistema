let atendimentos = JSON.parse(localStorage.getItem("atendimentos")) || [];
let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
let clientes = JSON.parse(localStorage.getItem("clientes")) || [
  { nome: "João Silva", telefone: "(11) 99999-9999" },
  { nome: "Maria Oliveira", telefone: "(11) 88888-8888" },
  { nome: "Carlos Santos", telefone: "(11) 77777-7777" }
];

if (!localStorage.getItem("clientes")) {
  salvar();
}

function salvar() {
  localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
  if (tab === 'clientes') renderClientes();
}

function hoje() {
  return new Date().toISOString().split("T")[0];
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function deleteAtendimento(index) {
  if (confirm("Tem certeza que deseja excluir este atendimento?")) {
    atendimentos.splice(index, 1);
    salvar();
    render();
  }
}

function deleteAgendamento(index) {
  if (confirm("Tem certeza que deseja excluir este agendamento?")) {
    agendamentos.splice(index, 1);
    salvar();
    render();
  }
}

function addAtendimento() {
  let nome = document.getElementById("clienteSelect").value;
  let corte = document.getElementById("corte").value || "Corte Padrão";
  let valor = parseFloat(document.getElementById("valor").value);

  if (!nome || !valor) return alert("Preencha nome e valor");

  atendimentos.push({ nome, corte, valor, data: hoje() });
  salvar();
  render();
}

function addAgendamento() {
  let nome = document.getElementById("anome").value;
  let telefone = document.getElementById("telefone").value;
  let data = document.getElementById("data").value;
  let hora = document.getElementById("hora").value;

  if (!nome || !telefone || !data || !hora) return alert("Preencha tudo");

  agendamentos.push({ nome, telefone, data, hora });
  salvar();
  render();
}

function addCliente() {
  let nome = document.getElementById("cnome").value;
  let telefone = document.getElementById("ctelefone").value;

  if (!nome || !telefone) return alert("Preencha tudo");

  clientes.push({ nome, telefone });
  salvar();
  renderClientes();
  populateClienteSelect();
  document.getElementById("cnome").value = "";
  document.getElementById("ctelefone").value = "";
}

function render() {
  let lucro = 0;
  let clientesCount = 0;
  let hojeIndices = [];

  document.getElementById("listaAtendimentos").innerHTML = "";

  atendimentos.forEach((a, i) => {
    if (a.data === hoje()) {
      hojeIndices.push(i);
    }
  });

  hojeIndices.forEach((globalIndex, localIndex) => {
    let a = atendimentos[globalIndex];
    lucro += a.valor;
    clientesCount++;

    let li = document.createElement("li");
    li.innerHTML = `${a.nome} - ${a.corte} - R$${a.valor} <button onclick="deleteAtendimento(${globalIndex})" class="delete-btn">🗑️</button>`;
    document.getElementById("listaAtendimentos").appendChild(li);
  });

  document.getElementById("lucro").innerText = lucro;
  document.getElementById("clientes").innerText = clientesCount;

  renderAgenda();
  renderClientes();
  populateClienteSelect();
}

function renderAgenda() {
  let container = document.getElementById("listaAgendamentos");
  container.innerHTML = "";

  let dias = {};
  let agendamentoIndices = {};

  agendamentos.forEach((a, i) => {
    if (!dias[a.data]) dias[a.data] = [];
    dias[a.data].push(a);
    let key = `${a.data}-${a.hora}-${a.nome}-${a.telefone}`;
    agendamentoIndices[key] = i;
  });

  Object.keys(dias).sort().forEach(data => {
    let div = document.createElement("div");
    div.innerHTML = `<h3>${data}</h3>`;

    dias[data].forEach(a => {
      let key = `${a.data}-${a.hora}-${a.nome}-${a.telefone}`;
      let globalIndex = agendamentoIndices[key];
      let p = document.createElement("p");
      p.innerHTML = `${a.hora} - ${a.nome} - ${a.telefone} <button onclick="deleteAgendamento(${globalIndex})" class="delete-btn">🗑️</button>`;
      div.appendChild(p);
    });

    container.appendChild(div);
  });
}

function renderClientes() {
  let container = document.getElementById("listaClientes");
  container.innerHTML = "";

  let clienteStats = {};

  atendimentos.forEach(a => {
    if (!clienteStats[a.nome]) clienteStats[a.nome] = { total: 0, ultimoMes: 0 };
    clienteStats[a.nome].total++;

    let mesAtual = new Date().toISOString().slice(0, 7);
    if (a.data.startsWith(mesAtual)) clienteStats[a.nome].ultimoMes++;
  });

  clientes.forEach((c, index) => {
    let stats = clienteStats[c.nome] || { total: 0, ultimoMes: 0 };
    let vip = stats.total > 5 ? " ⭐ VIP" : "";
    let div = document.createElement("div");
    div.className = "cliente-item";
    div.innerHTML = `
      <p>${c.nome} - ${c.telefone}${vip} | Total Cortes: ${stats.total} | Último Mês: ${stats.ultimoMes}</p>
      <div>
        <button onclick="editCliente(${index})">Editar</button>
        <button onclick="deleteCliente(${index})">Excluir</button>
        <button onclick="showHistorico('${c.nome}')">Ver Histórico</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function filterClientes() {
  let search = document.getElementById("searchCliente").value.toLowerCase();
  let items = document.querySelectorAll("#listaClientes .cliente-item");
  items.forEach(item => {
    let text = item.textContent.toLowerCase();
    item.style.display = text.includes(search) ? "" : "none";
  });
}

function editCliente(index) {
  let cliente = clientes[index];
  document.getElementById("cnome").value = cliente.nome;
  document.getElementById("ctelefone").value = cliente.telefone;
  // Remove and re-add logic
  deleteCliente(index);
}

function showHistorico(nome) {
  let historico = atendimentos.filter(a => a.nome === nome);
  let body = document.getElementById("modalBody");
  body.innerHTML = "";
  if (historico.length === 0) {
    body.innerHTML = "<p>Nenhum atendimento encontrado.</p>";
  } else {
    historico.forEach(a => {
      let p = document.createElement("p");
      p.innerText = `${a.data} - ${a.corte} - R$${a.valor}`;
      body.appendChild(p);
    });
  }
  document.getElementById("modalTitle").innerText = `Histórico de ${nome}`;
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function checkNotifications() {
  if (Notification.permission === "granted") {
    let hoje = new Date().toISOString().split("T")[0];
    let agora = new Date();
    agendamentos.forEach(a => {
      if (a.data === hoje) {
        let [hora, min] = a.hora.split(":");
        let agendamentoTime = new Date();
        agendamentoTime.setHours(hora, min, 0, 0);
        let diff = (agendamentoTime - agora) / 60000; // minutos
        if (diff > 0 && diff <= 60) { // dentro de 1 hora
          new Notification(`Agendamento em ${diff.toFixed(0)} minutos`, {
            body: `${a.nome} - ${a.telefone}`,
            icon: "./logo.png"
          });
        }
      }
    });
  }
}

function requestNotificationPermission() {
  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        alert("Notificações ativadas!");
      }
    });
  }
}

function populateClienteSelect() {
  let select = document.getElementById("clienteSelect");
  select.innerHTML = '<option value="">Selecione um cliente</option>';

  clientes.forEach(c => {
    let option = document.createElement("option");
    option.value = c.nome;
    option.text = `${c.nome} - ${c.telefone}`;
    select.appendChild(option);
  });
}

function gerarRelatorio() {
  let mes = document.getElementById("mesSelecionado").value;
  let total = 0, clientes = 0;
  let dias = {};

  document.getElementById("listaMes").innerHTML = "";

  atendimentos.forEach(a => {
    if (a.data.startsWith(mes)) {
      total += a.valor;
      clientes++;
      let dia = a.data;
      if (!dias[dia]) dias[dia] = 0;
      dias[dia] += a.valor;

      let li = document.createElement("li");
      li.innerText = `${a.data} - ${a.nome} - ${a.corte} - R$${a.valor}`;
      document.getElementById("listaMes").appendChild(li);
    }
  });

  document.getElementById("fatMes").innerText = total;
  document.getElementById("clientesMes").innerText = clientes;

  // Chart
  let ctx = document.getElementById("chartMes").getContext("2d");
  let labels = Object.keys(dias).sort();
  let data = labels.map(d => dias[d]);
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Faturamento Diário",
        data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)"
      }]
    }
  });

  // Pie Chart for Cuts
  let cutStats = {};
  atendimentos.forEach(a => {
    if (a.data.startsWith(mes)) {
      if (!cutStats[a.corte]) cutStats[a.corte] = 0;
      cutStats[a.corte]++;
    }
  });
  let cutLabels = Object.keys(cutStats);
  let cutData = cutLabels.map(l => cutStats[l]);
  let ctxPie = document.getElementById("chartPizza").getContext("2d");
  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: cutLabels,
      datasets: [{
        data: cutData,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function exportarPDFDia() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let y = 10;
  doc.text("Relatório do Dia", 10, y);

  atendimentos.forEach(a => {
    if (a.data === hoje()) {
      y += 10;
      doc.text(`${a.nome} - R$${a.valor}`, 10, y);
    }
  });

  doc.save("dia.pdf");
}

function exportarPDFMes() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let mes = document.getElementById("mesSelecionado").value;
  let y = 10;

  doc.text("Relatório do Mês", 10, y);

  atendimentos.forEach(a => {
    if (a.data.startsWith(mes)) {
      y += 10;
      doc.text(`${a.data} - ${a.nome} - ${a.corte} - R$${a.valor}`, 10, y);
    }
  });

  doc.save("mes.pdf");
}

function exportarDados() {
  let data = {
    atendimentos,
    agendamentos,
    clientes
  };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "barber_data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importarDados() {
  let file = document.getElementById("importFile").files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let data = JSON.parse(e.target.result);
      atendimentos = data.atendimentos || [];
      agendamentos = data.agendamentos || [];
      clientes = data.clientes || [];
      salvar();
      render();
      alert("Dados importados com sucesso!");
    } catch (err) {
      alert("Erro ao importar dados.");
    }
  };
  reader.readAsText(file);
}

render();

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

setInterval(checkNotifications, 60000); // check every minute