/**
 * Calculadora Financeira para Varejo de Móveis e Eletrodomésticos
 * Baseada na Árvore de Indicadores Estratégicos
 * Versão 1.0 - 19 de agosto de 2025
 */

// ========================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ========================================

let dados = {
    // Receitas
    qtdMoveis: 0,
    ticketMoveis: 0,
    qtdEletro: 0,
    ticketEletro: 0,
    receitaServicos: 0,
    outrasReceitas: 0,
    
    // Receita Financeira (Crediário)
    montanteFinanciado: 0,
    taxaJurosCredito: 0,
    
    // Custos Variáveis (percentuais)
    custoMoveisPct: 60,      // % sobre receita móveis
    custoEletroPct: 70,      // % sobre receita eletro
    comissoesPct: 5,         // % sobre receita total
    impostosVariaveisPct: 15, // % sobre receita total
    fretes: 0,
    
    // Custos Fixos
    aluguel: 0,
    salarios: 0,
    utilidades: 0,
    seguros: 0,
    marketing: 0,
    outrosCustosFixos: 0,
    
    // Indicadores Operacionais (Nível 4)
    numeroVendas: 0,
    numeroVisitantes: 0,
    valorTotalReceber: 0,
    parcelasAtraso: 0,
    estoqueMedia: 0
};

let graficos = {
    composicao: null,
    gauge: null
};

// ========================================
// FUNÇÕES DE CÁLCULO PRINCIPAL
// ========================================

function calcularReceitas() {
    const receitaMoveis = (dados.qtdMoveis || 0) * (dados.ticketMoveis || 0);
    const receitaEletro = (dados.qtdEletro || 0) * (dados.ticketEletro || 0);
    const receitaServicos = dados.receitaServicos || 0;
    const outrasReceitas = dados.outrasReceitas || 0;
    
    // Receita de Crediário (Financeira)
    const receitaCrediario = (dados.montanteFinanciado || 0) * (dados.taxaJurosCredito || 0) / 100;
    
    const receitaProdutos = receitaMoveis + receitaEletro; // Para cálculo do giro de estoque
    
    return {
        moveis: receitaMoveis,
        eletro: receitaEletro,
        servicos: receitaServicos,
        outras: outrasReceitas,
        crediario: receitaCrediario,
        produtos: receitaProdutos,
        total: receitaMoveis + receitaEletro + receitaServicos + outrasReceitas + receitaCrediario
    };
}

function calcularCustosVariaveis(receitas) {
    const custoMoveis = receitas.moveis * (dados.custoMoveisPct || 0) / 100;
    const custoEletro = receitas.eletro * (dados.custoEletroPct || 0) / 100;
    const comissoes = receitas.total * (dados.comissoesPct || 0) / 100;
    const impostosVariaveis = receitas.total * (dados.impostosVariaveisPct || 0) / 100;
    const fretes = dados.fretes || 0;
    
    return {
        custoMoveis,
        custoEletro,
        comissoes,
        impostosVariaveis,
        fretes,
        total: custoMoveis + custoEletro + comissoes + impostosVariaveis + fretes
    };
}

function calcularCustosFixos() {
    const aluguel = dados.aluguel || 0;
    const salarios = dados.salarios || 0;
    const utilidades = dados.utilidades || 0;
    const seguros = dados.seguros || 0;
    const marketing = dados.marketing || 0;
    const outros = dados.outrosCustosFixos || 0;
    
    return {
        aluguel,
        salarios,
        utilidades,
        seguros,
        marketing,
        outros,
        total: aluguel + salarios + utilidades + seguros + marketing + outros
    };
}

