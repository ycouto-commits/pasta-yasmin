// ==========================================================================
// SCRIPT.JS - MONITOR DE CLIMA E INTERAÇÕES SAZONAIS AERO VIBE
// ==========================================================================

const API_KEY = 'b712330a6e386a34731a541604a8b79b'; // Chave pública demonstrativa OpenWeatherMap
const LANG = 'pt_br';

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa a lógica de efeitos baseada no mês atual do sistema
    configurarEstacaoDoAno();

    // Vincula o evento do botão de pesquisa
    const botaoBusca = document.getElementById('buscar-btn');
    if (botaoBusca) {
        botaoBusca.addEventListener('click', executarBuscaClimatica);
    }

    // Permite que o usuário aperte "Enter" no input para disparar a busca
    const campoInput = document.getElementById('cidade-input');
    if (campoInput) {
        campoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executarBuscaClimatica();
            }
        });
    }
});

// 1. FUNÇÃO DE INTEGRAÇÃO COM A API DE CLIMA
async function executarBuscaClimatica() {
    const cidadeInput = document.getElementById('cidade-input');
    const cidade = cidadeInput ? cidadeInput.value.trim() : "";
    
    if (!cidade) return alert("Por favor, digite o nome de uma cidade!");

    try {
        // Busca o clima atual
        const respostaAtual = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=${LANG}`);
        const dadosAtuais = await respostaAtual.json();

        // VALIDAÇÃO IMEDIATA: Verifica se a cidade foi encontrada na primeira API
        if (Number(dadosAtuais.cod) !== 200) {
            alert("Cidade não encontrada. Tente reescrever o nome corretamente.");
            return;
        }

        // Busca a previsão para 5 dias (só faz se a cidade realmente existir)
        const respostaPrevisao = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=${LANG}`);
        const dadosPrevisao = await respostaPrevisao.json();

        atualizarInterfaceInterface(dadosAtuais, dadosPrevisao);

    } catch (erro) {
        console.error("Erro ao buscar dados do clima:", erro);
        alert("Erro ao conectar com o serviço de meteorologia.");
    }
}

// Renderiza os resultados da API no arquivo HTML
function atualizarInterfaceInterface(atual, previsao) {
    const containerAtual = document.getElementById('clima-tempo-real');
    if (containerAtual) {
        containerAtual.innerHTML = `
            <h3 style="color: #00569d; font-size: 1.4rem;">${atual.name}, ${atual.sys.country}</h3>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0.5rem 0;">
                <img src="https://openweathermap.org/img/wn/${atual.weather[0].icon}@2x.png" alt="Ícone do tempo" style="width: 60px; height: 60px;">
                <span style="font-size: 2.5rem; font-weight: bold; color: #1e1e1e;">${Math.round(atual.main.temp)}°C</span>
            </div>
            <p style="text-transform: capitalize; font-weight: 500; margin-bottom: 0.5rem;">Condição: ${atual.weather[0].description}</p>
            <p style="font-size: 0.9rem; color: #555;">Umidade: <strong>${atual.main.humidity}%</strong> | Vento: <strong>${atual.wind.speed} km/h</strong></p>
        `;
    }

    const containerPrevisao = document.getElementById('previsao-dias');
    if (containerPrevisao) {
        containerPrevisao.innerHTML = '';
        
        // A API retorna dados de 3 em 3 horas. Pulamos de 8 em 8 registros para capturar 1 amostra por dia (24h).
        for (let i = 0; i < previsao.list.length; i += 8) {
            const dia = previsao.list[i];
            
            // CORREÇÃO: Substitui o espaço por 'T' para evitar bugs de data em navegadores como o Safari
            const dataObjeto = new Date(dia.dt_txt.replace(" ", "T"));
            const dataFormatada = dataObjeto.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });

            containerPrevisao.innerHTML += `
                <div class="card-previsao">
                    <h4 style="color: #004480; text-transform: capitalize; font-size: 0.95rem;">${dataFormatada}</h4>
                    <img src="https://openweathermap.org/img/wn/${dia.weather[0].icon}.png" alt="Ícone previsao">
                    <p style="font-weight: bold; font-size: 1.2rem; color: #222;">${Math.round(dia.main.temp)}°C</p>
                    <p style="font-size: 0.75rem; color: #666; text-transform: capitalize;">${dia.weather[0].description}</p>
                </div>
            `;
        }
    }
}

