let movimentacoes = [];
let contasFuturas = [];
let graficoPizza, graficoBarras, graficoLinha;

function formatarValor(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

async function atualizarSaldo() {
  movimentacoes = await listarTodos('movimentacoes');
  const saldo = movimentacoes.reduce((t, m) =>
    m.tipo === 'entrada' ? t + m.valor : t - m.valor, 0);
  const saldoSpan = document.getElementById('saldo');
  saldoSpan.textContent = formatarValor(saldo);
  saldoSpan.className = saldo >= 0 ? 'positive' : 'negative';
}

async function exibirMovimentacoes() {
  movimentacoes = await listarTodos('movimentacoes');
  const lista = document.getElementById('movimentacoes');
  lista.innerHTML = '';
  movimentacoes.slice(-5).reverse().forEach(m => {
    const item = document.createElement('li');
    item.textContent = \`\${m.data} - \${m.descricao} - \${formatarValor(m.valor)} (\${m.tipo})\`;
    lista.appendChild(item);
  });
}

async function exibirContasFuturas() {
  contasFuturas = await listarTodos('contasFuturas');
  const lista = document.getElementById('contasFuturas');
  lista.innerHTML = '';
  contasFuturas.forEach(c => {
    const item = document.createElement('li');
    item.textContent = \`\${c.data} - \${c.descricao} - \${formatarValor(c.valor)}\`;
    lista.appendChild(item);
  });
}

async function adicionarMovimentacao() {
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  if (!data || !descricao || isNaN(valor)) return;
  await salvar('movimentacoes', { data, descricao, valor, tipo });
  await atualizarTudo();
}

async function adicionarContaFutura() {
  const data = document.getElementById('dataFutura').value;
  const descricao = document.getElementById('descricaoFutura').value;
  const valor = parseFloat(document.getElementById('valorFutura').value);
  if (!data || !descricao || isNaN(valor)) return;
  await salvar('contasFuturas', { data, descricao, valor });
  await exibirContasFuturas();
}

async function atualizarGraficos() {
  const entradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((t, m) => t + m.valor, 0);
  const saidas = movimentacoes.filter(m => m.tipo === 'saida').reduce((t, m) => t + m.valor, 0);
  const lucro = entradas - saidas;

  if (graficoPizza) graficoPizza.destroy();
  graficoPizza = new Chart(document.getElementById('graficoPizza'), {
    type: 'doughnut',
    data: {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        data: [entradas, saidas],
        backgroundColor: ['#10b981', '#ef4444']
      }]
    }
  });

  if (graficoBarras) graficoBarras.destroy();
  graficoBarras = new Chart(document.getElementById('graficoBarras'), {
    type: 'bar',
    data: {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        label: 'R$',
        data: [entradas, saidas],
        backgroundColor: ['#10b981', '#ef4444']
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  document.getElementById('statusFinanceiro').innerHTML = lucro >= 0
    ? \`💰 <span class="positive">Lucro: \${formatarValor(lucro)}</span>\`
    : \`🔻 <span class="negative">Prejuízo: \${formatarValor(-lucro)}</span>\`;

  if (graficoLinha) graficoLinha.destroy();
  let saldo = 0;
  const datas = [], saldos = [];
  movimentacoes.forEach(m => {
    saldo += m.tipo === 'entrada' ? m.valor : -m.valor;
    datas.push(m.data); saldos.push(saldo);
  });

  graficoLinha = new Chart(document.getElementById('graficoLinha'), {
    type: 'line',
    data: {
      labels: datas,
      datasets: [{
        label: 'Saldo',
        data: saldos,
        borderColor: '#3b82f6',
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4
      }]
    }
  });
}

async function atualizarTudo() {
  await atualizarSaldo();
  await exibirMovimentacoes();
  await exibirContasFuturas();
  await atualizarGraficos();
}

abrirBanco().then(atualizarTudo);