function calcularKPIsOperacionais(receitas, custosVariaveis) {
    // 1. Ticket Médio por Venda
    const numeroVendas = dados.numeroVendas || 0;
    const ticketMedio = numeroVendas > 0 ? receitas.produtos / numeroVendas : 0;
    
    // 2. Taxa de Conversão de Vendas
    const numeroVisitantes = dados.numeroVisitantes || 0;
    const taxaConversao = numeroVisitantes > 0 ? (numeroVendas / numeroVisitantes) * 100 : 0;
    
    // 3. Taxa de Inadimplência do Crediário
    const valorTotalReceber = dados.valorTotalReceber || 0;
    const parcelasAtraso = dados.parcelasAtraso || 0;
    const taxaInadimplencia = valorTotalReceber > 0 ? (parcelasAtraso / valorTotalReceber) * 100 : 0;
    
    // 4. Giro de Estoque
    const estoqueMedia = dados.estoqueMedia || 0;
    const custoTotalProdutos = custosVariaveis.custoMoveis + custosVariaveis.custoEletro;
    const giroEstoque = estoqueMedia > 0 ? (custoTotalProdutos * 12) / estoqueMedia : 0; // Anualizado
    
    return {
        ticketMedio,
        taxaConversao,
        taxaInadimplencia,
        giroEstoque,
        numeroVendas,
        numeroVisitantes,
        valorTotalReceber,
        parcelasAtraso,
        estoqueMedia,
        custoTotalProdutos
    };
}

function calcularIndicadores() {
    const receitas = calcularReceitas();
    const custosVariaveis = calcularCustosVariaveis(receitas);
    const custosFixos = calcularCustosFixos();
    const kpis = calcularKPIsOperacionais(receitas, custosVariaveis);
    
    const margemBruta = receitas.total - custosVariaveis.total;
    const margemContribuicao = margemBruta;
    const lucroLiquido = margemContribuicao - custosFixos.total;
    
    // Percentuais
    const margemBrutaPct = receitas.total > 0 ? (margemBruta / receitas.total) * 100 : 0;
    const margemContribuicaoPct = receitas.total > 0 ? (margemContribuicao / receitas.total) * 100 : 0;
    const margemLiquidaPct = receitas.total > 0 ? (lucroLiquido / receitas.total) * 100 : 0;
    
    // Ponto de Equilíbrio
    const pontoEquilibrioReceita = margemContribuicaoPct > 0 ? (custosFixos.total / (margemContribuicaoPct / 100)) : 0;
    const ticketMedio = ((dados.ticketMoveis || 0) + (dados.ticketEletro || 0)) / 2;
    const pontoEquilibrioUnidades = ticketMedio > 0 ? pontoEquilibrioReceita / ticketMedio : 0;
    
    return {
        receitas,
        custosVariaveis,
        custosFixos,
        kpis,
        margemBruta,
        margemContribuicao,
        lucroLiquido,
        margemBrutaPct,
        margemContribuicaoPct,
        margemLiquidaPct,
        pontoEquilibrioReceita,
        pontoEquilibrioUnidades
    };
}

// ========================================
// ANÁLISES DE IMPACTO DOS KPIs
// ========================================

function analisarImpactoKPIs(indicadores) {
    const { receitas, kpis } = indicadores;
    
    // Análise do Crediário
    let analiseCrediario = "Sem operação de crediário detectada.";
    if (receitas.crediario > 0) {
        const percentualCrediario = (receitas.crediario / receitas.total) * 100;
        analiseCrediario = `Crediário gera R$ ${formatarMoeda(receitas.crediario)} (${percentualCrediario.toFixed(1)}% da receita total). Taxa média: ${dados.taxaJurosCredito}% a.m.`;
    }
    
    // Análise de Vendas
    let analiseVendas = "Dados de vendas não informados.";
    if (kpis.numeroVendas > 0) {
        const statusConversao = kpis.taxaConversao >= 25 ? "Excelente" : 
                               kpis.taxaConversao >= 15 ? "Bom" : 
                               kpis.taxaConversao >= 10 ? "Regular" : "Baixo";
        analiseVendas = `${kpis.numeroVendas} vendas/mês com ticket médio de ${formatarMoeda(kpis.ticketMedio)}. Taxa de conversão: ${kpis.taxaConversao.toFixed(1)}% (${statusConversao}).`;
    }
    
    // Análise de Risco
    let analiseRisco = "Dados de crediário não informados.";
    if (kpis.valorTotalReceber > 0) {
        const nivelRisco = kpis.taxaInadimplencia >= 10 ? "ALTO" : 
                          kpis.taxaInadimplencia >= 5 ? "MÉDIO" : "BAIXO";
        const corRisco = nivelRisco === "ALTO" ? "text-red-600" : 
                        nivelRisco === "MÉDIO" ? "text-yellow-600" : "text-green-600";
        analiseRisco = `Risco ${nivelRisco}: ${kpis.taxaInadimplencia.toFixed(1)}% de inadimplência. Total a receber: ${formatarMoeda(kpis.valorTotalReceber)}.`;
    }
    
    // Análise de Estoque
    let analiseEstoque = "Dados de estoque não informados.";
    if (kpis.estoqueMedia > 0) {
        const statusGiro = kpis.giroEstoque >= 6 ? "Ótimo" : 
                          kpis.giroEstoque >= 4 ? "Bom" : 
                          kpis.giroEstoque >= 2 ? "Regular" : "Baixo";
        analiseEstoque = `Giro de ${kpis.giroEstoque.toFixed(1)}x/ano (${statusGiro}). Estoque médio: ${formatarMoeda(kpis.estoqueMedia)}.`;
    }
    
    return {
        analiseCrediario,
        analiseVendas,
        analiseRisco,
        analiseEstoque
    };
}

