document.addEventListener("DOMContentLoaded", async () => { 
  const supabaseUrl = 'https://iibgbagqnyyjheoiubic.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmdiYWdxbnl5amhlb2l1YmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzMzNTgsImV4cCI6MjA2MjIwOTM1OH0.alcpHiae4lLsQg_Tb7N-XQtzNhQspcOz5umorD5eZJg';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const tabela = document.getElementById("tabela_contas");
  const filtroNome = document.getElementById("filtroNome");
  const filtroTipo = document.getElementById("filtroTipo");

  let dadosOriginais = [];
  let ordemAtual = { coluna: null, asc: true };

  async function carregarTabela() {
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("id, nome, valor, tipo, recibo, created_at");

    if (error) {
      console.error("Erro ao buscar dados:", error.message);
      return;
    }

    dadosOriginais = data;
    aplicarFiltros();
  }

  function ordenarDados(dados, coluna) {
    if (ordemAtual.coluna === coluna) {
      ordemAtual.asc = !ordemAtual.asc;
    } else {
      ordemAtual = { coluna, asc: true };
    }

    dados.sort((a, b) => {
      let valA = a[coluna], valB = b[coluna];

      // Para a coluna de data, convertemos para objetos Date para ordenação
      if (coluna === 'created_at') {
        valA = new Date(valA);
        valB = new Date(valB);
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }

      if (valA < valB) return ordemAtual.asc ? -1 : 1;
      if (valA > valB) return ordemAtual.asc ? 1 : -1;
      return 0;
    });
  }

  function renderizarTabela(dados) {
    tabela.innerHTML = "";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th data-coluna="nome">Nome ${iconeOrdenacao('nome')}</th>
        <th data-coluna="valor">Valor (R$) ${iconeOrdenacao('valor')}</th>
        <th data-coluna="tipo">Tipo ${iconeOrdenacao('tipo')}</th>
        <th data-coluna="created_at">Data ${iconeOrdenacao('created_at')}</th>
        <th>Recibo</th>
        <th>Ações</th>
      </tr>
    `;
    tabela.appendChild(thead);

    const tbody = document.createElement("tbody");

    dados.forEach(conta => {
      const tr = document.createElement("tr");
      const reciboLink = conta.recibo ? `<a href="${conta.recibo}" target="_blank">Recibo</a>` : "—";

      tr.innerHTML = `
        <td>${conta.nome}</td>
        <td>R$ ${parseFloat(conta.valor).toFixed(2)}</td>
        <td>${conta.tipo}</td>
        <td>${new Date(conta.created_at).toLocaleDateString('pt-BR')}</td>
        <td>${reciboLink}</td>
        <td>
          <button onclick="editarConta(${conta.id})">Editar</button>
          <button onclick="deletarConta(${conta.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);

      if (conta.tipo === 'entrada') {
        tr.style.backgroundColor = 'rgba(34, 197, 94, 0.7)'; // Cor verde
      } else if (conta.tipo === 'saida') {
        tr.style.backgroundColor = 'rgba(239, 68, 68, 0.7)'; // Cor vermelha
      }
    });

    tabela.appendChild(tbody);

    // Eventos de clique para ordenar
    thead.querySelectorAll("th[data-coluna]").forEach(th => {
      th.style.cursor = "pointer";
      th.onclick = () => {
        ordenarDados(dados, th.dataset.coluna);
        renderizarTabela(dados);
      };
    });
  }

  function aplicarFiltros() {
    const nomeFiltro = filtroNome.value.toLowerCase();
    const tipoFiltro = filtroTipo.value;

    let filtrados = dadosOriginais.filter(conta => {
      const nomeCond = conta.nome.toLowerCase().includes(nomeFiltro);
      const tipoCond = tipoFiltro === "" || conta.tipo === tipoFiltro;
      return nomeCond && tipoCond;
    });

    if (ordemAtual.coluna) {
      ordenarDados(filtrados, ordemAtual.coluna);
    }

    renderizarTabela(filtrados);
  }

  function iconeOrdenacao(coluna) {
    if (ordemAtual.coluna !== coluna) return "↕";
    return ordemAtual.asc ? "↑" : "↓";
  }

  filtroNome.addEventListener("input", aplicarFiltros);
  filtroTipo.addEventListener("change", aplicarFiltros);

  await carregarTabela();

  // Gráfico financeiro
  const { data: dataGrafico, error: erroGrafico } = await supabaseClient
    .from('usuarios')
    .select('valor, tipo, created_at');

  if (erroGrafico) {
    console.error('Erro ao buscar dados do gráfico:', erroGrafico);
    return;
  }

  const receitasMensais = Array(12).fill(0);
  const despesasMensais = Array(12).fill(0);

  dataGrafico.forEach((item) => {
    const mes = new Date(item.created_at).getMonth();
    const valor = parseFloat(item.valor);
    if (item.tipo === 'entrada') receitasMensais[mes] += valor;
    else if (item.tipo === 'saida') despesasMensais[mes] += valor;
  });

  desenharGrafico(receitasMensais, despesasMensais);
});

function desenharGrafico(receitas, despesas) {
  const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Receitas',
          data: receitas,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
        },
        {
          label: 'Despesas',
          data: despesas,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => 'R$ ' + value.toLocaleString('pt-BR')
          }
        }
      }
    }
  });
}
