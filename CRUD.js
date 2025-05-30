

// resgata dados
async function getContas() {
  const { data, error } = await supabaseClient
    .from('usuarios')
    .select('id, nome, valor, tipo, recibo, created_at');
  if (error) throw error;
  return data;
}

// insert
async function addConta(conta) {
  const { error } = await supabaseClient
    .from('usuarios')
    .insert([conta]);
  if (error) throw error;
}

// update
async function updateConta(id, conta) {
  const { error } = await supabaseClient
    .from('usuarios')
    .update(conta)
    .eq('id', id);
  if (error) throw error;
}

// delete
async function deleteConta(id) {
  const { error } = await supabaseClient
    .from('usuarios')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// manda funções para o script.js
window.getContas    = getContas;
window.addConta     = addConta;
window.updateConta  = updateConta;
window.deleteConta  = deleteConta;
