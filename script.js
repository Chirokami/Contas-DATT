document.addEventListener("DOMContentLoaded", () => {
    // Substitua pelos seus dados do Supabase
    const supabaseUrl = 'https://iibgbagqnyyjheoiubic.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmdiYWdxbnl5amhlb2l1YmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzMzNTgsImV4cCI6MjA2MjIwOTM1OH0.alcpHiae4lLsQg_Tb7N-XQtzNhQspcOz5umorD5eZJg';
  
    // `supabase` aqui é o objeto global da CDN, que expõe createClient
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
    async function carregarDadosDoSupabase() {
      const { data, error } = await supabaseClient
        .from('usuarios')
        .select('valor, tipo, created_at');
  
      if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
      }
  
      // Inicializa arrays com 12 posições (1 por mês)
      const receitasMensais = Array(12).fill(0);
      const despesasMensais = Array(12).fill(0);
  
      data.forEach((item) => {
        const dataRegistro = new Date(item.created_at);
        const mes = dataRegistro.getMonth(); // 0 = janeiro
  
        if (item.tipo === 'entrada') {
          receitasMensais[mes] += parseFloat(item.valor);
        } else if (item.tipo === 'saida') {
          despesasMensais[mes] += parseFloat(item.valor);
        }
      });
  
      desenharGrafico(receitasMensais, despesasMensais);
    }
  
    function desenharGrafico(receitas, despesas) {
      const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
      new Chart(ctx, {
        type: 'line',
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
          plugins: {
            legend: { position: 'top' }
          },
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
  
    // Chamada inicial
    carregarDadosDoSupabase();
  });
  