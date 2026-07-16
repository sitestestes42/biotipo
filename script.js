/* ==================== NAVEGAÇÃO SUAVE ENTRE PÁGINAS ==================== */
// Intercepta cliques em links internos para transição sem refresh completo
document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  // Apenas links internos (não externos, não âncoras)
  if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel')) {
    e.preventDefault();
    navigateTo(href);
  }
});

function navigateTo(url) {
  // Animação de saída
  document.body.classList.add('fade-transition');
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Substitui o conteúdo do body
        document.body.innerHTML = doc.body.innerHTML;
        
        // Atualiza o título e o head (meta tags, etc.)
        document.title = doc.title;
        const oldHeadLinks = document.head.querySelectorAll('link[rel="stylesheet"], meta');
        oldHeadLinks.forEach(el => el.remove());
        doc.head.querySelectorAll('link[rel="stylesheet"], meta').forEach(el => {
          document.head.appendChild(el.cloneNode(true));
        });
        
        // Reexecuta scripts (o script principal já está carregado, mas novos scripts inline podem existir)
        // Não é necessário reexecutar script.js pois ele já está no escopo
        // Apenas reatribui eventos que dependem do DOM
        initPageSpecific();
        
        // Atualiza URL
        history.pushState(null, doc.title, url);
        
        // Animação de entrada
        document.body.style.opacity = '1';
        document.body.classList.remove('fade-transition');
        window.scrollTo(0, 0);
      })
      .catch(err => {
        console.error('Erro ao navegar:', err);
        window.location.href = url; // fallback
      });
  }, 200);
}

// Trata navegação do histórico (botões voltar/avançar)
window.addEventListener('popstate', function () {
  location.reload(); // Simples, mas eficaz; poderia ser melhorado com fetch.
});

/* ==================== INICIALIZAÇÕES POR PÁGINA ==================== */
function initPageSpecific() {
  // Menu mobile toggle
  const navToggle = document.getElementById('navToggle');
  const navList = document.querySelector('.nav__list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });
  }

  // Inicializa questionário se estiver na página de questionário
  if (document.getElementById('quiz-container')) {
    initQuiz();
  }

  // Inicializa resultado se estiver na página de resultado
  if (document.getElementById('resultado-content')) {
    initResultado();
  }

  // Animação fade-in-up nos elementos quando visíveis (interseção)
  const fadeElements = document.querySelectorAll('.fade-in-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    observer.observe(el);
  });
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', initPageSpecific);

/* ==================== QUESTIONÁRIO ==================== */
const perguntas = [
  { pergunta: 'Como é sua estrutura óssea?', opcoes: ['Fina', 'Média', 'Larga'], pontos: [1, 2, 3] },
  { pergunta: 'Você tem facilidade para ganhar peso?', opcoes: ['Muita dificuldade', 'Moderada', 'Muita facilidade'], pontos: [1, 2, 3] },
  { pergunta: 'Você tem facilidade para perder peso?', opcoes: ['Muita facilidade', 'Moderada', 'Muita dificuldade'], pontos: [1, 2, 3] },
  { pergunta: 'Como é seu nível de energia durante o dia?', opcoes: ['Baixo', 'Médio', 'Alto'], pontos: [3, 2, 1] },
  { pergunta: 'Você prefere treinos...', opcoes: ['Longos e leves', 'Moderados', 'Curtos e intensos'], pontos: [1, 2, 3] },
  { pergunta: 'Como é seu apetite?', opcoes: ['Pouco', 'Normal', 'Muito'], pontos: [1, 2, 3] },
  { pergunta: 'Seu corpo tende a acumular gordura em...', opcoes: ['Barriga', 'Glúteos e coxas', 'Tronco e costas'], pontos: [3, 2, 1] },
  { pergunta: 'Você se sente mais confortável com roupas...', opcoes: ['Folgadas', 'Justas', 'Musculosas'], pontos: [1, 2, 3] },
  { pergunta: 'Sua recuperação após o treino é...', opcoes: ['Rápida', 'Normal', 'Demorada'], pontos: [1, 2, 3] },
  { pergunta: 'Qual sua maior dificuldade?', opcoes: ['Ganhar massa', 'Perder gordura', 'Definir o corpo'], pontos: [1, 3, 2] }
];

let currentQuestion = 0;
let respostas = [];