function gerarAlertasKPI(kpis) {
    const alertas = [];
    
    // Alertas de conversão
    if (kpis.taxaConversao > 0 && kpis.taxaConversao < 10) {
        alertas.push({
            tipo: 'warning',
            icone: 'fa-exclamation-triangle',
            titulo: 'Taxa de Conversão Baixa',
            descricao: `${kpis.taxaConversao.toFixed(1)}% - Abaixo da média (15-25%)`
        });
    }
    
    // Alertas de inadimplência
    if (kpis.taxaInadimplencia > 5) {
        alertas.push({
            tipo: 'danger',
            icone: 'fa-exclamation-circle',
            titulo: 'Inadimplência Elevada',
            descricao: `${kpis.taxaInadimplencia.toFixed(1)}% - Acima do recomendado (< 5%)`
        });
    }
    
    // Alertas de giro de estoque
    if (kpis.giroEstoque > 0 && kpis.giroEstoque < 3) {
        alertas.push({
            tipo: 'warning',
            icone: 'fa-boxes',
            titulo: 'Giro de Estoque Baixo',
            descricao: `${kpis.giroEstoque.toFixed(1)}x/ano - Abaixo do ideal (4-6x)`
        });
    }
    
    // Alertas de ticket médio
    if (kpis.ticketMedio > 0 && kpis.ticketMedio < 1000) {
        alertas.push({
            tipo: 'info',
            icone: 'fa-arrow-up',
            titulo: 'Oportunidade de Ticket Médio',
            descricao: `${formatarMoeda(kpis.ticketMedio)} - Potencial para aumentar`
        });
    }
    
    return alertas;
}

// ========================================
// FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE
// ========================================

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

function formatarPercental(valor) {
    return `${(valor || 0).toFixed(1)}%`;
}

