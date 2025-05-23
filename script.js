window.onload = function () {
  const wordList = [
    'Cuidar', 'Proteger', 'Preservar', 'Aprender', 'Natureza',
    'Mundo', 'Terra', 'União', 'Consciente', 'Vento'
  ];

  const gridSize = 16;
  let grid = [], selectedCells = [], foundWords = [];
  let pontuacao = 0;
  let wordStartTime = 0;

  // Remove acentos e coloca maiúsculas
  function normalize(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  // Gera a grade do jogo
  function generateGrid() {
    const container = document.getElementById('word-search');
    container.innerHTML = '';
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    wordList.forEach(w => placeWord(normalize(w)));
    fillEmpty();
    renderGrid();
  }

  // Tenta posicionar uma palavra na grade
  function placeWord(word) {
    const dirs = ['horizontal', 'vertical'];
    let placed = false;
    for (let i = 0; i < 100 && !placed; i++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if (canPlace(word, r, c, dir)) {
        for (let k = 0; k < word.length; k++) {
          if (dir === 'horizontal') grid[r][c + k] = word[k];
          else grid[r + k][c] = word[k];
        }
        placed = true;
      }
    }
  }

  // Verifica se é possível posicionar a palavra naquela posição e direção
  function canPlace(w, r, c, dir) {
    if (dir === 'horizontal' && c + w.length > gridSize) return false;
    if (dir === 'vertical' && r + w.length > gridSize) return false;
    for (let i = 0; i < w.length; i++) {
      const rr = dir === 'horizontal' ? r : r + i;
      const cc = dir === 'horizontal' ? c + i : c;
      // Se tem letra diferente, não pode colocar
      if (grid[rr][cc] && grid[rr][cc] !== '' && grid[rr][cc] !== w[i]) return false;
    }
    return true;
  }

  // Preenche espaços vazios com letras aleatórias
  function fillEmpty() {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++) {
        if (!grid[r][c]) grid[r][c] = A[Math.floor(Math.random() * A.length)];
      }
  }

  // Renderiza a grade no HTML
  function renderGrid() {
    const cont = document.getElementById('word-search');
    cont.innerHTML = '';
    grid.forEach((row, ri) => row.forEach((ltr, ci) => {
      const cell = document.createElement('span');
      cell.textContent = ltr;
      cell.classList.add('cell');
      cell.dataset.row = ri;
      cell.dataset.col = ci;
      cell.addEventListener('mousedown', startSel);
      cell.addEventListener('mouseover', extendSel);
      cell.addEventListener('mouseup', endSel);
      cont.appendChild(cell);
    }));
  }

  let isSel = false;

  // Inicia seleção ao clicar
  function startSel(e) {
    isSel = true;
    clearSel();
    selectCell(e.target);
    wordStartTime = Date.now();
  }

  // Continua seleção ao passar o mouse
  function extendSel(e) {
    if (isSel) selectCell(e.target);
  }

  // Finaliza seleção ao soltar o botão do mouse
  function endSel() {
    isSel = false;
    const word = selectedCells.map(c => c.textContent).join('');
    const norm = normalize(word);
    if (wordList.map(normalize).includes(norm) && !foundWords.includes(norm)) {
      selectedCells.forEach(c => c.classList.add('found'));
      markFound(norm);
      calcularPontuacao();
    } else {
      selectedCells.forEach(c => c.classList.remove('selected'));
    }
    selectedCells = [];
  }

  // Marca a célula como selecionada (com logs para debug)
  function selectCell(c) {
    if (!c.classList.contains('cell') || c.classList.contains('found')) return;
    console.log('Tentando selecionar:', c.textContent, c.dataset.row, c.dataset.col);

    if (selectedCells.length === 0) {
      c.classList.add('selected');
      selectedCells.push(c);
      console.log('Selecionou a primeira célula');
      return;
    }

    const last = selectedCells[selectedCells.length - 1];
    const rLast = parseInt(last.dataset.row);
    const cLast = parseInt(last.dataset.col);
    const rNew = parseInt(c.dataset.row);
    const cNew = parseInt(c.dataset.col);

    const rowDiff = rNew - rLast;
    const colDiff = cNew - cLast;

    const isHorizontalMove = (rowDiff === 0 && Math.abs(colDiff) === 1);
    const isVerticalMove = (colDiff === 0 && Math.abs(rowDiff) === 1);

    if (isHorizontalMove || isVerticalMove) {
      if (!selectedCells.includes(c)) {
        c.classList.add('selected');
        selectedCells.push(c);
        console.log('Selecionou célula adjacente');
      }
    } else {
      console.log('Célula não adjacente, ignorada');
    }
  }

  // Limpa seleção atual
  function clearSel() {
    document.querySelectorAll('.selected').forEach(c => c.classList.remove('selected'));
    selectedCells = [];
  }

  // Marca a palavra como encontrada na lista e verifica fim
  function markFound(w) {
    foundWords.push(w);
    document.querySelectorAll('#word-list li').forEach(li => {
      if (normalize(li.textContent) === w) {
        li.style.textDecoration = 'line-through';
        li.style.color = '#888';
      }
    });
    verificarFimDoJogo();
  }

  // Calcula pontuação baseada no tempo para encontrar a palavra
  function calcularPontuacao() {
    const tempoPalavra = Math.floor((Date.now() - wordStartTime) / 1000);
    let pontos = tempoPalavra <= 10 ? 10 : 5;
    pontuacao += pontos;
    document.getElementById('pontuacao').textContent = `Pontuação: ${pontuacao}`;
    wordStartTime = Date.now();
  }

  // Reinicia o jogo
  function reiniciarJogo() {
    foundWords = [];
    pontuacao = 0;
    document.getElementById('pontuacao').textContent = `Pontuação: 0`;
    generateGrid();
    document.querySelectorAll('#word-list li').forEach(li => {
      li.style.textDecoration = 'none';
      li.style.color = '#fff';
    });
    document.getElementById('tela-final').style.display = 'none';
    iniciarTemporizador();
  }

  let startTime;
  let timerInterval;

  // Inicia temporizador
  function iniciarTemporizador() {
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const tempoDecorrido = Math.floor((Date.now() - startTime) / 1000);
      let tempoFormatado = tempoDecorrido < 60
        ? `Tempo: ${tempoDecorrido}s`
        : `Tempo: ${Math.floor(tempoDecorrido / 60)}m ${tempoDecorrido % 60}s`;
      document.getElementById('temporizador').textContent = tempoFormatado;
    }, 1000);
  }

  // Para temporizador
  function pararTemporizador() {
    clearInterval(timerInterval);
  }

  // Verifica se o jogo terminou
  function verificarFimDoJogo() {
    if (foundWords.length === wordList.length) {
      pararTemporizador();
      const tempoTotal = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('mensagem-final').textContent =
        `Você encontrou todas as palavras em ${tempoTotal} segundos! Pontuação final: ${pontuacao}`;
      document.getElementById('tela-final').style.display = 'flex';
    }
  }

  // Dicas para o usuário
  const dicas = [
    "Dica 1: Não tem palavras ao contrário",
    "Dica 2: Elas podem estar na horizontal ou vertical",
    "Dica 3: Palavras podem ser encontradas bem próximas umas às outras",
    "Dica 4: Procure pelas iniciais das palavras",
    "Dica 5: Não olhe para o relógio"
  ];
  let dicaAtual = 0;
  const botaoDica = document.getElementById('botao-dica');
  const textoDica = document.getElementById('texto-dica');

  botaoDica.addEventListener('click', () => {
    if (textoDica.style.display === 'block') {
      textoDica.style.display = 'none';
    } else {
      if (dicaAtual < dicas.length) {
        textoDica.textContent = dicas[dicaAtual++];
      } else {
        textoDica.textContent = "Não há mais dicas!";
      }
      textoDica.style.display = 'block';
    }
  });

  document.getElementById('botao-reiniciar').addEventListener('click', reiniciarJogo);
  document.getElementById('botao-jogar-novamente').addEventListener('click', reiniciarJogo);

  generateGrid();
  iniciarTemporizador();
};
