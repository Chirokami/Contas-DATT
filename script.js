let dados = [];
let ordemAtual = { coluna: null, asc: true };
let graficoFinanceiroInstance = null; // <- NOVO: referência ao gráfico atual

const tbody       = document.querySelector('#tabela_contas tbody');
const filtroNome  = document.getElementById('filtroNome');
const filtroTipo  = document.getElementById('filtroTipo');
const form        = document.getElementById('form-conta');

// 1) Ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();
  configurarEventos();
});

// 2) Busca dados e atualiza UI
async function carregarDados() {
  try {
    dados = await getContas();
  } catch (err) {
    console.error('Erro ao buscar contas:', err);
    return;
  }
  filtrarOuOrdenar();
  renderChart();
}

// 3) Filtragem + Ordenação
function filtrarOuOrdenar() {
  let list = dados.slice();
  const n = filtroNome.value.toLowerCase();
  const t = filtroTipo.value;

  // filtro por nome e tipo
  list = list.filter(c =>
    c.nome.toLowerCase().includes(n) &&
    (t === '' || c.tipo === t)
  );

  // ordenação
  if (ordemAtual.coluna) {
    list.sort((a, b) => {
      let va = a[ordemAtual.coluna];
      let vb = b[ordemAtual.coluna];

      if (ordemAtual.coluna === 'valor') {
        va = +va; vb = +vb;
      } else if (ordemAtual.coluna === 'created_at') {
        va = new Date(va); vb = new Date(vb);
      } else {
        va = va.toString().toLowerCase();
        vb = vb.toString().toLowerCase();
      }

      return ordemAtual.asc
        ? (va > vb ? 1 : -1)
        : (va < vb ? 1 : -1);
    });
  }

  renderTabela(list);
}

// 4) Renderiza as linhas da tabela
    function renderTabela(list) {
      tbody.innerHTML = '';
      list.forEach(c => {
        const tr = document.createElement('tr');
        tr.classList.add(c.tipo);
        tr.innerHTML = `
          <td>${c.nome}</td>
          <td>R$ ${parseFloat(c.valor).toFixed(2)}</td>
          <td>${c.tipo}</td>
          <td>${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
          <td>${
            c.recibo
              ? `<a href="${c.recibo}" target="_blank">Recibo</a>`
              : '—'
          }</td>
          <td>
            <button data-edit="${c.id}">✏️</button>
            <button data-delete="${c.id}">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

// 5) Configura todos os event listeners
function configurarEventos() {
  // filtros
  filtroNome.addEventListener('input', filtrarOuOrdenar);
  filtroTipo.addEventListener('change', filtrarOuOrdenar);

  // ordenação clicando no <th>
  document.querySelectorAll('#tabela_contas thead th[data-coluna]')
    .forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.dataset.coluna;
        if (ordemAtual.coluna === col) {
          ordemAtual.asc = !ordemAtual.asc;
        } else {
          ordemAtual.coluna = col;
          ordemAtual.asc = true;
        }
        filtrarOuOrdenar();
      });
    });

  // submit do formulário (cadastro/edição)
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    const conta = Object.fromEntries(f);
    conta.valor = parseFloat(conta.valor);

    try {
      if (conta.id) {
        await updateConta(conta.id, conta);
      } else {
        await addConta(conta);
      }
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
      alert('Falha ao salvar conta');
    }

    form.reset();
    await carregarDados();
  });

  // delegação para editar/excluir
  tbody.addEventListener('click', async e => {
    // editar
    if (e.target.dataset.edit) {
      const idEdit = e.target.dataset.edit;
      const conta  = dados.find(x => x.id === idEdit);
      if (!conta) return;

      Object.keys(conta).forEach(key => {
        const inp = form.querySelector([name="${key}"]);
        if (inp) inp.value = conta[key];
      });
      return;
    }

    // excluir
    if (e.target.dataset.delete && confirm('Excluir esta conta?')) {
      const idDel = e.target.dataset.delete;
      try {
        await deleteConta(idDel);
        await carregarDados();
      } catch (err) {
        console.error('Erro ao excluir conta:', err);
        alert('Falha ao excluir conta');
      }
    }
  });
}



// 6) Gera o gráfico
async function renderChart() {
  const ctx = document
    .getElementById('graficoFinanceiro')
    .getContext('2d');

  // NOVO: destrói o gráfico anterior, se existir
  if (graficoFinanceiroInstance) {
    graficoFinanceiroInstance.destroy();
  }

  const rec = Array(12).fill(0),
        des = Array(12).fill(0);

  dados.forEach(c => {
    const m = new Date(c.created_at).getMonth();
    (c.tipo === 'entrada' ? rec : des)[m] += c.valor;
  });

  graficoFinanceiroInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ],
      datasets: [
        {
          label: 'Receitas',
          data: rec,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Despesas',
          data: des,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}
