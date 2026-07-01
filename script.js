const API_KEY = "uDZicaK3xrGEdJV93SPObkNSTxmDG6RbxLtKYaEg";

const dataBusca = document.getElementById("dataBusca");
const searchInput = document.getElementById("searchInput");
const resultado = document.getElementById("resultado");
const totalSpan = document.getElementById("total");
const perigososSpan = document.getElementById("perigosos");
const proximoSpan = document.getElementById("proximo");

const searchError = document.getElementById("searchError");
const dataError = document.getElementById("dataError");

function mostrarErro(campo, elementoErro, mensagem) {
  campo.classList.add("input-error");
  elementoErro.textContent = mensagem;
}

function limparErro(campo, elementoErro) {
  campo.classList.remove("input-error");
  elementoErro.textContent = "";
}

function validarTextoBusca(campo, elementoErro, nomeCampo) {
  const valor = campo.value.trim();

  if (valor.length === 0) {
    mostrarErro(campo, elementoErro, `${nomeCampo} não pode ficar vazio.`);
    return false;
  }

  if (valor.length < 3) {
    mostrarErro(campo, elementoErro, `${nomeCampo} deve ter pelo menos 3 caracteres.`);
    return false;
  }

  limparErro(campo, elementoErro);
  return true;
}

function validarDataBusca() {
  if (!dataBusca.value) {
    mostrarErro(dataBusca, dataError, "Selecione uma data para realizar a busca.");
    return false;
  }

  limparErro(dataBusca, dataError);
  return true;
}

dataBusca.value = new Date().toISOString().split("T")[0];
document.getElementById("buscarBtn").addEventListener("click", buscarAsteroides);

dataBusca.addEventListener("change", validarDataBusca);
searchInput?.addEventListener("input", () => {
  if (searchInput.value.trim().length >= 3) limparErro(searchInput, searchError);
});

// FAVORITOS - ESTADO E UTILITÁRIOS

function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem("nasa_favoritos") || '{"imagens":[],"asteroides":[]}');
  } catch (e) {
    return { imagens: [], asteroides: [] };
  }
}

function salvarFavoritos(favs) {
  localStorage.setItem("nasa_favoritos", JSON.stringify(favs));
}

function atualizarBadge() {
  const favs = getFavoritos();
  const total = favs.imagens.length + favs.asteroides.length;
  const badge = document.getElementById("favBadge");
  const imgCount = document.getElementById("favImgCount");
  const astCount = document.getElementById("favAstCount");

  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
  imgCount.textContent = favs.imagens.length;
  astCount.textContent = favs.asteroides.length;
}

// PAINEL DE FAVORITOS

document.getElementById("favToggleBtn").addEventListener("click", () => {
  const section = document.getElementById("favoritesSection");
  const isHidden = section.style.display === "none";
  section.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    renderFavoritosImagens();
    renderFavoritosAsteroides();
  }
});

document.getElementById("clearFavoritesBtn").addEventListener("click", () => {
  if (!confirm("Tem certeza que deseja remover todos os favoritos?")) return;
  salvarFavoritos({ imagens: [], asteroides: [] });
  atualizarBadge();
  renderFavoritosImagens();
  renderFavoritosAsteroides();
  document.querySelectorAll(".btn-fav, .btn-fav-ast").forEach(b => b.classList.remove("active"));
});

document.querySelectorAll(".fav-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".fav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".fav-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// IMAGENS FAVORITAS

function isImagemFavoritada(src) {
  return getFavoritos().imagens.some(i => i.imagem === src);
}

function toggleFavImagem(src, titulo, descricao) {
  const favs = getFavoritos();
  const idx = favs.imagens.findIndex(i => i.imagem === src);
  if (idx === -1) {
    favs.imagens.push({ imagem: src, titulo, descricao });
  } else {
    favs.imagens.splice(idx, 1);
  }
  salvarFavoritos(favs);
  atualizarBadge();
  renderFavoritosImagens();
}

function renderFavoritosImagens() {
  const favs = getFavoritos();
  const grid = document.getElementById("favImagesGrid");
  if (favs.imagens.length === 0) {
    grid.innerHTML = '<p class="fav-empty">Nenhuma imagem favoritada ainda.</p>';
    return;
  }
  grid.innerHTML = favs.imagens.map(item => `
    <div class="gallery-card">
      <img src="${item.imagem}" alt="${item.titulo}">
      <button class="btn-fav active" data-src="${item.imagem}" data-context="fav-panel" title="Remover dos favoritos">★</button>
      <div class="gallery-content">
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".btn-fav[data-context='fav-panel']").forEach(btn => {
    btn.addEventListener("click", function () {
      const src = this.dataset.src;
      const favs = getFavoritos();
      const item = favs.imagens.find(i => i.imagem === src);
      if (item) toggleFavImagem(item.imagem, item.titulo, item.descricao);

      // Also update the gallery grid button if visible
      const galleryBtn = document.querySelector(`.gallery-grid .btn-fav[data-src="${src}"]`);
      if (galleryBtn) galleryBtn.classList.remove("active");
    });
  });
}

// ASTEROIDES FAVORITOS

function isAsteroideFavoritado(nome) {
  return getFavoritos().asteroides.some(a => a.nome === nome);
}

function toggleFavAsteroide(nome, diametro, distancia, perigoso) {
  const favs = getFavoritos();
  const idx = favs.asteroides.findIndex(a => a.nome === nome);
  if (idx === -1) {
    favs.asteroides.push({ nome, diametro, distancia, perigoso });
  } else {
    favs.asteroides.splice(idx, 1);
  }
  salvarFavoritos(favs);
  atualizarBadge();
  renderFavoritosAsteroides();
}

function renderFavoritosAsteroides() {
  const favs = getFavoritos();
  const tbody = document.getElementById("favAsteroidsTable");
  if (favs.asteroides.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="fav-empty">Nenhum asteroide favoritado ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = favs.asteroides.map(ast => `
    <tr>
      <td>${ast.nome}</td>
      <td>${ast.diametro} m</td>
      <td>${ast.distancia} km</td>
      <td class="${ast.perigoso ? 'perigoso' : 'seguro'}">
        ${ast.perigoso ? "⚠️ Sim" : "✅ Não"}
      </td>
      <td>
        <button class="btn-fav-ast active" data-nome="${ast.nome}" data-context="fav-panel" title="Remover dos favoritos">★</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-fav-ast[data-context='fav-panel']").forEach(btn => {
    btn.addEventListener("click", function () {
      const ast = getFavoritos().asteroides.find(a => a.nome === this.dataset.nome);
      if (ast) toggleFavAsteroide(ast.nome, ast.diametro, ast.distancia, ast.perigoso);

      // Update main table button if visible
      const mainBtn = document.querySelector(`#resultado .btn-fav-ast[data-nome="${this.dataset.nome}"]`);
      if (mainBtn) mainBtn.classList.remove("active");
    });
  });
}

