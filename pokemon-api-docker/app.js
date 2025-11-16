const app = document.getElementById('app');

function renderBase(content = '') {
  // 1. A função renderBase agora só lida com a estrutura base,
  // sem tentar vincular botões de detalhe que ainda não existem.
  app.innerHTML = `
    <div class="search-box">
      <input id="poke-search" type="text" placeholder="Digite o nome do pokémon para buscar..." />
      <button id="btn-search">Buscar</button>
      <button id="btn-list">Listar 20</button>
    </div>
    <div id="content">${content}</div>
    <p class="data-source">Dados da <strong>Poke API</strong> (pokeapi.co)</p>
  `;

  bindBaseEvents();
  // bindDetailButtons() foi removido daqui
}

function bindBaseEvents() {
  // É crucial remover os event listeners antigos antes de adicionar novos
  // se o elemento principal (app.innerHTML) for substituído, mas como
  // a estrutura base (search-box) é sempre recriada em renderBase,
  // basta garantir que os novos listeners sejam adicionados.
  const searchBtn = document.getElementById('btn-search');
  const listBtn = document.getElementById('btn-list');
  const searchInput = document.getElementById('poke-search');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => handleSearch(searchInput));
  }

  if (listBtn) {
    listBtn.addEventListener('click', loadPokemonList);
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        handleSearch(searchInput);
      }
    });
  }
}

function handleSearch(input) {
  if (!input) return;
  // É bom validar se o input realmente existe.
  const term = input.value.toLowerCase().trim();
  if (term) {
    loadPokemonByName(term);
    // Limpa o input após a busca, por UX.
    input.value = '';
  }
}

function bindDetailButtons() {
  document.querySelectorAll('.btn-detail').forEach((btn) => {
    // Certifica-se de que o listener não seja adicionado mais de uma vez
    // embora no seu caso, a recriação do HTML previna isso, é uma boa prática.
    btn.onclick = (event) => {
      const { name } = event.currentTarget.dataset;
      if (name) {
        loadPokemonByName(name);
      }
    };
  });
}

async function loadPokemonList() {
  renderBase('<p>Carregando lista...</p>');
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
    if (!res.ok) throw new Error('Erro na API');
    const data = await res.json();

    const listHtml = `
      <h2>Lista de Pokémons</h2>
      <div class="poke-list">
        ${data.results
          .map(
            (pokemon, index) => `
              <div class="poke-card">
                <span>${index + 1}. ${pokemon.name.toUpperCase()}</span> 
                <button data-name="${pokemon.name}" class="btn-detail">Detalhes</button>
              </div>
            `
          )
          .join('')}
      </div>
    `;

    renderBase(listHtml);
    // 2. CHAME bindDetailButtons AQUI para que os botões recém-adicionados funcionem.
    bindDetailButtons();
  } catch (err) {
    console.error(err);
    renderBase(`
      <h2>Erro ao carregar a lista de pokémons.</h2>
      <p>Tente novamente mais tarde.</p>
    `);
  }
}

async function loadPokemonByName(name) {
  renderBase('<p>Buscando pokémon...</p>');
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`); // Garante que a busca é minúscula
    if (!res.ok) throw new Error('Pokémon não encontrado');
    const pokemon = await res.json();

    const types = pokemon.types.map((t) => t.type.name).join(', ');

    // Ajuste para capitalizar o nome, apenas para fins de exibição
    const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const html = `
      <h2>${displayName} (#${pokemon.id})</h2>
      <div class="poke-detail">
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        <div>
          <p><strong>Altura:</strong> ${pokemon.height / 10} m</p> 
          <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
          <p><strong>Tipo(s):</strong> ${types.toUpperCase()}</p>
          <p><strong>Base XP:</strong> ${pokemon.base_experience}</p>
          <button id="btn-back" class="btn-back">Voltar para a Lista</button> 
        </div>
      </div>
    `;

    renderBase(html);
    // 3. Adiciona evento para o botão de voltar.
    document.getElementById('btn-back').addEventListener('click', loadPokemonList);
  } catch (err) {
    console.error(err);
    renderBase(`
      <h2>Erro ao carregar o pokémon.</h2>
      <p>Verifique se o nome está correto e tente novamente.</p>
    `);
  }
}

// Inicializa o aplicativo.
renderBase(); 
loadPokemonList();