function initQuiz() {
  const container = document.getElementById('quiz-container');
  const nextBtn = document.getElementById('nextBtn');
  const nextBtnText = document.getElementById('nextBtnText');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  // Se já houver estado (navegação via SPA), reseta
  currentQuestion = 0;
  respostas = [];
  renderQuestion();

  nextBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="quiz-option"]:checked');
    if (!selected) return;

    const pontos = parseInt(selected.value);
    respostas[currentQuestion] = pontos;

    if (currentQuestion < perguntas.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      // Calcular resultado
      const total = respostas.reduce((acc, val) => acc + val, 0);
      const media = total / respostas.length;
      let biotipo;
      if (media < 1.7) biotipo = 'ectomorfo';
      else if (media < 2.3) biotipo = 'mesomorfo';
      else biotipo = 'endomorfo';

      // Salvar no sessionStorage e redirecionar
      sessionStorage.setItem('biotipo', biotipo);
      navigateTo(`resultado.html?biotipo=${biotipo}`);
    }
  });

  function renderQuestion() {
    const q = perguntas[currentQuestion];
    const progresso = ((currentQuestion + 1) / perguntas.length) * 100;
    progressFill.style.width = progresso + '%';
    progressText.textContent = `Pergunta ${currentQuestion + 1}/${perguntas.length}`;

    let html = `
      <div class="quiz__question">
        <h3>${q.pergunta}</h3>
        <div class="quiz__options">
    `;

    q.opcoes.forEach((opcao, index) => {
      const checked = respostas[currentQuestion] === q.pontos[index] ? 'checked' : '';
      html += `
        <label class="quiz__option ${checked ? 'selected' : ''}">
          <input type="radio" name="quiz-option" value="${q.pontos[index]}" ${checked} required>
          <span>${opcao}</span>
        </label>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // Habilitar botão somente quando algo for selecionado
    const radios = document.querySelectorAll('input[name="quiz-option"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        // Remove selected de todos
        document.querySelectorAll('.quiz__option').forEach(opt => opt.classList.remove('selected'));
        radio.closest('.quiz__option').classList.add('selected');
        nextBtn.disabled = false;
      });
    });

    // Atualiza texto do botão na última pergunta
    if (currentQuestion === perguntas.length - 1) {
      nextBtnText.textContent = 'VER RESULTADO';
    } else {
      nextBtnText.textContent = 'PRÓXIMA PERGUNTA';
    }

    // Se já havia resposta, habilita o botão
    if (respostas[currentQuestion] !== undefined) {
      nextBtn.disabled = false;
    } else {
      nextBtn.disabled = true;
    }
  }
}

/* ==================== PÁGINA DE RESULTADO ==================== */
function initResultado() {
  const params = new URLSearchParams(window.location.search);
  let biotipo = params.get('biotipo');
  
  // Se não veio da URL, tenta do sessionStorage
  if (!biotipo) {
    biotipo = sessionStorage.getItem('biotipo');
  }

  // Validação
  if (!['ectomorfo', 'mesomorfo', 'endomorfo'].includes(biotipo)) {
    document.getElementById('resultado-content').innerHTML = `<p>Biotipo não encontrado. <a href="questionario.html">Faça o teste novamente</a>.</p>`;
    return;
  }

  // Dados de cada biotipo
  const dados = {
    ectomorfo: {
      nome: 'ECTOMORFO',
      desc: 'Você possui uma estrutura corporal fina e alongada, com metabolismo naturalmente acelerado. Ganhar peso e massa muscular costuma ser um desafio, mas sua vantagem é a baixa tendência a acumular gordura.',
      pontosFortes: 'Baixo acúmulo de gordura, boa definição muscular quando treinado, recuperação rápida.',
      pontosAtencao: 'Dificuldade em ganhar massa magra, risco de catabolismo se alimentação for insuficiente.',
      treino: 'Treinos curtos e intensos (45-60 min), foco em exercícios compostos pesados (agachamento, supino, levantamento terra). Menos cardio, mais descanso entre séries. Frequência: 3-4x por semana.',
      alimentacao: 'Dieta hipercalórica com superávit de 500-700 kcal/dia. Rica em carboidratos complexos (aveia, batata doce, arroz integral) e proteínas (2g/kg). Refeições frequentes a cada 3h.',
      depoimento: '"Sempre fui magro e achava que era genética. Depois de ajustar meu treino para ectomorfo, ganhei 8kg em 3 meses!" — Lucas S.',
      imagem: 'assets/ectomorfo2.png'
    },
    mesomorfo: {
      nome: 'MESOMORFO',
      desc: 'Seu corpo é naturalmente atlético, com ombros largos, cintura fina e facilidade tanto para ganhar massa muscular quanto para perder gordura. Responde muito bem aos estímulos de treino.',
      pontosFortes: 'Ganho de massa magra facilitado, boa simetria corporal, metabolismo equilibrado.',
      pontosAtencao: 'Pode negligenciar a dieta por achar que "tudo funciona", mas excessos levam a acúmulo de gordura.',
      treino: 'Treinos variados e progressivos. Combine musculação pesada (4-5x semana) com cardio moderado (2-3x). Varie entre hipertrofia e força para evitar platôs.',
      alimentacao: 'Dieta balanceada: 40% carboidratos, 35% proteínas, 25% gorduras saudáveis. Leve superávit calórico para ganho de massa (300-500 kcal). Hidratação abundante.',
      depoimento: '"O teste revelou que sou mesomorfo. Agora treino de forma otimizada e meu shape evoluiu muito mais rápido." — Marina C.',
      imagem: 'assets/mesomorfo2.png'
    },
    endomorfo: {
      nome: 'ENDOMORFO',
      desc: 'Você tem uma estrutura mais larga e tendência a acumular gordura com facilidade, especialmente na região abdominal. O metabolismo é mais lento, mas possui grande potencial para ganho de força e massa muscular.',
      pontosFortes: 'Ganho de força e massa muscular rápido, estrutura robusta, boa recuperação muscular.',
      pontosAtencao: 'Dificuldade em perder gordura, tendência a reter líquidos, necessidade de disciplina alimentar rigorosa.',
      treino: 'Treinos intensos e dinâmicos, com pouco descanso entre séries. Intercale musculação com HIIT (3-4x semana). Circuitos e treinos metabólicos são ideais. Cardio pós-treino.',
      alimentacao: 'Dieta low carb ou cetogênica pode ser eficaz. Priorize proteínas magras, gorduras boas (abacate, azeite) e vegetais fibrosos. Evite açúcares e farinhas refinadas.',
      depoimento: '"Sempre lutei contra a balança. Depois de entender meu biotipo endomorfo, perdi 12kg com as dicas de alimentação." — Rafael A.',
      imagem: 'assets/endomorfo2.png'
    }
  };

  const info = dados[biotipo];

  const html = `
    <div class="resultado__card">
      <div class="resultado__image">
        <img src="${info.imagem}" alt="${info.nome}">
      </div>
      <h1 class="resultado__title">SEU BIOTIPO É <span class="text-gradient">${info.nome}</span>!</h1>
      <p class="resultado__desc">${info.desc}</p>

      <div class="resultado__info">
        <div class="resultado__box">
          <h3><i class="fa-solid fa-check-circle"></i> Pontos Fortes</h3>
          <p>${info.pontosFortes}</p>
        </div>
        <div class="resultado__box">
          <h3><i class="fa-solid fa-exclamation-triangle"></i> Pontos de Atenção</h3>
          <p>${info.pontosAtencao}</p>
        </div>
        <div class="resultado__box">
          <h3><i class="fa-solid fa-dumbbell"></i> Plano de Treino</h3>
          <p>${info.treino}</p>
        </div>
        <div class="resultado__box">
          <h3><i class="fa-solid fa-utensils"></i> Alimentação</h3>
          <p>${info.alimentacao}</p>
        </div>
      </div>

      <div class="resultado__depoimento">
        <p><i class="fa-solid fa-quote-left" style="color: var(--primary); margin-right: 0.5rem;"></i>${info.depoimento}</p>
      </div>

      <div class="resultado__actions">
        <a href="https://pay.kiwify.com.br/SEU_LINK_AQUI" target="_blank" class="btn btn--primary btn--lg btn--pulse">
          <i class="fa-solid fa-book-open"></i> QUERO O GUIA COMPLETO
        </a>
        <a href="questionario.html" class="btn btn--secondary">
          <i class="fa-solid fa-rotate-right"></i> TENTAR NOVAMENTE
        </a>
      </div>
      <div class="garantia-badge">
        <i class="fa-solid fa-shield-halved"></i> Garantia de 7 dias ou seu dinheiro de volta
      </div>
    </div>
  `;

  document.getElementById('resultado-content').innerHTML = html;
}
