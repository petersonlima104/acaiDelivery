const WHATSAPP_PHONE = "5551980533399"; // coloque seu número com DDI+DDD
const TAXA_ENTREGA = 6.0;
const precos = {
  Tradicional: {
    "330ml": 12,
    "440ml": 15,
    "550ml": 17,
  },
  Cupuaçu: {
    "330ml": 12,
    "440ml": 15,
    "550ml": 17,
  },
  Zero: {
    "330ml": 15,
    "440ml": 18,
    "550ml": 20,
  },
};

const listaAcompanhamentos = [
  "Leite em pó",
  "Leite em pó desnatado",
  "Leite condensado",
  "Granola",
  "Ovo maltine",
  "Chocoboll",
  "Côco",
  "Gotas de chocolate",
  "Amendoim",
  "Paçoca",
  "Banana",
  "Batom branco ou preto",
  "Jujuba",
  "Prestígio",
  "Snickers",
  "Stikadinho",
  "Charge",
  "Granulado",
  "Morango",
  "Kiwi",
  "Chantilly",
  "Sonho de valsa",
  "Ouro branco",
  "Cupuaçu",
  "Negresco",
  "Kit-Kat",
  "Marshmallow",
];
const listaCremes = [
  { nome: "Creme de avelã com cacau", preco: 6 },
  { nome: "Creme de avelã chocolate", preco: 5 },
  { nome: "Creme de morango", preco: 5 },
  { nome: "Creme de leite ninho", preco: 5 },
  { nome: "Creme de amendoim", preco: 5 },
];

const tamanhoSelect = document.getElementById("tamanho");
const tipoSelect = document.getElementById("tipo");

tipoSelect.addEventListener("change", () => {
  tamanhoSelect.innerHTML =
    '<option value="" disabled selected>Escolha...</option>';
  const tipo = tipoSelect.value;
  for (let tam in precos[tipo]) {
    tamanhoSelect.innerHTML += `<option value="${tam}">${tam} - R$${precos[
      tipo
    ][tam].toFixed(2)}</option>`;
  }
});

const acompDiv = document.getElementById("acompanhamentos");
listaAcompanhamentos.forEach((item, idx) => {
  acompDiv.innerHTML += `<div class="col-6"><input type="checkbox" id="acomp${idx}" value="${item}" class="form-check-input"> <label for="acomp${idx}">${item}</label></div>`;
});

const cremesDiv = document.getElementById("cremes");
listaCremes.forEach((item, idx) => {
  cremesDiv.innerHTML += `<div class="col-6"><input type="checkbox" id="creme${idx}" value="${
    item.nome
  }" data-preco="${
    item.preco
  }" class="form-check-input"> <label for="creme${idx}">${
    item.nome
  } - R$${item.preco.toFixed(2)}</label></div>`;
});

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
atualizarCarrinho();

document.getElementById("formAcai").addEventListener("submit", (e) => {
  e.preventDefault();
  const tipo = tipoSelect.value;
  const tamanho = tamanhoSelect.value;
  const quantidade = parseInt(document.getElementById("quantidade").value);

  // 🔹 Validações obrigatórias
  if (!tipo) {
    alert("Por favor, selecione o tipo de açaí.");
    return;
  }
  if (!tamanho) {
    alert("Por favor, selecione o tamanho do açaí.");
    return;
  }

  const selecionados = Array.from(
    document.querySelectorAll("#acompanhamentos input:checked")
  ).map((i) => i.value);
  const cremesSel = Array.from(
    document.querySelectorAll("#cremes input:checked")
  ).map((i) => ({ nome: i.value, preco: parseFloat(i.dataset.preco) }));

  let precoBase = precos[tipo][tamanho];
  let precoExtras = Math.max(0, selecionados.length - 3) * 3;
  let precoCremes = cremesSel.reduce((acc, c) => acc + c.preco, 0);
  let precoFinal = (precoBase + precoExtras + precoCremes) * quantidade;

  carrinho.push({
    tipo,
    tamanho,
    quantidade,
    acomp: selecionados,
    cremes: cremesSel,
    preco: precoFinal,
  });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();

  // 🔹 Mensagem de sucesso estilizada
  const msgDiv = document.getElementById("msgSucesso");
  msgDiv.innerHTML = `<div class="alert alert-success text-center" role="alert">
  ✅ Item adicionado ao carrinho!
</div>`;
  setTimeout(() => {
    msgDiv.innerHTML = "";
  }, 2000);

  e.target.reset();
});

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  let totalItems = 0;

  carrinho.forEach((item) => {
    totalItems += item.quantidade; // soma todas as quantidades
  });

  cartCount.textContent = totalItems;
}

function atualizarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  lista.innerHTML = "";
  let subtotal = 0;
  carrinho.forEach((item, idx) => {
    subtotal += item.preco;
    lista.innerHTML += `<div class="cart-item"><strong>${item.quantidade}x ${
      item.tipo
    } ${item.tamanho}</strong><br>Acompanhamentos: ${
      item.acomp.length > 0 ? item.acomp.join(", ") : "Nenhum"
    }<br>Cremes: ${
      item.cremes.length > 0
        ? item.cremes.map((c) => c.nome).join(", ")
        : "Nenhum"
    }<br>Subtotal: R$${item.preco.toFixed(
      2
    )} <button class='btn btn-sm btn-danger ms-2' onclick='removerItem(${idx})'>Remover</button></div>`;
  });

  // Atualiza totais
  const total = subtotal + TAXA_ENTREGA;
  document.getElementById("totalCarrinho").textContent = total.toFixed(2);

  updateCartCount(); // atualiza o número de itens
}

function removerItem(idx) {
  carrinho.splice(idx, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();

  updateCartCount(); // atualiza o número de itens
}

function esvaziarCarrinho() {
  carrinho = [];
  localStorage.removeItem("carrinho");
  atualizarCarrinho();
}

function enviarWhatsapp() {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }
  let msg = "Olá, gostaria de pedir:%0a";
  carrinho.forEach((item) => {
    msg += `- ${item.quantidade}x ${item.tipo} ${item.tamanho} (Acomp: ${
      item.acomp.join(", ") || "Nenhum"
    }, Cremes: ${
      item.cremes.map((c) => c.nome).join(", ") || "Nenhum"
    }) - R$${item.preco.toFixed(2)}%0a`;
  });

  msg += `%0aTaxa de entrega: R$${TAXA_ENTREGA.toFixed(2)}`;
  msg += `%0aTotal: R$${document.getElementById("totalCarrinho").textContent}`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`, "_blank");

  // Limpar carrinho após finalizar
  carrinho = [];
  atualizarCarrinho();
}