function atualizarInterface() {
    const indicadores = calcularIndicadores();
    
    // Header Principal
    document.getElementById('lucroLiquido').textContent = formatarMoeda(indicadores.lucroLiquido);
    document.getElementById('margemLiquida').textContent = `Margem: ${formatarPercental(indicadores.margemLiquidaPct)}`;
    
    // Indicador visual do lucro
    const indicadorLucro = document.getElementById('indicadorLucro');
    if (indicadores.lucroLiquido > 0) {
        indicadorLucro.className = 'w-4 h-4 rounded-full bg-green-400 pulse-green';
    } else if (indicadores.lucroLiquido < 0) {
        indicadorLucro.className = 'w-4 h-4 rounded-full bg-red-400 pulse-red';
    } else {
        indicadorLucro.className = 'w-4 h-4 rounded-full bg-yellow-400';
    }
    
    // Cards de Resumo
    document.getElementById('receitaTotal').textContent = formatarMoeda(indicadores.receitas.total);
    document.getElementById('custosVariaveis').textContent = formatarMoeda(indicadores.custosVariaveis.total);
    document.getElementById('custosFixos').textContent = formatarMoeda(indicadores.custosFixos.total);
    document.getElementById('margemContribuicao').textContent = formatarMoeda(indicadores.margemContribuicao);
    
    // Percentuais dos cards
    document.getElementById('percentualReceita').textContent = '100% da operação';
    document.getElementById('percentualCustosVar').textContent = `${formatarPercental(indicadores.receitas.total > 0 ? (indicadores.custosVariaveis.total / indicadores.receitas.total) * 100 : 0)} da receita`;
    document.getElementById('percentualCustosFixos').textContent = `${formatarPercental(indicadores.receitas.total > 0 ? (indicadores.custosFixos.total / indicadores.receitas.total) * 100 : 0)} da receita`;
    document.getElementById('percentualMargemCont').textContent = `${formatarPercental(indicadores.margemContribuicaoPct)} da receita`;
    
    // Valores calculados nas seções de input
    document.getElementById('receitaMoveis').textContent = `= ${formatarMoeda(indicadores.receitas.moveis)}`;
    document.getElementById('receitaEletro').textContent = `= ${formatarMoeda(indicadores.receitas.eletro)}`;
    document.getElementById('receitaCrediario').textContent = `= ${formatarMoeda(indicadores.receitas.crediario)}`;
    
    document.getElementById('custoMoveis').textContent = formatarMoeda(indicadores.custosVariaveis.custoMoveis);
    document.getElementById('custoEletro').textContent = formatarMoeda(indicadores.custosVariaveis.custoEletro);
    document.getElementById('comissoes').textContent = formatarMoeda(indicadores.custosVariaveis.comissoes);
    document.getElementById('impostosVariaveis').textContent = formatarMoeda(indicadores.custosVariaveis.impostosVariaveis);
    
    // KPIs Operacionais
    document.getElementById('ticketMedioCalculado').textContent = `Ticket Médio: ${formatarMoeda(indicadores.kpis.ticketMedio)}`;
    document.getElementById('taxaConversao').textContent = `Taxa Conversão: ${indicadores.kpis.taxaConversao.toFixed(1)}%`;
    document.getElementById('taxaInadimplencia').textContent = `Inadimplência: ${indicadores.kpis.taxaInadimplencia.toFixed(1)}%`;
    document.getElementById('giroEstoque').textContent = `Giro de Estoque: ${indicadores.kpis.giroEstoque.toFixed(1)}x/ano`;
    
    // Ponto de Equilíbrio
    document.getElementById('pontoEquilibrioReceita').textContent = formatarMoeda(indicadores.pontoEquilibrioReceita);
    document.getElementById('pontoEquilibrioUnidades').textContent = `${Math.ceil(indicadores.pontoEquilibrioUnidades)} un.`;
    
    // Progresso do equilíbrio
    const progressoEquilibrio = indicadores.pontoEquilibrioReceita > 0 ? 
        Math.min((indicadores.receitas.total / indicadores.pontoEquilibrioReceita) * 100, 100) : 0;
    document.getElementById('progressoEquilibrio').style.width = `${progressoEquilibrio}%`;
    
    const statusTexts = {
        0: 'Sem receita',
        25: 'Muito abaixo',
        50: 'Abaixo do equilíbrio',
        75: 'Próximo do equilíbrio',
        100: 'Equilíbrio atingido'
    };
    
    let statusKey = 0;
    if (progressoEquilibrio >= 100) statusKey = 100;
    else if (progressoEquilibrio >= 75) statusKey = 75;
    else if (progressoEquilibrio >= 50) statusKey = 50;
    else if (progressoEquilibrio >= 25) statusKey = 25;
    
    document.getElementById('statusEquilibrio').textContent = statusTexts[statusKey];
    
    // Indicadores de Margem
    document.getElementById('margemBrutaValor').textContent = formatarMoeda(indicadores.margemBruta);
    document.getElementById('margemBrutaPct').textContent = formatarPercental(indicadores.margemBrutaPct);
    
    document.getElementById('margemContribuicaoValor').textContent = formatarMoeda(indicadores.margemContribuicao);
    document.getElementById('margemContribuicaoPct').textContent = formatarPercental(indicadores.margemContribuicaoPct);
    
    document.getElementById('margemLiquidaValor').textContent = formatarMoeda(indicadores.lucroLiquido);
    document.getElementById('margemLiquidaPct').textContent = formatarPercental(indicadores.margemLiquidaPct);
    
    // Dashboard de KPIs
    document.getElementById('kpiTicketMedio').textContent = formatarMoeda(indicadores.kpis.ticketMedio);
    document.getElementById('kpiTaxaConversao').textContent = `${indicadores.kpis.taxaConversao.toFixed(1)}%`;
    document.getElementById('kpiInadimplencia').textContent = `${indicadores.kpis.taxaInadimplencia.toFixed(1)}%`;
    document.getElementById('kpiGiroEstoque').textContent = `${indicadores.kpis.giroEstoque.toFixed(1)}x`;
    
    // Análises de Impacto
    const analises = analisarImpactoKPIs(indicadores);
    document.getElementById('analiseCrediario').textContent = analises.analiseCrediario;
    document.getElementById('analiseVendas').textContent = analises.analiseVendas;
    document.getElementById('analiseRisco').textContent = analises.analiseRisco;
    document.getElementById('analiseEstoque').textContent = analises.analiseEstoque;
    
    // Alertas de KPI
    const alertas = gerarAlertasKPI(indicadores.kpis);
    const containerAlertas = document.getElementById('alertasKPI');
    containerAlertas.innerHTML = '';
    
    if (alertas.length === 0) {
        containerAlertas.innerHTML = '<div class="text-sm text-green-600 p-2 bg-green-50 rounded-lg">✅ Todos os KPIs estão dentro dos parâmetros recomendados</div>';
    } else {
        alertas.forEach(alerta => {
            const cores = {
                danger: 'bg-red-50 border-red-200 text-red-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700'
            };
            
            const alertaHtml = `
                <div class="p-2 rounded-lg border ${cores[alerta.tipo]}">
                    <div class="flex items-center text-sm">
                        <i class="fas ${alerta.icone} mr-2"></i>
                        <div>
                            <span class="font-medium">${alerta.titulo}:</span>
                            <span class="ml-1">${alerta.descricao}</span>
                        </div>
                    </div>
                </div>
            `;
            containerAlertas.innerHTML += alertaHtml;
        });
    }
    
    // Atualizar gráficos
    atualizarGraficos(indicadores);
}