// 2. LÓGICA DAS ESTAÇÕES E ELEMENTOS VISUAIS DINÂMICOS
function configurarEstacaoDoAno() {
    const dataAtual = new Date();
    const mes = dataAtual.getMonth() + 1; 
    const dia = dataAtual.getDate();

    let estacao = "";

    // Regra temporal para o Hemisfério Sul (Brasil)
    if ((mes === 12 && dia >= 21) || mes === 1 || mes === 2 || (mes === 3 && dia < 20)) {
        estacao = "VERAO";
    } else if ((mes === 3 && dia >= 20) || mes === 4 || mes === 5 || (mes === 6 && dia < 21)) {
        estacao = "OUTONO";
    } else if ((mes === 6 && dia >= 21) || mes === 7 || mes === 8 || (mes === 9 && dia < 22)) {
        estacao = "INVERNO";
    } else {
        estacao = "PRIMAVERA";
    }

    if (estacao === "VERAO") {
        criarSolzinhoVerao();
    } else if (estacao === "OUTONO") {
        criarFolhasOutono();
    }
}

function criarSolzinhoVerao() {
    const sol = document.createElement('div');
    sol.id = 'sol-verao';
    sol.innerHTML = '☀️';
    sol.style.position = 'fixed';
    sol.style.top = '20px';
    sol.style.right = '20px';
    sol.style.fontSize = '3.5rem';
    sol.style.zIndex = '9999';
    sol.style.cursor = 'pointer';
    sol.style.transition = 'transform 0.5s ease';
    sol.title = "Clique em mim! O Verão está radiante!";

    sol.addEventListener('mouseover', () => {
        sol.style.transform = 'scale(1.3) rotate(45deg)';
    });
    sol.addEventListener('mouseleave', () => {
        sol.style.transform = 'scale(1) rotate(0deg)';
    });
    sol.addEventListener('click', () => {
        alert("🌞 Sol de Verão: Lembre-se de se hidratar bem e aproveitar o dia!");
    });

    document.body.appendChild(sol);
}

function criarFolhasOutono() {
    const quantidadeFolhas = 8; 
    const emojisFolhas = ['🍂', '🍁', '🍃'];

    for (let i = 0; i < quantidadeFolhas; i++) {
        const folha = document.createElement('div');
        folha.className = 'folha-outono';
        folha.innerHTML = emojisFolhas[Math.floor(Math.random() * emojisFolhas.length)];
        
        folha.style.position = 'fixed';
        folha.style.bottom = `${Math.random() * 30 + 65}px`; 
        folha.style.left = `${Math.random() * 92}%`;
        folha.style.fontSize = `${Math.random() * 1 + 1.5}rem`;
        folha.style.zIndex = '9999';
        folha.style.cursor = 'pointer';
        folha.style.userSelect = 'none';
        folha.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        folha.title = "Clique para chutar a folha!";

        folha.addEventListener('click', () => {
            folha.style.transform = 'translateY(-120px) rotate(360deg) scale(0)';
            folha.style.opacity = '0';
            setTimeout(() => {
                folha.remove();
            }, 400);
        });

        folha.addEventListener('mouseover', () => {
            folha.style.transform = 'translateY(-10px) translateX(10px) rotate(15deg)';
        });
        folha.addEventListener('mouseleave', () => {
            folha.style.transform = 'translateY(0) translateX(0) rotate(0deg)';
        });

        document.body.appendChild(folha);
    }
}
