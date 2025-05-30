let dados = [];

const tbody = document.querySelector('#tabela_contas tbody');
const form = document.getElementById('form_cadastro');
const BUCKET = 'recibos';

const urlParams = new URLSearchParams(window.location.search);
const isVisitor = urlParams.get('visitor') === 'true';

if (isVisitor) {
  localStorage.setItem('modoVisitante', 'true');
} else {
  localStorage.removeItem('modoVisitante');
}

window.addEventListener('DOMContentLoaded', async () => {
  if (isVisitor) {
    document.querySelector('.formulario').style.display = 'none';
    document.querySelectorAll('#tabela_contas th:last-child, #tabela_contas td:last-child')
      .forEach(el => el.style.display = 'none');
  }
  await carregarDados();
  configurarEventos();
});

async function carregarDados() {
  try {
    dados = await getContas();
  } catch (err) {
    console.error('Erro ao buscar contas:', err);
    return;
  }
  renderTabela(dados);
}

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
    `;
    if (!isVisitor) {
      tr.innerHTML += `
        <td>
          <button class="btn"data-delete="${c.id}">Excluir</button>
        </td>
      `;
    }
    tbody.appendChild(tr);
  });
}

function configurarEventos() {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    const conta = Object.fromEntries(f);
    conta.valor = parseFloat(conta.valor);

    const imagemFile = f.get('recibo');
    if (imagemFile && imagemFile.size > 0) {
      const nomeArquivo = `${Date.now()}_${imagemFile.name}`;
      const { data, error } = await supabaseClient.storage
        .from(BUCKET)
        .upload(nomeArquivo, imagemFile);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error.message);
        alert('Erro ao enviar imagem');
        return;
      }

      const { data: publicUrlData } = supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(nomeArquivo);

      conta.recibo = publicUrlData.publicUrl;
    }

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

  tbody.addEventListener('click', async e => {
    if (!isVisitor) {
      if (e.target.dataset.edit) {
        const idEdit = e.target.dataset.edit;
        const conta = dados.find(x => x.id == idEdit);
        if (!conta) return;

        Object.keys(conta).forEach(key => {
          const inp = form.querySelector(`[name="${key}"]`);
          if (inp) inp.value = conta[key];
        });
        return;
      }

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
    }
  });
}
