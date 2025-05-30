const form = document.getElementById('login-form');
const mensagemErro = document.getElementById('mensagem-erro');

const btnVisitante = document.getElementById('btn-visitante');

btnVisitante.addEventListener('click', () => {
  window.location.href = 'index.html?visitor=true';
});

form.addEventListener('submit', async function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    mensagemErro.textContent = 'E-mail ou senha incorretos.';
    console.error('Erro:', error);
  } else {
    mensagemErro.textContent = '';
    console.log('Login realizado com sucesso:', data);
    localStorage.setItem('usuarioLogado', JSON.stringify(data));
    window.location.href = 'index.html';
  }
});
