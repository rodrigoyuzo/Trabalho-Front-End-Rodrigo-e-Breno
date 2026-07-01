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
  campo?.classList.add("input-error");
  if (elementoErro) elementoErro.textContent = mensagem;
}

function limparErro(campo, elementoErro) {
  campo?.classList.remove("input-error");
  if (elementoErro) elementoErro.textContent = "";
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
  if (!dataBusca || !dataBusca.value) {
    mostrarErro(dataBusca, dataError, "Selecione uma data para realizar a busca.");
    return false;
  }

  limparErro(dataBusca, dataError);
  return true;
}

// Inicializa data de busca com o dia de hoje
if (dataBusca) {
  dataBusca.value = new Date().toISOString().split("T")[0];
  dataBusca.addEventListener("change", validarDataBusca);
}

document.getElementById("buscarBtn")?.addEventListener("click", buscarAsteroides);

searchInput?.addEventListener("input", () => {
  if (searchInput.value.trim().length >= 3) limparErro(searchInput, searchError);
});

// ==========================================
// LIMPAR INPUT COM ESCAPE (ESC)
// ==========================================
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchInput.value = "";
    limparErro(searchInput, searchError);
  }
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

  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  }
  if (imgCount) imgCount.textContent = favs.imagens.length;
  if (astCount) astCount.textContent = favs.asteroides.length;
}

// PAINEL DE FAVORITOS

document.getElementById("favToggleBtn")?.addEventListener("click", () => {
  const section = document.getElementById("favoritesSection");
  if (!section) return;
  
  const isHidden = section.style.display === "none" || section.style.display === "";
  section.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    renderFavoritosImagens();
    renderFavoritosAsteroides();
  }
});

document.getElementById("clearFavoritesBtn")?.addEventListener("click", () => {
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
    document.getElementById(tab.dataset.tab)?.classList.add("active");
  });
});

// IMAGENS FAVORITAS

function isImagemFavoritada(src) {
  return getFavoritos().imagens.some(i => i.imagem === src);
}

function toggleFavImagem(src, titulo, descricao) {
  const favs = getFavoritos(); // CORRIGIDO: Removido o ternário com 'getFavorites' inexistente
  const idx = favs.imagens.findIndex(i => i.imagem === src);
  if (idx === -1) {
    favs.imagens.push({ imagem: src, titulo, descricao });
  } else {
    favs.imagens.splice(idx, 1);
  }
  salvarFavoritos(favs);
  atualizarBadge();
}

function renderFavoritosImagens() {
  const favs = getFavoritos();
  const grid = document.getElementById("favImagesGrid");
  if (!grid) return;
  
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
      const atuais = getFavoritos();
      const item = atuais.imagens.find(i