// ASTEROIDES - BUSCA PRINCIPAL

async function buscarAsteroides() {
  if (!validarDataBusca()) return;

  const data = dataBusca.value;
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${data}&end_date=${data}&api_key=${API_KEY}`;

  try {
    resultado.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    const resposta = await fetch(url);
    const dados = await resposta.json();
    const lista = dados.near_earth_objects[data];

    resultado.innerHTML = "";

    let perigosos = 0;
    let menorDistancia = Infinity;

    lista.forEach(ast => {
      const distancia = Number(ast.close_approach_data[0].miss_distance.kilometers);
      const diametro = ast.estimated_diameter.meters.estimated_diameter_max;
      const perigoso = ast.is_potentially_hazardous_asteroid;

      if (perigoso) perigosos++;
      if (distancia < menorDistancia) menorDistancia = distancia;

      const favAtivo = isAsteroideFavoritado(ast.name) ? "active" : "";
      const nome = ast.name;
      const diametroStr = diametro.toFixed(2);
      const distanciaStr = distancia.toLocaleString();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${nome}</td>
        <td>${diametroStr} m</td>
        <td>${distanciaStr} km</td>
        <td class="${perigoso ? 'perigoso' : 'seguro'}">${perigoso ? "⚠️ Sim" : "✅ Não"}</td>
        <td><button class="btn-fav-ast ${favAtivo}" data-nome="${nome}" title="Favoritar">★</button></td>
      `;

      const btn = tr.querySelector(".btn-fav-ast");
      btn.addEventListener("click", function () {
        const isActive = this.classList.contains("active");
        if (isActive) {
          this.classList.remove("active");
          toggleFavAsteroide(nome, diametroStr, distanciaStr, perigoso);
        } else {
          this.classList.add("active");
          toggleFavAsteroide(nome, diametroStr, distanciaStr, perigoso);
        }
      });

      resultado.appendChild(tr);
    });

    totalSpan.textContent = lista.length;
    perigososSpan.textContent = perigosos;
    proximoSpan.textContent = menorDistancia.toLocaleString() + " km";

  } catch (erro) {
    resultado.innerHTML = "<tr><td colspan='5'>Erro ao carregar dados.</td></tr>";
    console.error(erro);
  }
}

buscarAsteroides();

// GALERIA DE IMAGENS NASA

const galleryGrid = document.getElementById("galleryGrid");

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscarImagensNASA();
});

async function buscarImagensNASA() {
  if (!validarTextoBusca(searchInput, searchError, "A busca de imagens")) return;

  const termo = searchInput.value.trim();

  galleryGrid.innerHTML = "<p>Carregando imagens...</p>";

  try {
    const resposta = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(termo)}&media_type=image`
    );
    const dados = await resposta.json();
    const imagens = dados.collection.items.slice(0, 12);

    galleryGrid.innerHTML = "";

    if (imagens.length === 0) {
      galleryGrid.innerHTML = "<p>Nenhuma imagem encontrada.</p>";
      return;
    }

    imagens.forEach(item => {
      const src = item.links?.[0]?.href;
      const titulo = item.data?.[0]?.title || "Sem título";
      const descricao = (item.data?.[0]?.description || "").substring(0, 150) + "...";
      if (!src) return;

      const favAtivo = isImagemFavoritada(src) ? "active" : "";

      const card = document.createElement("div");
      card.className = "gallery-card";
      card.innerHTML = `
        <img src="${src}" alt="${titulo}">
        <button class="btn-fav ${favAtivo}" data-src="${src}" title="Favoritar">★</button>
        <div class="gallery-content">
          <h3>${titulo}</h3>
          <p>${descricao}</p>
        </div>
      `;

      const btn = card.querySelector(".btn-fav");
      btn.addEventListener("click", function () {
        const isActive = this.classList.contains("active");
        if (isActive) {
          this.classList.remove("active");
          toggleFavImagem(src, titulo, descricao);
        } else {
          this.classList.add("active");
          toggleFavImagem(src, titulo, descricao);
        }
      });

      galleryGrid.appendChild(card);
    });

  } catch (erro) {
    console.error(erro);
    galleryGrid.innerHTML = "<p>Erro ao carregar imagens.</p>";
  }
}

// Inicializar badge
atualizarBadge();
