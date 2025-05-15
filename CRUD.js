// crud.js
// Supondo que você tenha incluído <script src="vendor/supabase.min.js"></script> antes destes scripts

// Substitua pelas suas credenciais
const SUPABASE_URL = 'https://iibgbagqnyyjheoiubic.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmdiYWdxbnl5amhlb2l1YmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzMzNTgsImV4cCI6MjA2MjIwOTM1OH0.alcpHiae4lLsQg_Tb7N-XQtzNhQspcOz5umorD5eZJg';

// Cria o cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Busca todas as contas
async function getContas() {
  const { data, error } = await supabaseClient
    .from('usuarios')
    .select('id, nome, valor, tipo, recibo, created_at');
  if (error) throw error;
  return data;
}

// Insere nova conta
async function addConta(conta) {
  const { error } = await supabaseClient
    .from('usuarios')
    .insert([conta]);
  if (error) throw error;
}

// Atualiza conta existente
async function updateConta(id, conta) {
  const { error } = await supabaseClient
    .from('usuarios')
    .update(conta)
    .eq('id', id);
  if (error) throw error;
}

// Remove conta por UUID
async function deleteConta(id) {
  const { error } = await supabaseClient
    .from('usuarios')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Exponha para o escopo global
window.getContas    = getContas;
window.addConta     = addConta;
window.updateConta  = updateConta;
window.deleteConta  = deleteConta;