// ========================================
// FUNÇÕES DOS GRÁFICOS
// ========================================

function criarGraficoComposicao(indicadores) {
    const ctx = document.getElementById('chartComposicao').getContext('2d');
    
    if (graficos.composicao) {
        graficos.composicao.destroy();
    }
    
    const data = {
        labels: ['Lucro Líquido', 'Custos Fixos', 'Custos Variáveis'],
        datasets: [{
            data: [
                Math.max(indicadores.lucroLiquido, 0),
                indicadores.custosFixos.total,
                indicadores.custosVariaveis.total
            ],
            backgroundColor: [
                indicadores.lucroLiquido > 0 ? '#10B981' : '#EF4444',
                '#F59E0B',
                '#EF4444'
            ],
            borderColor: '#ffffff',
            borderWidth: 3
        }]
    };
    
    graficos.composicao = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = indicadores.receitas.total;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                            return `${context.label}: ${formatarMoeda(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function criarGaugeChart(indicadores) {
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    
    if (graficos.gauge) {
        graficos.gauge.destroy();
    }
    
    const margemPct = Math.max(-50, Math.min(50, indicadores.margemLiquidaPct));
    const normalizedValue = ((margemPct + 50) / 100) * 180; // 0-180 graus
    
    graficos.gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [normalizedValue, 180 - normalizedValue, 180],
                backgroundColor: [
                    margemPct > 10 ? '#10B981' : margemPct > 0 ? '#F59E0B' : '#EF4444',
                    '#E5E7EB',
                    'transparent'
                ],
                borderWidth: 0,
                cutout: '75%',
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            animation: {
                animateRotate: true,
                duration: 1500
            }
        },
        plugins: [{
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const centerX = chart.width / 2;
                const centerY = chart.height / 2 + 20;
                
                // Valor principal
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = margemPct > 10 ? '#10B981' : margemPct > 0 ? '#F59E0B' : '#EF4444';
                ctx.font = 'bold 28px Inter';
                ctx.fillText(`${margemPct.toFixed(1)}%`, centerX, centerY - 10);
                
                // Label
                ctx.fillStyle = '#6B7280';
                ctx.font = '14px Inter';
                ctx.fillText('Margem Líquida', centerX, centerY + 20);
                
                // Escala
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '12px Inter';
                ctx.fillText('-50%', centerX - 80, centerY + 45);
                ctx.fillText('0%', centerX, centerY + 45);
                ctx.fillText('+50%', centerX + 80, centerY + 45);
                
                ctx.restore();
            }
        }]
    });
}

function atualizarGraficos(indicadores) {
    criarGraficoComposicao(indicadores);
    criarGaugeChart(indicadores);
}

// ========================================
// FUNÇÕES DE ENTRADA DE DADOS
// ========================================

function setupInputListeners() {
    // Receitas
    ['qtdMoveis', 'ticketMoveis', 'qtdEletro', 'ticketEletro', 'receitaServicos', 'outrasReceitas'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                dados[id] = parseFloat(e.target.value) || 0;
                atualizarInterface();
            });
        }
    });
    
    // Receita Financeira (Crediário)
    ['montanteFinanciado', 'taxaJurosCredito'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                dados[id] = parseFloat(e.target.value) || 0;
                atualizarInterface();
            });
        }
    });
    
    // Custos Variáveis (percentuais)
    ['custoMoveisPct', 'custoEletroPct', 'comissoesPct', 'impostosVariaveisPct'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                dados[id] = parseFloat(e.target.value) || 0;
                atualizarInterface();
            });
        }
    });
    
    // Custos Variáveis (valores)
    const inputFretes = document.getElementById('fretes');
    if (inputFretes) {
        inputFretes.addEventListener('input', (e) => {
            dados.fretes = parseFloat(e.target.value) || 0;
            atualizarInterface();
        });
    }
    
    // Custos Fixos
    ['aluguel', 'salarios', 'utilidades', 'seguros', 'marketing', 'outrosCustosFixos'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                dados[id] = parseFloat(e.target.value) || 0;
                atualizarInterface();
            });
        }
    });
    
    // Indicadores Operacionais (KPIs)
    ['numeroVendas', 'numeroVisitantes', 'valorTotalReceber', 'parcelasAtraso', 'estoqueMedia'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                dados[id] = parseFloat(e.target.value) || 0;
                atualizarInterface();
            });
        }
    });
}

// ========================================
// FUNÇÕES DE CONTROLE
// ========================================

function carregarExemplo() {
    // Exemplo realístico para loja de móveis e eletro
    dados = {
        // Receitas
        qtdMoveis: 45,
        ticketMoveis: 2800,
        qtdEletro: 120,
        ticketEletro: 1200,
        receitaServicos: 25000,
        outrasReceitas: 8000,
        
        // Receita Financeira (Crediário)
        montanteFinanciado: 800000,
        taxaJurosCredito: 3.2,
        
        // Custos Variáveis (percentuais)
        custoMoveisPct: 62,
        custoEletroPct: 72,
        comissoesPct: 4.5,
        impostosVariaveisPct: 16.2,
        fretes: 18000,
        
        // Custos Fixos
        aluguel: 35000,
        salarios: 85000,
        utilidades: 12000,
        seguros: 8500,
        marketing: 15000,
        outrosCustosFixos: 6500,
        
        // Indicadores Operacionais (KPIs)
        numeroVendas: 165,
        numeroVisitantes: 850,
        valorTotalReceber: 1200000,
        parcelasAtraso: 45000,
        estoqueMedia: 320000
    };
    
    // Atualizar inputs
    Object.keys(dados).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = dados[key];
        }
    });
    
    atualizarInterface();
    
    // Mostrar notificação
    mostrarNotificacao('Exemplo carregado com dados completos!', 'success');
}

function resetCalculadora() {
    if (confirm('Tem certeza que deseja resetar todos os valores?')) {
        dados = {
            qtdMoveis: 0, ticketMoveis: 0, qtdEletro: 0, ticketEletro: 0,
            receitaServicos: 0, outrasReceitas: 0, montanteFinanciado: 0,
            taxaJurosCredito: 0, custoMoveisPct: 60, custoEletroPct: 70, 
            comissoesPct: 5, impostosVariaveisPct: 15, fretes: 0, 
            aluguel: 0, salarios: 0, utilidades: 0, seguros: 0, 
            marketing: 0, outrosCustosFixos: 0, numeroVendas: 0,
            numeroVisitantes: 0, valorTotalReceber: 0, parcelasAtraso: 0,
            estoqueMedia: 0
        };
        
        // Limpar inputs
        document.querySelectorAll('input').forEach(input => {
            if (input.id === 'custoMoveisPct') input.value = 60;
            else if (input.id === 'custoEletroPct') input.value = 70;
            else if (input.id === 'comissoesPct') input.value = 5;
            else if (input.id === 'impostosVariaveisPct') input.value = 15;
            else input.value = '';
        });
        
        atualizarInterface();
        mostrarNotificacao('Calculadora resetada!', 'info');
    }
}

function gerarCenarios() {
    const indicadores = calcularIndicadores();
    const lucroAtual = indicadores.lucroLiquido;
    const margemAtual = indicadores.margemLiquidaPct;
    
    // Cenário Pessimista (-20%)
    const lojaPessimista = { ...dados };
    ['qtdMoveis', 'qtdEletro', 'receitaServicos', 'outrasReceitas'].forEach(key => {
        lojaPessimista[key] *= 0.8;
    });
    const indicadoresPessimistas = calcularIndicadoresComDados(lojaPessimista);
    
    // Cenário Otimista (+20%)
    const lojaOtimista = { ...dados };
    ['qtdMoveis', 'qtdEletro', 'receitaServicos', 'outrasReceitas'].forEach(key => {
        lojaOtimista[key] *= 1.2;
    });
    const indicadoresOtimistas = calcularIndicadoresComDados(lojaOtimista);
    
    // Atualizar interface de cenários
    document.getElementById('cenarioPessimista').textContent = formatarMoeda(indicadoresPessimistas.lucroLiquido);
    document.getElementById('cenarioPessimistaPct').textContent = formatarPercental(indicadoresPessimistas.margemLiquidaPct);
    
    document.getElementById('cenarioAtual').textContent = formatarMoeda(lucroAtual);
    document.getElementById('cenarioAtualPct').textContent = formatarPercental(margemAtual);
    
    document.getElementById('cenarioOtimista').textContent = formatarMoeda(indicadoresOtimistas.lucroLiquido);
    document.getElementById('cenarioOtimistaPct').textContent = formatarPercental(indicadoresOtimistas.margemLiquidaPct);
    
    // Mostrar seção de cenários
    document.getElementById('cenariosSection').style.display = 'block';
    
    mostrarNotificacao('Cenários gerados com sucesso!', 'success');
}

function calcularIndicadoresComDados(dadosTemp) {
    const dadosOriginais = dados;
    dados = dadosTemp;
    const resultado = calcularIndicadores();
    dados = dadosOriginais;
    return resultado;
}

function exportarDados() {
    const indicadores = calcularIndicadores();
    
    const relatorio = {
        data: new Date().toLocaleDateString('pt-BR'),
        empresa: 'Varejo de Móveis e Eletrodomésticos',
        inputs: dados,
        resultados: {
            receitas: indicadores.receitas,
            custosVariaveis: indicadores.custosVariaveis,
            custosFixos: indicadores.custosFixos,
            lucroLiquido: indicadores.lucroLiquido,
            margemLiquidaPct: indicadores.margemLiquidaPct,
            pontoEquilibrio: {
                receita: indicadores.pontoEquilibrioReceita,
                unidades: indicadores.pontoEquilibrioUnidades
            }
        }
    };
    
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    mostrarNotificacao('Relatório exportado com sucesso!', 'success');
}

function mostrarNotificacao(texto, tipo) {
    const cores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notificacao = document.createElement('div');
    notificacao.className = `fixed top-4 right-4 ${cores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notificacao.textContent = texto;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notificacao.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    setupInputListeners();
    atualizarInterface();
    
    // Carregar valores padrão nos campos percentuais
    document.getElementById('custoMoveisPct').value = 60;
    document.getElementById('custoEletroPct').value = 70;
    document.getElementById('comissoesPct').value = 5;
    document.getElementById('impostosVariaveisPct').value = 15;
    document.getElementById('taxaJurosCredito').value = 2.5;
    
    dados.custoMoveisPct = 60;
    dados.custoEletroPct = 70;
    dados.comissoesPct = 5;
    dados.impostosVariaveisPct = 15;
    dados.taxaJurosCredito = 2.5; // Taxa padrão de 2.5% a.m.
    
    console.log('Calculadora Financeira carregada com sucesso!');
    console.log('Versão 1.0 - Árvore de Indicadores Estratégicos');
});