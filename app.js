// Configurazione Firebase dell'app Web.
const firebaseConfig = {
  apiKey: "AIzaSyDdco7JdM3cTnP1c9z-uGKUa-C-hZGuW7Y",
  authDomain: "peppeprogetto-8afc8.firebaseapp.com",
  projectId: "peppeprogetto-8afc8",
  storageBucket: "peppeprogetto-8afc8.firebasestorage.app",
  messagingSenderId: "1078595170448",
  appId: "1:1078595170448:web:2170ec01189b0e59ae6815",
  measurementId: "G-51VHZNE4B0"
};

// Questi due valori identificano l'account Cloudinary e il preset unsigned.
const CLOUDINARY_CLOUD_NAME = "lgpus1ka";
const CLOUDINARY_UPLOAD_PRESET = "peppe_progetto";
const CLOUDINARY_UPLOAD_TIMEOUT_MS = 45_000;
const DDT_SENDER_STORAGE_KEY = "dolcevolta-ddt-emittente";
const DDT_SENDER_FIELD_NAMES = [
  "mittente-ragione-sociale",
  "mittente-partita-iva",
  "mittente-codice-fiscale",
  "mittente-via",
  "mittente-cap",
  "mittente-comune",
  "mittente-provincia",
  "mittente-nazione",
  "mittente-telefono",
  "mittente-email",
  "partenza-via",
  "partenza-cap",
  "partenza-comune",
  "partenza-provincia"
];

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  deleteObject,
  getStorage,
  ref
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const db = initializeFirestore(appFirebase, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const elementi = {
  authLoadingView: document.getElementById("auth-loading-view"),
  loginView: document.getElementById("login-view"),
  loginForm: document.getElementById("login-form"),
  loginMessage: document.getElementById("login-message"),
  appView: document.getElementById("app-view"),
  brandHome: document.getElementById("brand-home"),
  mobileMenu: document.getElementById("mobile-menu"),
  logoutButton: document.getElementById("logout-button"),
  mobileLogoutButton: document.getElementById("mobile-logout-button"),
  orderDashboardButton: document.getElementById("order-dashboard-button"),
  mobileOrderDashboardButton: document.getElementById("mobile-order-dashboard-button"),
  cartButton: document.getElementById("cart-button"),
  mobileCartButton: document.getElementById("mobile-cart-button"),
  cartCount: document.getElementById("cart-count"),
  catalogPage: document.getElementById("catalog-page"),
  cartPage: document.getElementById("cart-page"),
  orderSummaryPage: document.getElementById("order-summary-page"),
  orderSummaryMessage: document.getElementById("order-summary-message"),
  ordersPage: document.getElementById("orders-page"),
  ordersBackToCatalogButton: document.getElementById("orders-back-to-catalog"),
  ordersList: document.getElementById("orders-list"),
  ordersCount: document.getElementById("orders-count"),
  ordersMessage: document.getElementById("orders-message"),
  orderStatusFilter: document.getElementById("order-status-filter"),
  orderEditDialog: document.getElementById("order-edit-dialog"),
  orderEditForm: document.getElementById("order-edit-form"),
  orderEditId: document.getElementById("order-edit-id"),
  orderEditTitle: document.getElementById("order-edit-title"),
  orderEditMessage: document.getElementById("order-edit-message"),
  orderEditDdtNote: document.getElementById("order-edit-ddt-note"),
  orderEditItems: document.getElementById("order-edit-items"),
  orderAddProductSelect: document.getElementById("order-add-product-select"),
  orderAddProductButton: document.getElementById("order-add-product-button"),
  orderEditTotal: document.getElementById("order-edit-total"),
  saveOrderButton: document.getElementById("save-order-button"),
  backToCatalogButton: document.getElementById("back-to-catalog"),
  orderBackToCatalogButton: document.getElementById("order-back-to-catalog"),
  cartItems: document.getElementById("cart-items"),
  cartEmpty: document.getElementById("cart-empty"),
  cartSummary: document.getElementById("cart-summary"),
  cartTotalItems: document.getElementById("cart-total-items"),
  cartTotalLabel: document.getElementById("cart-total-label"),
  cartTotalPrice: document.getElementById("cart-total-price"),
  cartUnknownPrices: document.getElementById("cart-unknown-prices"),
  cartMessage: document.getElementById("cart-message"),
  clearCartButton: document.getElementById("clear-cart-button"),
  placeOrderButton: document.getElementById("place-order-button"),
  checkoutDialog: document.getElementById("checkout-dialog"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutMessage: document.getElementById("checkout-message"),
  confirmOrderButton: document.getElementById("confirm-order-button"),
  ddtDate: document.getElementById("ddt-date"),
  ddtGoodsLines: document.getElementById("ddt-goods-lines"),
  senderDepartureToggle: document.getElementById("sender-different-departure"),
  senderDepartureFields: document.getElementById("sender-departure-fields"),
  customerDeliveryToggle: document.getElementById("customer-different-delivery"),
  customerDeliveryFields: document.getElementById("customer-delivery-fields"),
  transportStart: document.getElementById("transport-start"),
  carrierType: document.getElementById("carrier-type"),
  thirdPartyCarrierFields: document.getElementById("third-party-carrier-fields"),
  orderNumber: document.getElementById("order-number"),
  orderDate: document.getElementById("order-date"),
  orderDdtNumber: document.getElementById("order-ddt-number"),
  orderCustomer: document.getElementById("order-customer"),
  orderItems: document.getElementById("order-items"),
  orderTotal: document.getElementById("order-total"),
  printShippingNoteButton: document.getElementById("print-shipping-note"),
  connectionMessage: document.getElementById("connection-message"),
  toolbar: document.querySelector(".toolbar"),
  toolbarImport: document.querySelector(".toolbar-import"),
  categoryFilter: document.getElementById("category-filter"),
  categoryOptions: document.getElementById("category-options"),
  productCount: document.getElementById("product-count"),
  productList: document.getElementById("product-list"),
  appMessage: document.getElementById("app-message"),
  importButton: document.getElementById("import-button"),
  jsonFile: document.getElementById("json-file"),
  importProgress: document.getElementById("import-progress"),
  photoBatchButton: document.getElementById("photo-batch-button"),
  photoBatchFiles: document.getElementById("photo-batch-files"),
  photoBatchProgress: document.getElementById("photo-batch-progress"),
  addProductButton: document.getElementById("add-product-button"),
  deleteAllButton: document.getElementById("delete-all-button"),
  productDialog: document.getElementById("product-dialog"),
  productForm: document.getElementById("product-form"),
  productFormTitle: document.getElementById("product-form-title"),
  productFormMessage: document.getElementById("product-form-message"),
  saveProductButton: document.getElementById("save-product-button"),
  productId: document.getElementById("product-id"),
  productName: document.getElementById("product-name"),
  productCode: document.getElementById("product-code"),
  productPrice: document.getElementById("product-price"),
  productAltPrice: document.getElementById("product-alt-price"),
  productPackage: document.getElementById("product-package"),
  productCategory: document.getElementById("product-category"),
  productFeatures: document.getElementById("product-features"),
  productPhoto: document.getElementById("product-photo"),
  photoPreview: document.getElementById("photo-preview"),
  photoPlaceholder: document.getElementById("photo-placeholder"),
  photoStatus: document.getElementById("photo-status"),
  searchArea: document.getElementById("search-area"),
  searchInput: document.getElementById("search-input"),
  suggestions: document.getElementById("suggestions"),
  detailDialog: document.getElementById("detail-dialog"),
  detailContent: document.getElementById("detail-content")
};

const prodottiRef = collection(db, "prodotti");
const ordiniRef = collection(db, "ordini");
const formatterPrezzo = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR"
});
let prodotti = [];
let carrello = new Map();
let interrompiAscolto = null;
let interrompiCarrelloAscolto = null;
let interrompiOrdiniAscolto = null;
let utenteCorrente = null;
let carrelloCaricato = false;
let catalogoCaricato = false;
let scritturaCarrello = Promise.resolve();
let ordineCorrente = null;
let ordini = [];
let righeOrdineInModifica = [];
let utenteAmministratore = false;
let suggerimentiVisibili = [];
let indiceSuggerimento = -1;
let timerRicerca = null;
let urlAnteprima = null;

function normalizza(testo) {
  return String(testo ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("it-IT");
}

function mostraMessaggio(elemento, testo, tipo = "errore") {
  elemento.textContent = testo;
  elemento.classList.toggle("message-success", tipo === "successo");
  elemento.classList.toggle("message-warning", tipo === "avviso");
}

function impostaPermessiCatalogo(amministratore) {
  utenteAmministratore = amministratore;
  elementi.orderDashboardButton.hidden = !amministratore;
  elementi.mobileOrderDashboardButton.hidden = !amministratore;
  elementi.addProductButton.hidden = !amministratore;
  elementi.deleteAllButton.hidden = !amministratore;
  elementi.toolbarImport.hidden = !amministratore;
  elementi.cartButton.hidden = !amministratore;
  elementi.mobileCartButton.hidden = !amministratore;
  if (!amministratore) {
    if (interrompiCarrelloAscolto) interrompiCarrelloAscolto();
    interrompiCarrelloAscolto = null;
    if (interrompiOrdiniAscolto) interrompiOrdiniAscolto();
    interrompiOrdiniAscolto = null;
    ordini = [];
    carrello.clear();
    carrelloCaricato = false;
    scritturaCarrello = Promise.resolve();
    elementi.cartPage.hidden = true;
    elementi.orderSummaryPage.hidden = true;
    elementi.ordersPage.hidden = true;
    elementi.cartMessage.textContent = "";
    elementi.ordersMessage.textContent = "";
    elementi.ordersCount.textContent = "Storico ordini non disponibile";
    elementi.ordersList.replaceChildren();
    if (elementi.orderEditDialog.open) elementi.orderEditDialog.close();
    elementi.orderEditForm.reset();
    elementi.mobileMenu.open = false;
    mostraCarrello(false);
    aggiornaCarrello();
  }
  if (catalogoCaricato) filtraProdotti();
}

async function caricaPermessiCatalogo(uid) {
  impostaPermessiCatalogo(false);
  try {
    const amministratore = await getDoc(doc(db, "admins", uid));
    if (utenteCorrente?.uid !== uid) return;
    const abilitato = amministratore.exists() && amministratore.data().abilitato === true;
    impostaPermessiCatalogo(abilitato);
    if (abilitato) {
      iniziaAscoltoCarrello(uid);
      iniziaAscoltoOrdini();
    }
  } catch (errore) {
    console.error("Errore durante la verifica dei permessi amministratore:", errore);
    if (utenteCorrente?.uid !== uid) return;
    impostaPermessiCatalogo(false);
  }
}

function formattaPrezzo(prezzo) {
  return typeof prezzo === "number" && Number.isFinite(prezzo)
    ? formatterPrezzo.format(prezzo)
    : "Prezzo non indicato";
}

function creaPlaceholder(classe = "product-photo-placeholder") {
  const placeholder = document.createElement("div");
  placeholder.className = classe;
  placeholder.setAttribute("aria-label", "Foto non disponibile");
  placeholder.textContent = "🍬";
  return placeholder;
}

function creaImmagine(url, classe, descrizione) {
  const immagine = document.createElement("img");
  immagine.className = classe;
  immagine.alt = descrizione;
  immagine.loading = "lazy";
  immagine.src = url;
  immagine.addEventListener("error", () => {
    const classePlaceholder = classe === "cart-item-photo" ? "cart-item-photo-placeholder" : "product-photo-placeholder";
    immagine.replaceWith(creaPlaceholder(classePlaceholder));
  }, { once: true });
  return immagine;
}

function creaRigaDettaglio(etichetta, valore) {
  const termine = document.createElement("dt");
  termine.textContent = etichetta;
  const descrizione = document.createElement("dd");
  descrizione.textContent = valore || "—";
  return [termine, descrizione];
}

function ottieniProdottiFiltrati() {
  const categoria = elementi.categoryFilter.value;
  return prodotti.filter((prodotto) => !categoria || prodotto.categoria === categoria);
}

function aggiornaCategorie() {
  const categorie = [...new Set(prodotti.map((prodotto) => prodotto.categoria).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "it"));
  const selezionata = elementi.categoryFilter.value;
  elementi.categoryFilter.replaceChildren(new Option("Tutte le categorie", ""));
  elementi.categoryOptions.replaceChildren();
  categorie.forEach((categoria) => {
    elementi.categoryFilter.add(new Option(categoria, categoria));
    const opzione = document.createElement("option");
    opzione.value = categoria;
    elementi.categoryOptions.append(opzione);
  });
  elementi.categoryFilter.value = categorie.includes(selezionata) ? selezionata : "";
}

function creaSchedaProdotto(prodotto) {
  const scheda = document.createElement("article");
  scheda.className = "product-card";
  const contenuto = document.createElement("div");
  contenuto.className = "product-card-content";
  contenuto.setAttribute("role", "button");
  contenuto.setAttribute("tabindex", "0");
  contenuto.setAttribute("aria-haspopup", "dialog");
  contenuto.setAttribute("aria-label", `Apri i dettagli di ${prodotto.nome || "prodotto"}`);
  contenuto.addEventListener("click", () => apriDettaglio(prodotto));
  contenuto.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      apriDettaglio(prodotto);
    }
  });

  if (prodotto.fotoUrl) {
    contenuto.append(creaImmagine(prodotto.fotoUrl, "product-photo", `Foto di ${prodotto.nome}`));
  } else {
    contenuto.append(creaPlaceholder());
  }

  const corpo = document.createElement("div");
  corpo.className = "product-card-body";
  const titolo = document.createElement("h2");
  titolo.textContent = prodotto.nome || "Prodotto senza nome";
  const codice = document.createElement("div");
  codice.className = "product-code";
  codice.textContent = `Codice: ${prodotto.codice || "—"}`;
  const prezzo = document.createElement("p");
  prezzo.className = "product-price";
  prezzo.textContent = formattaPrezzo(prodotto.prezzo);
  if (typeof prodotto.prezzoAlt === "number") {
    const alt = document.createElement("small");
    alt.textContent = `Alt.: ${formattaPrezzo(prodotto.prezzoAlt)}`;
    prezzo.append(alt);
  }

  const fatti = document.createElement("div");
  fatti.className = "product-facts";
  const confezione = document.createElement("span");
  confezione.textContent = `Confezione: ${prodotto.confezione || "—"}`;
  const categoria = document.createElement("span");
  categoria.textContent = `Categoria: ${prodotto.categoria || "—"}`;
  fatti.append(confezione, categoria);
  corpo.append(titolo, codice, prezzo, fatti);

  if (prodotto.caratteristiche) {
    const caratteristiche = document.createElement("p");
    caratteristiche.className = "product-features";
    caratteristiche.textContent = prodotto.caratteristiche;
    corpo.append(caratteristiche);
  }

  const azioni = document.createElement("div");
  azioni.className = "card-actions";
  if (utenteAmministratore) {
    const modifica = document.createElement("button");
    modifica.className = "button button-secondary";
    modifica.type = "button";
    modifica.textContent = "Modifica";
    modifica.addEventListener("click", () => apriFormProdotto(prodotto));
    const elimina = document.createElement("button");
    elimina.className = "button button-danger";
    elimina.type = "button";
    elimina.textContent = "Elimina";
    elimina.addEventListener("click", () => eliminaProdotto(prodotto));
    azioni.append(modifica, elimina);
  }
  if (utenteAmministratore) {
    const aggiungiAlCarrelloButton = document.createElement("button");
    aggiungiAlCarrelloButton.className = "button button-primary button-cart";
    aggiungiAlCarrelloButton.type = "button";
    aggiungiAlCarrelloButton.textContent = "Aggiungi al carrello";
    aggiungiAlCarrelloButton.addEventListener("click", () => aggiungiAlCarrello(prodotto));
    azioni.append(aggiungiAlCarrelloButton);
  }
  contenuto.append(corpo);
  scheda.append(contenuto, azioni);
  return scheda;
}

function filtraProdotti() {
  const visibili = ottieniProdottiFiltrati();
  elementi.productCount.textContent = `${visibili.length} ${visibili.length === 1 ? "prodotto" : "prodotti"}`;
  elementi.productList.replaceChildren();
  if (visibili.length === 0) {
    const vuoto = document.createElement("p");
    vuoto.className = "empty-state";
    vuoto.textContent = prodotti.length ? "Nessun prodotto in questa categoria." : "Il catalogo è vuoto. Puoi importare il file JSON o aggiungere un prodotto.";
    elementi.productList.append(vuoto);
    return;
  }
  visibili.forEach((prodotto) => elementi.productList.append(creaSchedaProdotto(prodotto)));
}

async function aggiungiAlCarrello(prodotto, messaggio = elementi.appMessage) {
  if (!utenteAmministratore) return;
  if (!carrelloCaricato) {
    mostraMessaggio(messaggio, "Il carrello del tuo account è ancora in caricamento. Riprova tra poco.", "avviso");
    return;
  }
  const riga = carrello.get(prodotto.id);
  carrello.set(prodotto.id, { quantita: (riga?.quantita || 0) + 1 });
  aggiornaCarrello();
  try {
    await persistiCarrello();
    mostraMessaggio(messaggio, `${prodotto.nome} aggiunto al carrello.`, "successo");
  } catch (errore) {
    mostraMessaggio(messaggio, messaggioErroreCarrello(errore));
  }
}

function creaRigaCarrello(prodotto, quantita) {
  const riga = document.createElement("article");
  riga.className = "cart-item";
  const principale = document.createElement("div");
  principale.className = "cart-item-main";
  if (prodotto.fotoUrl) {
    principale.append(creaImmagine(prodotto.fotoUrl, "cart-item-photo", `Foto di ${prodotto.nome}`));
  } else {
    const segnaposto = document.createElement("div");
    segnaposto.className = "cart-item-photo-placeholder";
    segnaposto.textContent = "🍬";
    segnaposto.setAttribute("aria-label", "Foto non disponibile");
    principale.append(segnaposto);
  }

  const dettagli = document.createElement("div");
  dettagli.className = "cart-item-details";
  const nome = document.createElement("h2");
  nome.textContent = prodotto.nome || "Prodotto senza nome";
  const codice = document.createElement("p");
  codice.className = "cart-item-code";
  codice.textContent = `Codice: ${prodotto.codice || "—"}`;
  const prezzo = document.createElement("p");
  prezzo.className = "cart-item-unit-price";
  prezzo.textContent = `Prezzo unitario: ${formattaPrezzo(prodotto.prezzo)}`;
  dettagli.append(nome, codice, prezzo);
  principale.append(dettagli);

  const controlli = document.createElement("div");
  controlli.className = "cart-item-controls";
  const quantitaControlli = document.createElement("div");
  quantitaControlli.className = "quantity-control";
  const meno = document.createElement("button");
  meno.className = "quantity-button";
  meno.type = "button";
  meno.textContent = "−";
  meno.disabled = quantita <= 1;
  meno.setAttribute("aria-label", `Riduci quantità di ${prodotto.nome}`);
  meno.dataset.cartAction = "decrementa";
  meno.dataset.productId = prodotto.id;
  const quantitaTesto = document.createElement("span");
  quantitaTesto.className = "quantity-value";
  quantitaTesto.textContent = String(quantita);
  const piu = document.createElement("button");
  piu.className = "quantity-button";
  piu.type = "button";
  piu.textContent = "+";
  piu.setAttribute("aria-label", `Aumenta quantità di ${prodotto.nome}`);
  piu.dataset.cartAction = "incrementa";
  piu.dataset.productId = prodotto.id;
  quantitaControlli.append(meno, quantitaTesto, piu);

  const subtotale = document.createElement("strong");
  subtotale.className = "cart-item-subtotal";
  subtotale.textContent = typeof prodotto.prezzo === "number" && Number.isFinite(prodotto.prezzo)
    ? formattaPrezzo(prodotto.prezzo * quantita)
    : "Totale non disponibile";
  const rimuovi = document.createElement("button");
  rimuovi.className = "button button-quiet cart-remove-button";
  rimuovi.type = "button";
  rimuovi.textContent = "Rimuovi";
  rimuovi.dataset.cartAction = "rimuovi";
  rimuovi.dataset.productId = prodotto.id;
  controlli.append(quantitaControlli, subtotale, rimuovi);
  riga.append(principale, controlli);
  return riga;
}

function aggiornaCarrello() {
  const prodottiPerId = new Map(prodotti.map((prodotto) => [prodotto.id, prodotto]));
  const numeroPrimaDelControllo = carrello.size;
  if (catalogoCaricato) {
    for (const id of carrello.keys()) {
      if (!prodottiPerId.has(id)) carrello.delete(id);
    }
  }
  if (carrello.size !== numeroPrimaDelControllo && carrelloCaricato && utenteCorrente) {
    persistiCarrello().catch((errore) => mostraMessaggio(elementi.cartMessage, messaggioErroreCarrello(errore)));
  }
  const righe = [...carrello.entries()]
    .map(([id, dati]) => ({ prodotto: prodottiPerId.get(id), quantita: dati.quantita }))
    .filter((riga) => riga.prodotto);
  const numeroArticoli = righe.reduce((totale, riga) => totale + riga.quantita, 0);
  elementi.cartCount.textContent = String(numeroArticoli);
  elementi.cartButton.setAttribute("aria-label", `Apri carrello, ${numeroArticoli} ${numeroArticoli === 1 ? "articolo" : "articoli"}`);
  elementi.cartItems.replaceChildren(...righe.map((riga) => creaRigaCarrello(riga.prodotto, riga.quantita)));
  elementi.cartEmpty.hidden = righe.length > 0;
  elementi.cartSummary.hidden = righe.length === 0;
  elementi.cartTotalItems.textContent = String(numeroArticoli);

  let totale = 0;
  let quantitaSenzaPrezzo = 0;
  righe.forEach(({ prodotto, quantita }) => {
    if (typeof prodotto.prezzo === "number" && Number.isFinite(prodotto.prezzo)) {
      totale += prodotto.prezzo * quantita;
    } else {
      quantitaSenzaPrezzo += quantita;
    }
  });
  elementi.cartTotalPrice.textContent = formatterPrezzo.format(totale);
  elementi.cartTotalLabel.textContent = quantitaSenzaPrezzo ? "Totale parziale" : "Totale";
  elementi.cartUnknownPrices.hidden = quantitaSenzaPrezzo === 0;
  if (quantitaSenzaPrezzo) {
    elementi.cartUnknownPrices.textContent = `${quantitaSenzaPrezzo} ${quantitaSenzaPrezzo === 1 ? "articolo senza prezzo non è incluso" : "articoli senza prezzo non sono inclusi"} nel totale.`;
  }
}

function mostraCarrello(aperto) {
  if (aperto && !utenteAmministratore) return;
  elementi.catalogPage.hidden = aperto;
  elementi.cartPage.hidden = !aperto;
  elementi.orderSummaryPage.hidden = true;
  elementi.ordersPage.hidden = true;
  elementi.searchArea.hidden = aperto;
  elementi.cartButton.setAttribute("aria-label", aperto ? "Torna al catalogo" : `Apri carrello, ${elementi.cartCount.textContent} articoli`);
  chiudiSuggerimenti();
  if (aperto) aggiornaCarrello();
}

function mostraDashboardOrdini(aperto) {
  if (aperto && !utenteAmministratore) return;
  elementi.catalogPage.hidden = aperto;
  elementi.cartPage.hidden = true;
  elementi.orderSummaryPage.hidden = true;
  elementi.ordersPage.hidden = !aperto;
  elementi.searchArea.hidden = aperto;
  chiudiSuggerimenti();
  if (aperto) mostraOrdini();
}

function dataOrdineInMillisecondi(valore) {
  const data = typeof valore?.toDate === "function"
    ? valore.toDate()
    : valore instanceof Date ? valore : null;
  return data && Number.isFinite(data.getTime()) ? data.getTime() : 0;
}

function formattaDataOrdine(valore) {
  const millisecondi = dataOrdineInMillisecondi(valore);
  return millisecondi
    ? new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(millisecondi)
    : "Data non disponibile";
}

function statoOrdine(ordine) {
  return ordine.stato === "annullato" ? "annullato" : "ricevuto";
}

function creaInfoOrdine(etichetta, valore) {
  const contenitore = document.createElement("div");
  const titolo = document.createElement("strong");
  titolo.textContent = etichetta;
  const testo = document.createElement("span");
  testo.textContent = valore || "—";
  contenitore.append(titolo, testo);
  return contenitore;
}

function creaSchedaOrdine(ordine) {
  const scheda = document.createElement("article");
  scheda.className = "order-card";
  const destinatario = ordine.destinatario || {};
  const status = statoOrdine(ordine);
  const intestazione = document.createElement("div");
  intestazione.className = "order-card-heading";
  const titolo = document.createElement("div");
  const numero = document.createElement("h2");
  numero.textContent = ordine.numero || "Ordine senza numero";
  const meta = document.createElement("div");
  meta.className = "order-card-meta";
  meta.textContent = `Ricevuto il ${formattaDataOrdine(ordine.creatoIl)}`;
  titolo.append(numero, meta);
  const etichettaStato = document.createElement("span");
  etichettaStato.className = `order-status${status === "annullato" ? " cancelled" : ""}`;
  etichettaStato.textContent = status === "annullato" ? "Annullato" : "Ricevuto";
  intestazione.append(titolo, etichettaStato);

  const items = Array.isArray(ordine.items) ? ordine.items : [];
  const riepilogo = document.createElement("div");
  riepilogo.className = "order-card-summary";
  riepilogo.append(
    creaInfoOrdine("Cliente", destinatario.nome),
    creaInfoOrdine("Telefono", destinatario.telefono),
    creaInfoOrdine("Destinazione", [destinatario.indirizzo, destinatario.cap, destinatario.citta, destinatario.provincia].filter(Boolean).join(", ")),
    creaInfoOrdine("Totale", formattaPrezzo(ordine.totale)),
    creaInfoOrdine("Articoli", String(items.reduce((totale, articolo) => totale + (Number(articolo.quantita) || 0), 0)))
  );

  const dettagli = document.createElement("details");
  dettagli.className = "order-card-details";
  const apriDettagli = document.createElement("summary");
  apriDettagli.textContent = "Dettagli destinatario e prodotti";
  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = `Email: ${destinatario.email || "—"} · Note: ${destinatario.note || "—"}`;
  const elenco = document.createElement("ul");
  items.forEach((articolo) => {
    const riga = document.createElement("li");
    const subtotale = typeof articolo.subtotale === "number"
      ? articolo.subtotale
      : Number(articolo.prezzo) * Number(articolo.quantita);
    riga.textContent = `${articolo.nome || "Prodotto"}${articolo.codice ? ` (${articolo.codice})` : ""} · ${articolo.quantita || 0} × ${formattaPrezzo(articolo.prezzo)} = ${formattaPrezzo(subtotale)}`;
    elenco.append(riga);
  });
  dettagli.append(apriDettagli, note, elenco);
  scheda.append(intestazione, riepilogo, dettagli);

  if (status !== "annullato") {
    const azioni = document.createElement("div");
    azioni.className = "order-card-actions";
    const modifica = document.createElement("button");
    modifica.className = "button button-secondary";
    modifica.type = "button";
    modifica.textContent = "Modifica ordine";
    modifica.dataset.orderAction = "modifica";
    modifica.dataset.orderId = ordine.id;
    const annulla = document.createElement("button");
    annulla.className = "button button-danger";
    annulla.type = "button";
    annulla.textContent = "Annulla ordine";
    annulla.dataset.orderAction = "annulla";
    annulla.dataset.orderId = ordine.id;
    azioni.append(modifica, annulla);
    scheda.append(azioni);
  }
  return scheda;
}

function mostraOrdini() {
  const filtro = elementi.orderStatusFilter.value;
  const ordinati = [...ordini].sort((a, b) =>
    dataOrdineInMillisecondi(b.creatoIl) - dataOrdineInMillisecondi(a.creatoIl)
  );
  const visibili = ordinati.filter((ordine) => !filtro || statoOrdine(ordine) === filtro);
  elementi.ordersCount.textContent = `${visibili.length} ${visibili.length === 1 ? "ordine" : "ordini"}`;
  if (!visibili.length) {
    const vuoto = document.createElement("p");
    vuoto.className = "empty-state";
    vuoto.textContent = ordini.length
      ? "Nessun ordine corrisponde al filtro selezionato."
      : "Non ci sono ordini nello storico.";
    elementi.ordersList.replaceChildren(vuoto);
    return;
  }
  elementi.ordersList.replaceChildren(...visibili.map(creaSchedaOrdine));
}

function iniziaAscoltoOrdini() {
  if (interrompiOrdiniAscolto) interrompiOrdiniAscolto();
  elementi.ordersCount.textContent = "Caricamento ordini...";
  interrompiOrdiniAscolto = onSnapshot(ordiniRef, (istantanea) => {
    if (!utenteAmministratore) return;
    ordini = istantanea.docs.map((documento) => ({ ...documento.data(), id: documento.id }));
    mostraOrdini();
    if (!istantanea.metadata.fromCache) elementi.ordersMessage.textContent = "";
  }, (errore) => {
    console.error("Errore durante il caricamento dello storico ordini:", errore);
    mostraMessaggio(elementi.ordersMessage, errore.code === "permission-denied"
      ? "Permesso negato: pubblica le nuove regole Firestore per gli ordini."
      : "Non è stato possibile caricare lo storico ordini. Controlla la connessione e riprova.");
    elementi.ordersCount.textContent = "Storico non disponibile";
  });
}

function erroreOperazioneOrdine(errore) {
  if (!navigator.onLine || errore?.code === "unavailable") {
    return "Connettiti a internet per modificare gli ordini.";
  }
  if (errore?.code === "permission-denied") {
    return "Permesso negato: verifica che le regole Firestore aggiornate siano pubblicate.";
  }
  return "Non è stato possibile salvare le modifiche. Riprova.";
}

async function annullaOrdine(ordine, pulsante) {
  if (statoOrdine(ordine) === "annullato") return;
  if (!window.confirm(`Vuoi annullare l'ordine ${ordine.numero || ""}? Lo storico verrà conservato.`)) return;
  if (!navigator.onLine) {
    mostraMessaggio(elementi.ordersMessage, "Connettiti a internet per modificare gli ordini.");
    return;
  }
  pulsante.disabled = true;
  try {
    await updateDoc(doc(db, "ordini", ordine.id), {
      stato: "annullato",
      annullatoIl: serverTimestamp(),
      aggiornatoIl: serverTimestamp()
    });
    mostraMessaggio(elementi.ordersMessage, `Ordine ${ordine.numero || ""} annullato.`, "successo");
  } catch (errore) {
    console.error("Errore durante l'annullamento dell'ordine:", errore);
    mostraMessaggio(elementi.ordersMessage, erroreOperazioneOrdine(errore));
  } finally {
    pulsante.disabled = false;
  }
}

function popolaSelettoreProdottiOrdine() {
  const opzioni = [new Option("Seleziona dal catalogo", "")];
  prodotti.forEach((prodotto) => {
    const opzione = new Option(
      `${prodotto.nome || "Prodotto"} · ${prodotto.codice || "senza codice"} · ${formattaPrezzo(prodotto.prezzo)}`,
      prodotto.id
    );
    opzione.disabled = typeof prodotto.prezzo !== "number" || !Number.isFinite(prodotto.prezzo) || prodotto.prezzo < 0;
    opzioni.push(opzione);
  });
  elementi.orderAddProductSelect.replaceChildren(...opzioni);
}

function aggiornaTotaleEditorOrdine() {
  const quantitaInput = [...elementi.orderEditItems.querySelectorAll("[data-order-item-quantity]")];
  let valido = righeOrdineInModifica.length > 0 && quantitaInput.length === righeOrdineInModifica.length;
  let totale = 0;
  quantitaInput.forEach((input, indice) => {
    const quantita = Number(input.value);
    const prezzo = righeOrdineInModifica[indice].prezzo;
    if (!Number.isInteger(quantita) || quantita < 1 || !Number.isFinite(prezzo) || prezzo < 0) {
      valido = false;
    } else {
      righeOrdineInModifica[indice].quantita = quantita;
      totale += prezzo * quantita;
    }
  });
  elementi.orderEditTotal.textContent = `Totale ordine: ${formattaPrezzo(totale)}`;
  elementi.saveOrderButton.disabled = !valido;
}

function renderRigheEditorOrdine() {
  if (!righeOrdineInModifica.length) {
    const vuoto = document.createElement("p");
    vuoto.className = "muted";
    vuoto.textContent = "L'ordine deve contenere almeno un prodotto.";
    elementi.orderEditItems.replaceChildren(vuoto);
    aggiornaTotaleEditorOrdine();
    return;
  }
  const righe = righeOrdineInModifica.map((articolo, indice) => {
    const riga = document.createElement("div");
    riga.className = "order-edit-line";
    const descrizione = document.createElement("div");
    descrizione.className = "order-edit-line-name";
    descrizione.textContent = articolo.nome || "Prodotto";
    const codice = document.createElement("small");
    codice.textContent = `${articolo.codice || "Senza codice"} · ${formattaPrezzo(articolo.prezzo)} cad.`;
    descrizione.append(codice);
    const quantita = document.createElement("input");
    quantita.type = "number";
    quantita.min = "1";
    quantita.step = "1";
    quantita.required = true;
    quantita.value = String(articolo.quantita);
    quantita.setAttribute("aria-label", `Quantità di ${articolo.nome || "prodotto"}`);
    quantita.dataset.orderItemQuantity = String(indice);
    const rimuovi = document.createElement("button");
    rimuovi.className = "button button-danger";
    rimuovi.type = "button";
    rimuovi.textContent = "Rimuovi";
    rimuovi.dataset.removeOrderItem = String(indice);
    riga.append(descrizione, quantita, rimuovi);
    return riga;
  });
  elementi.orderEditItems.replaceChildren(...righe);
  aggiornaTotaleEditorOrdine();
}

function apriModificaOrdine(ordine) {
  if (!utenteAmministratore || statoOrdine(ordine) === "annullato") return;
  elementi.orderEditForm.reset();
  mostraMessaggio(elementi.orderEditMessage, "");
  elementi.orderEditId.value = ordine.id;
  elementi.orderEditTitle.textContent = `Modifica ${ordine.numero || "ordine"}`;
  elementi.orderEditDdtNote.hidden = !ordine.ddt;
  const destinatario = ordine.destinatario || {};
  [
    ["edit-customer-name", destinatario.nome],
    ["edit-customer-phone", destinatario.telefono],
    ["edit-customer-email", destinatario.email],
    ["edit-customer-address", destinatario.indirizzo],
    ["edit-customer-postal-code", destinatario.cap],
    ["edit-customer-city", destinatario.citta],
    ["edit-customer-province", destinatario.provincia],
    ["edit-customer-notes", destinatario.note]
  ].forEach(([id, valore]) => { document.getElementById(id).value = valore || ""; });
  righeOrdineInModifica = (Array.isArray(ordine.items) ? ordine.items : []).map((articolo) => ({
    productId: articolo.productId || "",
    nome: articolo.nome || "Prodotto",
    codice: articolo.codice || "",
    confezione: articolo.confezione || "",
    prezzo: Number(articolo.prezzo),
    quantita: Number.isInteger(articolo.quantita) && articolo.quantita > 0 ? articolo.quantita : 1
  }));
  popolaSelettoreProdottiOrdine();
  renderRigheEditorOrdine();
  elementi.orderEditDialog.showModal();
}

function aggiungiProdottoAllOrdine() {
  const id = elementi.orderAddProductSelect.value;
  const prodotto = prodotti.find((voce) => voce.id === id);
  if (!prodotto) return;
  const rigaEsistente = righeOrdineInModifica.find((voce) => voce.productId === prodotto.id);
  if (!rigaEsistente && righeOrdineInModifica.length >= 100) {
    mostraMessaggio(elementi.orderEditMessage, "Un ordine può contenere al massimo 100 righe.");
    return;
  }
  if (rigaEsistente) {
    rigaEsistente.quantita += 1;
  } else {
    righeOrdineInModifica.push({
      productId: prodotto.id,
      nome: prodotto.nome || "Prodotto",
      codice: prodotto.codice || "",
      confezione: prodotto.confezione || "",
      prezzo: prodotto.prezzo,
      quantita: 1
    });
  }
  elementi.orderAddProductSelect.value = "";
  mostraMessaggio(elementi.orderEditMessage, "");
  renderRigheEditorOrdine();
}

async function salvaModificheOrdine(evento) {
  evento.preventDefault();
  if (!utenteAmministratore) return;
  if (!navigator.onLine) {
    mostraMessaggio(elementi.orderEditMessage, "Connettiti a internet per modificare gli ordini.");
    return;
  }
  const ordine = ordini.find((voce) => voce.id === elementi.orderEditId.value);
  if (!ordine || statoOrdine(ordine) === "annullato") {
    mostraMessaggio(elementi.orderEditMessage, "Questo ordine non è più modificabile.");
    return;
  }
  aggiornaTotaleEditorOrdine();
  if (elementi.saveOrderButton.disabled) {
    mostraMessaggio(elementi.orderEditMessage, "Inserisci almeno un prodotto e quantità valide.");
    return;
  }
  if (!window.confirm(`Salvare le modifiche all'ordine ${ordine.numero || ""}?`)) return;

  const datiModulo = new FormData(elementi.orderEditForm);
  const destinatario = {
    nome: String(datiModulo.get("nome") || "").trim(),
    telefono: String(datiModulo.get("telefono") || "").trim(),
    email: String(datiModulo.get("email") || "").trim(),
    indirizzo: String(datiModulo.get("indirizzo") || "").trim(),
    cap: String(datiModulo.get("cap") || "").trim(),
    citta: String(datiModulo.get("citta") || "").trim(),
    provincia: String(datiModulo.get("provincia") || "").trim(),
    note: String(datiModulo.get("note") || "").trim()
  };
  const items = righeOrdineInModifica.map((articolo) => ({
    productId: articolo.productId,
    nome: articolo.nome,
    codice: articolo.codice,
    confezione: articolo.confezione,
    prezzo: articolo.prezzo,
    quantita: articolo.quantita,
    subtotale: Math.round(articolo.prezzo * articolo.quantita * 100) / 100
  }));
  const totale = Math.round(items.reduce((somma, articolo) => somma + articolo.subtotale, 0) * 100) / 100;
  const aggiornamento = {
    destinatario,
    items,
    totale,
    stato: statoOrdine(ordine),
    aggiornatoIl: serverTimestamp()
  };
  elementi.saveOrderButton.disabled = true;
  mostraMessaggio(elementi.orderEditMessage, "Salvataggio modifiche...", "avviso");
  try {
    await updateDoc(doc(db, "ordini", ordine.id), aggiornamento);
    elementi.orderEditDialog.close();
    const messaggio = ordine.ddt
      ? `Ordine ${ordine.numero || ""} aggiornato. Il DDT numerato resta invariato come documento emesso.`
      : `Ordine ${ordine.numero || ""} aggiornato.`;
    mostraMessaggio(elementi.ordersMessage, messaggio, "successo");
  } catch (errore) {
    console.error("Errore durante la modifica dell'ordine:", errore);
    mostraMessaggio(elementi.orderEditMessage, erroreOperazioneOrdine(errore));
  } finally {
    aggiornaTotaleEditorOrdine();
  }
}

function messaggioErroreCarrello(errore) {
  if (!navigator.onLine || errore?.code === "unavailable") {
    return "Connessione assente: il carrello non è stato sincronizzato. Riprova quando sei online.";
  }
  if (errore?.code === "permission-denied") {
    return "Accesso al carrello negato: verifica le regole Firestore e riprova.";
  }
  return "Non è stato possibile salvare il carrello. Riprova.";
}

function persistiCarrello() {
  if (!utenteAmministratore || !utenteCorrente || !carrelloCaricato) {
    return Promise.reject(new Error("Il carrello dell'account non è ancora disponibile."));
  }
  const uid = utenteCorrente.uid;
  const items = [...carrello.entries()].map(([productId, dati]) => ({
    productId,
    quantita: dati.quantita
  }));
  const richiesta = scritturaCarrello.catch(() => {}).then(() =>
    setDoc(doc(db, "carrelli", uid), {
      items,
      aggiornatoIl: serverTimestamp()
    })
  );
  scritturaCarrello = richiesta;
  return richiesta.catch((errore) => {
    console.error("Errore durante il salvataggio del carrello:", errore);
    throw errore;
  });
}

async function gestisciAzioneCarrello(evento) {
  const pulsante = evento.target.closest("button[data-cart-action]");
  if (!pulsante) return;
  const id = pulsante.dataset.productId;
  const riga = carrello.get(id);
  if (!riga) return;

  if (pulsante.dataset.cartAction === "rimuovi") {
    carrello.delete(id);
  } else {
    const incremento = pulsante.dataset.cartAction === "incrementa" ? 1 : -1;
    riga.quantita = Math.max(1, riga.quantita + incremento);
    carrello.set(id, riga);
  }
  aggiornaCarrello();
  try {
    await persistiCarrello();
    mostraMessaggio(elementi.cartMessage, pulsante.dataset.cartAction === "rimuovi"
      ? "Prodotto rimosso dal carrello."
      : "Carrello aggiornato.", "successo");
  } catch (errore) {
    mostraMessaggio(elementi.cartMessage, messaggioErroreCarrello(errore));
  }
}

async function svuotaCarrello() {
  if (!carrello.size) return;
  if (!window.confirm("Vuoi rimuovere tutti i prodotti dal carrello?")) return;
  carrello.clear();
  aggiornaCarrello();
  try {
    await persistiCarrello();
    mostraMessaggio(elementi.cartMessage, "Carrello svuotato.", "successo");
  } catch (errore) {
    mostraMessaggio(elementi.cartMessage, messaggioErroreCarrello(errore));
  }
}

function raccogliRigheOrdine() {
  if (!carrello.size) throw new Error("Il carrello è vuoto.");
  const prodottiPerId = new Map(prodotti.map((prodotto) => [prodotto.id, prodotto]));
  return [...carrello.entries()].map(([id, dati]) => {
    const prodotto = prodottiPerId.get(id);
    if (!prodotto) throw new Error("Un prodotto del carrello non è più disponibile nel catalogo.");
    if (typeof prodotto.prezzo !== "number" || !Number.isFinite(prodotto.prezzo)) {
      throw new Error(`Manca il prezzo per «${prodotto.nome || "un prodotto"}». Aggiorna il catalogo prima di inviare l'ordine.`);
    }
    return {
      productId: id,
      nome: prodotto.nome || "Prodotto",
      codice: prodotto.codice || "",
      confezione: prodotto.confezione || "",
      prezzo: prodotto.prezzo,
      quantita: dati.quantita,
      subtotale: prodotto.prezzo * dati.quantita
    };
  });
}

function aggiornaCampiCondizionaliDdt() {
  elementi.senderDepartureFields.hidden = !elementi.senderDepartureToggle.checked;
  elementi.senderDepartureFields.disabled = !elementi.senderDepartureToggle.checked;
  elementi.customerDeliveryFields.hidden = !elementi.customerDeliveryToggle.checked;
  elementi.customerDeliveryFields.disabled = !elementi.customerDeliveryToggle.checked;
  const vettoreTerzo = elementi.carrierType.value === "Vettore Terzo";
  elementi.thirdPartyCarrierFields.hidden = !vettoreTerzo;
  elementi.thirdPartyCarrierFields.disabled = !vettoreTerzo;
}

function ripristinaMittenteDdt() {
  try {
    const salvati = JSON.parse(localStorage.getItem(DDT_SENDER_STORAGE_KEY) || "null");
    if (!salvati || typeof salvati !== "object") return;
    DDT_SENDER_FIELD_NAMES.forEach((nome) => {
      const campo = elementi.checkoutForm.elements.namedItem(nome);
      if (campo && typeof salvati[nome] === "string") campo.value = salvati[nome];
    });
    elementi.senderDepartureToggle.checked = salvati.partenzaDiversa === true;
  } catch (errore) {
    console.warn("Non è stato possibile ripristinare i dati mittente salvati sul dispositivo:", errore);
  }
}

function salvaMittenteDdt(modulo) {
  const dati = Object.fromEntries(
    DDT_SENDER_FIELD_NAMES.map((nome) => [nome, String(modulo.get(nome) || "").trim()])
  );
  dati.partenzaDiversa = modulo.get("mittente-partenza-diversa") === "on";
  try {
    localStorage.setItem(DDT_SENDER_STORAGE_KEY, JSON.stringify(dati));
  } catch (errore) {
    console.warn("Non è stato possibile salvare i dati mittente sul dispositivo:", errore);
  }
}

function creaCampoDdt(contenitore, configurazione) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.htmlFor = configurazione.id;
  label.textContent = configurazione.label;
  if (configurazione.required) {
    const obbligatorio = document.createElement("span");
    obbligatorio.className = "required";
    obbligatorio.textContent = " *";
    label.append(obbligatorio);
  }

  const campo = configurazione.options
    ? document.createElement("select")
    : document.createElement("input");
  campo.id = configurazione.id;
  campo.name = configurazione.id;
  if (campo instanceof HTMLInputElement) campo.type = configurazione.type || "text";
  if (configurazione.options) {
    configurazione.options.forEach(([valore, etichetta]) => {
      const opzione = new Option(etichetta, valore);
      if (valore === configurazione.value) opzione.selected = true;
      campo.append(opzione);
    });
  } else {
    campo.value = configurazione.value ?? "";
  }
  if (configurazione.required) campo.required = true;
  if (configurazione.maxLength) campo.maxLength = configurazione.maxLength;
  if (configurazione.min !== undefined) campo.min = String(configurazione.min);
  if (configurazione.step !== undefined) campo.step = String(configurazione.step);
  wrapper.append(label, campo);
  contenitore.append(wrapper);
  return campo;
}

function mostraRigheMerceDdt(righe) {
  const contenitore = elementi.ddtGoodsLines;
  contenitore.replaceChildren();
  righe.forEach((articolo, indice) => {
    const riga = document.createElement("fieldset");
    riga.className = "ddt-goods-line";
    const titolo = document.createElement("legend");
    titolo.className = "visually-hidden";
    titolo.textContent = `Riga ${indice + 1}: ${articolo.nome}`;
    riga.append(titolo);

    const campiPrincipali = document.createElement("div");
    campiPrincipali.className = "ddt-goods-primary-row";
    const quantita = creaCampoDdt(campiPrincipali, {
      id: `ddt-item-quantity-${indice}`,
      label: "Quantità",
      type: "number",
      value: articolo.quantita,
      required: true,
      min: 0.01,
      step: 0.01
    });
    creaCampoDdt(campiPrincipali, {
      id: `ddt-item-description-${indice}`,
      label: "Descrizione dei beni (natura e qualità)",
      value: `${articolo.nome}${articolo.confezione ? ` (${articolo.confezione})` : ""}`,
      required: true,
      maxLength: 180
    });
    const riquadroImporto = document.createElement("div");
    const etichettaImporto = document.createElement("label");
    const outputImporto = document.createElement("output");
    etichettaImporto.htmlFor = `ddt-item-import-${indice}`;
    etichettaImporto.textContent = "Importo (€)";
    outputImporto.id = `ddt-item-import-${indice}`;
    outputImporto.htmlFor = quantita.id;
    outputImporto.className = "ddt-item-import";
    const importoIniziale = Number(articolo.prezzo) * Number(articolo.quantita);
    outputImporto.textContent = Number.isFinite(importoIniziale)
      ? formattaPrezzo(importoIniziale)
      : "—";
    riquadroImporto.append(etichettaImporto, outputImporto);
    campiPrincipali.append(riquadroImporto);
    quantita.addEventListener("input", () => {
      const importo = Number(articolo.prezzo) * Number(quantita.value);
      outputImporto.textContent = Number.isFinite(importo) && Number(quantita.value) > 0
        ? formattaPrezzo(importo)
        : "—";
    });
    riga.append(campiPrincipali);

    const dettagli = document.createElement("details");
    dettagli.className = "ddt-goods-details";
    const riepilogoDettagli = document.createElement("summary");
    riepilogoDettagli.textContent = "Dettagli facoltativi (codice, unità, lotto e tracciabilità)";
    dettagli.append(riepilogoDettagli);

    const codiceUnita = document.createElement("div");
    codiceUnita.className = "form-row";
    creaCampoDdt(codiceUnita, {
      id: `ddt-item-code-${indice}`,
      label: "Codice articolo",
      value: articolo.codice,
      maxLength: 60
    });
    creaCampoDdt(codiceUnita, {
      id: `ddt-item-unit-${indice}`,
      label: "Unità di misura",
      value: "PZ",
      required: true,
      options: [["PZ", "PZ"], ["KG", "KG"], ["M", "M"], ["L", "L"], ["NR", "NR"]]
    });

    const lottoTracciabilita = document.createElement("div");
    lottoTracciabilita.className = "form-row";
    creaCampoDdt(lottoTracciabilita, {
      id: `ddt-item-lot-${indice}`,
      label: "Lotto",
      maxLength: 60
    });
    creaCampoDdt(lottoTracciabilita, {
      id: `ddt-item-expiry-${indice}`,
      label: "Data scadenza",
      type: "date"
    });
    creaCampoDdt(lottoTracciabilita, {
      id: `ddt-item-serial-${indice}`,
      label: "Numero di serie",
      maxLength: 100
    });
    dettagli.append(codiceUnita, lottoTracciabilita);
    riga.append(dettagli);
    contenitore.append(riga);
  });
}

function valoreModulo(modulo, nome) {
  return String(modulo.get(nome) || "").trim();
}

function creaDatiDdt(modulo, righeOrdine) {
  const indirizzoSedeMittente = {
    via: valoreModulo(modulo, "mittente-via"),
    cap: valoreModulo(modulo, "mittente-cap"),
    comune: valoreModulo(modulo, "mittente-comune"),
    provincia: valoreModulo(modulo, "mittente-provincia"),
    nazione: valoreModulo(modulo, "mittente-nazione").toUpperCase()
  };
  const indirizzoSedeDestinatario = {
    via: valoreModulo(modulo, "indirizzo"),
    cap: valoreModulo(modulo, "cap"),
    comune: valoreModulo(modulo, "citta"),
    provincia: valoreModulo(modulo, "provincia"),
    nazione: valoreModulo(modulo, "destinatario-nazione").toUpperCase()
  };
  const destinatarioDiverso = modulo.get("destinatario-consegna-diversa") === "on";
  const indirizzoConsegna = destinatarioDiverso ? {
    via: valoreModulo(modulo, "consegna-via"),
    cap: valoreModulo(modulo, "consegna-cap"),
    comune: valoreModulo(modulo, "consegna-comune"),
    provincia: valoreModulo(modulo, "consegna-provincia"),
    nazione: valoreModulo(modulo, "consegna-nazione").toUpperCase()
  } : null;
  const indirizzoOrdine = indirizzoConsegna || indirizzoSedeDestinatario;
  const destinatarioOrdine = {
    nome: valoreModulo(modulo, "nome"),
    telefono: valoreModulo(modulo, "telefono"),
    email: valoreModulo(modulo, "email"),
    indirizzo: indirizzoOrdine.via,
    cap: indirizzoOrdine.cap,
    citta: indirizzoOrdine.comune,
    provincia: indirizzoOrdine.provincia,
    note: valoreModulo(modulo, "note")
  };
  const mittente = {
    ragione_sociale: valoreModulo(modulo, "mittente-ragione-sociale"),
    partita_iva: valoreModulo(modulo, "mittente-partita-iva"),
    indirizzo_sede_legale: indirizzoSedeMittente
  };
  const codiceFiscaleMittente = valoreModulo(modulo, "mittente-codice-fiscale");
  if (codiceFiscaleMittente) mittente.codice_fiscale = codiceFiscaleMittente;

  const contattiMittente = {};
  const telefonoMittente = valoreModulo(modulo, "mittente-telefono");
  const emailMittente = valoreModulo(modulo, "mittente-email");
  if (telefonoMittente) contattiMittente.telefono = telefonoMittente;
  if (emailMittente) contattiMittente.email = emailMittente;
  if (Object.keys(contattiMittente).length) mittente.contatti = contattiMittente;

  if (modulo.get("mittente-partenza-diversa") === "on") {
    mittente.indirizzo_partenza_merce = {
      via: valoreModulo(modulo, "partenza-via"),
      cap: valoreModulo(modulo, "partenza-cap"),
      comune: valoreModulo(modulo, "partenza-comune"),
      provincia: valoreModulo(modulo, "partenza-provincia")
    };
  }

  const destinatarioDdt = {
    ragione_sociale: destinatarioOrdine.nome,
    partita_iva_o_cf: valoreModulo(modulo, "destinatario-partita-iva-cf"),
    indirizzo_sede_legale: indirizzoSedeDestinatario
  };
  if (indirizzoConsegna) destinatarioDdt.indirizzo_consegna = indirizzoConsegna;

  const righeMerce = righeOrdine.map((articolo, indice) => {
    const valoreCampoRiga = (campo) => valoreModulo(modulo, `ddt-item-${campo}-${indice}`);
    const quantita = Number(valoreCampoRiga("quantity"));
    const descrizione = valoreCampoRiga("description");
    const unitaMisura = valoreCampoRiga("unit");
    if (!Number.isFinite(quantita) || quantita <= 0 || !descrizione || !unitaMisura) {
      throw new Error(`Controlla descrizione, quantità e unità di misura della riga ${indice + 1}.`);
    }
    const merce = {
      posizione: indice + 1,
      descrizione,
      quantita,
      unita_misura: unitaMisura,
      importo: Math.round(Number(articolo.prezzo) * quantita * 100) / 100
    };
    const codice = valoreCampoRiga("code");
    const lotto = valoreCampoRiga("lot");
    const scadenza = valoreCampoRiga("expiry");
    const serie = valoreCampoRiga("serial");
    if (codice) merce.codice_articolo = codice;
    if (lotto) merce.lotto = lotto;
    if (scadenza) merce.data_scadenza = scadenza;
    if (serie) merce.numero_serie = serie;
    return merce;
  });

  const logistica = {
    data_ora_inizio_trasporto: valoreModulo(modulo, "trasporto-inizio"),
    vettore_tipo: valoreModulo(modulo, "vettore-tipo"),
    numero_colli: Number(valoreModulo(modulo, "trasporto-colli")),
    aspetto_esteriore_beni: valoreModulo(modulo, "trasporto-aspetto")
  };
  if (!Number.isInteger(logistica.numero_colli) || logistica.numero_colli < 1) {
    throw new Error("Il numero colli deve essere un numero intero maggiore di zero.");
  }
  const porto = valoreModulo(modulo, "trasporto-porto");
  if (porto) logistica.porto = porto;
  if (logistica.vettore_tipo === "Vettore Terzo") {
    logistica.dati_vettore = {
      ragione_sociale: valoreModulo(modulo, "vettore-ragione-sociale"),
      partita_iva: valoreModulo(modulo, "vettore-partita-iva"),
      indirizzo: valoreModulo(modulo, "vettore-indirizzo")
    };
  }

  ["lordo", "netto"].forEach((tipo) => {
    const campo = valoreModulo(modulo, `trasporto-peso-${tipo}`);
    if (!campo) return;
    const peso = Number(campo);
    if (!Number.isFinite(peso) || peso < 0) {
      throw new Error("Inserisci pesi validi e non negativi.");
    }
    logistica[`peso_${tipo}_kg`] = peso;
  });
  if (logistica.peso_lordo_kg !== undefined
    && logistica.peso_netto_kg !== undefined
    && logistica.peso_lordo_kg < logistica.peso_netto_kg) {
    throw new Error("Il peso lordo non può essere inferiore al peso netto.");
  }

  const dataDdt = valoreModulo(modulo, "ddt-data");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataDdt)) {
    throw new Error("Inserisci una data DDT valida.");
  }
  return {
    cliente: destinatarioOrdine,
    ddt: {
      testata_documento: {
        numero_ddt: "",
        data_ddt: dataDdt,
        causale_trasporto: valoreModulo(modulo, "ddt-causale"),
        importo_totale: Math.round(righeMerce.reduce((totale, riga) => totale + riga.importo, 0) * 100) / 100
      },
      emittente_mittente: mittente,
      destinatario: destinatarioDdt,
      righe_merce: righeMerce,
      dati_trasporto_e_logistica: logistica,
      note_e_firme: {
        note_consegna: destinatarioOrdine.note,
        firma_mittente_richiesta: true,
        firma_vettore_richiesta: true,
        firma_destinatario_richiesta: true
      }
    }
  };
}

function aggiornaStatoSezioniCheckout() {
  elementi.checkoutForm.querySelectorAll(".checkout-accordion").forEach((sezione) => {
    const badge = sezione.querySelector("[data-required-status]");
    if (!badge) return;
    const obbligatori = [...sezione.querySelectorAll(":required")]
      .filter((campo) => !campo.matches(":disabled"));
    const mancanti = obbligatori.filter((campo) => !campo.validity.valid).length;
    badge.textContent = mancanti ? `${mancanti} da compilare` : "Completo";
    badge.dataset.missing = String(mancanti > 0);
  });
}

function validaCheckout() {
  const campoNonValido = [...elementi.checkoutForm.querySelectorAll("input, select, textarea")]
    .find((campo) => !campo.matches(":disabled") && !campo.validity.valid);
  if (!campoNonValido) return true;

  const sezione = campoNonValido.closest(".checkout-accordion");
  if (sezione) {
    sezione.open = true;
    elementi.checkoutForm.querySelectorAll(".checkout-accordion").forEach((altraSezione) => {
      if (altraSezione !== sezione) altraSezione.open = false;
    });
  }
  requestAnimationFrame(() => {
    campoNonValido.scrollIntoView({ block: "center", inline: "nearest" });
    campoNonValido.reportValidity();
  });
  return false;
}

function apriConfermaOrdine() {
  if (!navigator.onLine) {
    mostraMessaggio(elementi.cartMessage, "Connettiti a internet per inviare l'ordine.");
    return;
  }
  if (!carrelloCaricato) {
    mostraMessaggio(elementi.cartMessage, "Attendi il caricamento del carrello del tuo account.");
    return;
  }
  try {
    const righe = raccogliRigheOrdine();
    mostraMessaggio(elementi.checkoutMessage, "");
    elementi.checkoutForm.reset();
    elementi.checkoutForm.querySelectorAll(".checkout-accordion").forEach((sezione, indice) => {
      sezione.open = indice === 0;
    });
    ripristinaMittenteDdt();
    const oraLocale = new Date();
    const valoreDataOraLocale = new Date(
      oraLocale.getTime() - oraLocale.getTimezoneOffset() * 60_000
    ).toISOString();
    elementi.ddtDate.value = valoreDataOraLocale.slice(0, 10);
    elementi.transportStart.value = valoreDataOraLocale.slice(0, 16);
    aggiornaCampiCondizionaliDdt();
    mostraRigheMerceDdt(righe);
    aggiornaStatoSezioniCheckout();
    elementi.checkoutDialog.showModal();
  } catch (errore) {
    mostraMessaggio(elementi.cartMessage, errore.message);
  }
}

function messaggioErroreOrdine(errore, fase) {
  if (!navigator.onLine || errore?.code === "unavailable") {
    return "Connessione assente: l'ordine non è stato inviato. Riprova quando sei online.";
  }
  if (errore?.code === "permission-denied") {
    const uid = utenteCorrente?.uid || "non disponibile";
    return `Firestore ha negato ${fase} nel progetto ${firebaseConfig.projectId} per l'UID ${uid}. Verifica admins/${uid} e le regole della fase indicata.`;
  }
  return errore.message || "Non è stato possibile inviare l'ordine. Il carrello è rimasto salvato.";
}

async function inviaOrdine(evento) {
  evento.preventDefault();
  mostraMessaggio(elementi.checkoutMessage, "");
  if (!utenteCorrente || !navigator.onLine) {
    mostraMessaggio(elementi.checkoutMessage, "Connettiti a internet e accedi per inviare l'ordine.");
    return;
  }
  if (!validaCheckout()) return;

  let righe;
  try {
    righe = raccogliRigheOrdine();
  } catch (errore) {
    mostraMessaggio(elementi.checkoutMessage, errore.message);
    return;
  }

  const modulo = new FormData(elementi.checkoutForm);
  let datiDdt;
  try {
    datiDdt = creaDatiDdt(modulo, righe);
  } catch (errore) {
    mostraMessaggio(elementi.checkoutMessage, errore.message);
    return;
  }
  const { cliente, ddt } = datiDdt;
  const totale = righe.reduce((somma, riga) => somma + riga.subtotale, 0);

  elementi.confirmOrderButton.disabled = true;
  mostraMessaggio(elementi.checkoutMessage, "Invio dell'ordine in corso...", "avviso");
  let faseInvio = "sincronizzazione del carrello";
  try {
    await persistiCarrello();
    if (!navigator.onLine) throw new Error("Connessione assente: l'ordine non è stato inviato.");

    const riferimentoOrdine = doc(collection(db, "ordini"));
    const creatoIl = new Date();
    const numero = `ORD-${creatoIl.toISOString().slice(0, 10).replace(/-/g, "")}-${riferimentoOrdine.id.slice(-6).toUpperCase()}`;
    const annoDdt = Number(ddt.testata_documento.data_ddt.slice(0, 4));
    const riferimentoContatore = doc(db, "contatori", `ddt-${annoDdt}`);
    const riferimentoCarrello = doc(db, "carrelli", utenteCorrente.uid);
    faseInvio = "lettura del contatore DDT";
    await runTransaction(db, async (transazione) => {
      const contatore = await transazione.get(riferimentoContatore);
      const ultimoNumero = contatore.exists() ? contatore.data().ultimoNumero : 0;
      if (contatore.exists() && contatore.data().anno !== annoDdt) {
        throw new Error("Il contatore DDT non corrisponde all'anno del documento.");
      }
      if (!Number.isInteger(ultimoNumero) || ultimoNumero < 0 || ultimoNumero >= 99999) {
        throw new Error(`Progressivo DDT non valido o esaurito per l'anno ${annoDdt}.`);
      }
      const progressivo = ultimoNumero + 1;
      ddt.testata_documento.numero_ddt = `${annoDdt}/${String(progressivo).padStart(5, "0")}`;
      faseInvio = "scrittura atomica di contatore, ordine e carrello";
      transazione.set(riferimentoContatore, {
        anno: annoDdt,
        ultimoNumero: progressivo,
        aggiornatoIl: serverTimestamp()
      });
      transazione.set(riferimentoOrdine, {
        uid: utenteCorrente.uid,
        numero,
        destinatario: cliente,
        items: righe,
        totale,
        creatoIl: serverTimestamp(),
        stato: "ricevuto",
        ddt
      });
      transazione.set(riferimentoCarrello, {
        items: [],
        aggiornatoIl: serverTimestamp()
      }, { merge: true });
    });

    salvaMittenteDdt(modulo);
    carrello.clear();
    scritturaCarrello = Promise.resolve();
    aggiornaCarrello();
    ordineCorrente = { numero, creatoIl, destinatario: cliente, items: righe, totale, ddt };
    elementi.checkoutDialog.close();
    elementi.checkoutForm.reset();
    mostraRiepilogoOrdine(ordineCorrente);
    mostraMessaggio(
      elementi.orderSummaryMessage,
      "Ordine inviato. Usa “Stampa / salva PDF” per salvare la bolla in PDF o stamparla.",
      "successo"
    );
  } catch (errore) {
    console.error(`Errore durante ${faseInvio}:`, errore);
    mostraMessaggio(elementi.checkoutMessage, messaggioErroreOrdine(errore, faseInvio));
  } finally {
    elementi.confirmOrderButton.disabled = false;
  }
}

function mostraRiepilogoOrdine(ordine) {
  elementi.catalogPage.hidden = true;
  elementi.cartPage.hidden = true;
  elementi.ordersPage.hidden = true;
  elementi.orderSummaryPage.hidden = false;
  elementi.searchArea.hidden = true;
  elementi.cartButton.setAttribute("aria-label", "Apri il carrello");
  chiudiSuggerimenti();

  elementi.orderNumber.textContent = ordine.numero;
  elementi.orderDdtNumber.textContent = ordine.ddt?.testata_documento?.numero_ddt || "Non disponibile";
  elementi.orderDate.textContent = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(ordine.creatoIl);
  elementi.orderCustomer.replaceChildren();
  [
    ["Nome o ragione sociale", ordine.destinatario.nome],
    ["Telefono", ordine.destinatario.telefono],
    ["Email", ordine.destinatario.email],
    ["Indirizzo", ordine.destinatario.indirizzo],
    ["CAP", ordine.destinatario.cap],
    ["Città", ordine.destinatario.citta],
    ["Provincia", ordine.destinatario.provincia],
    ["Note per la consegna", ordine.destinatario.note]
  ].filter(([, valore]) => valore)
    .forEach(([etichetta, valore]) => elementi.orderCustomer.append(...creaRigaDettaglio(etichetta, valore)));

  const tabella = document.createElement("table");
  tabella.className = "order-table";
  const intestazione = document.createElement("thead");
  const rigaIntestazione = document.createElement("tr");
  ["Prodotto", "Codice", "Quantità", "Prezzo unitario", "Subtotale"].forEach((testo) => {
    const cella = document.createElement("th");
    cella.scope = "col";
    cella.textContent = testo;
    rigaIntestazione.append(cella);
  });
  intestazione.append(rigaIntestazione);
  const corpo = document.createElement("tbody");
  ordine.items.forEach((articolo) => {
    const riga = document.createElement("tr");
    [
      articolo.nome + (articolo.confezione ? ` (${articolo.confezione})` : ""),
      articolo.codice || "—",
      String(articolo.quantita),
      formattaPrezzo(articolo.prezzo),
      formattaPrezzo(articolo.subtotale)
    ].forEach((testo) => {
      const cella = document.createElement("td");
      cella.textContent = testo;
      riga.append(cella);
    });
    corpo.append(riga);
  });
  tabella.append(intestazione, corpo);
  elementi.orderItems.replaceChildren(tabella);
  elementi.orderTotal.textContent = formattaPrezzo(ordine.totale);
}

function escapeHtml(testo) {
  const caratteriHtml = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  };
  return String(testo ?? "").replace(/[&<>"']/g, (carattere) => caratteriHtml[carattere]);
}

function formattaDataDdt(valore, includeOra = false) {
  const data = new Date(includeOra ? valore : `${valore}T12:00:00`);
  if (Number.isNaN(data.getTime())) return String(valore || "—");
  const opzioni = includeOra
    ? { dateStyle: "long", timeStyle: "short" }
    : { dateStyle: "long" };
  return new Intl.DateTimeFormat("it-IT", opzioni).format(data);
}

function indirizzoHtmlDdt(indirizzo) {
  return [
    indirizzo.via,
    `${indirizzo.cap} ${indirizzo.comune} (${indirizzo.provincia})`,
    indirizzo.nazione
  ].filter(Boolean).map(escapeHtml).join("<br>");
}

function stampaBollaPdf() {
  if (!ordineCorrente) return;
  const ddt = ordineCorrente.ddt;
  if (!ddt) {
    mostraMessaggio(elementi.orderSummaryMessage, "Questo ordine storico non contiene i dati necessari per generare un DDT.");
    return;
  }

  const testata = ddt.testata_documento;
  const mittente = ddt.emittente_mittente;
  const destinatario = ddt.destinatario;
  const logistica = ddt.dati_trasporto_e_logistica;
  const note = ddt.note_e_firme;
  const indirizzoDestinazione = destinatario.indirizzo_consegna || destinatario.indirizzo_sede_legale;
  const campo = (etichetta, valore) => `<div class="campo"><span>${escapeHtml(etichetta)}</span><strong>${escapeHtml(valore === undefined || valore === null || valore === "" ? "—" : valore)}</strong></div>`;
  const datiVettore = logistica.dati_vettore;
  const righeProdotti = ddt.righe_merce.map((articolo, indice) => {
    const tracciabilita = [
      articolo.lotto ? `Lotto: ${articolo.lotto}` : "",
      articolo.data_scadenza ? `Scadenza: ${formattaDataDdt(articolo.data_scadenza)}` : "",
      articolo.numero_serie ? `N. serie: ${articolo.numero_serie}` : ""
    ].filter(Boolean).map(escapeHtml).join("<br>") || "—";
    const quantita = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(articolo.quantita);
    const importo = Number.isFinite(articolo.importo)
      ? articolo.importo
      : Number(ordineCorrente.items?.[indice]?.prezzo) * articolo.quantita;
    const codice = articolo.codice_articolo
      ? `<small class="codice-articolo">Codice: ${escapeHtml(articolo.codice_articolo)}</small>`
      : "";
    return `<tr>
      <td class="quantita">${escapeHtml(quantita)} ${escapeHtml(articolo.unita_misura || "PZ")}</td>
      <td>${escapeHtml(articolo.descrizione)}${codice}${tracciabilita !== "—" ? `<small class="codice-articolo">${tracciabilita}</small>` : ""}</td>
      <td class="importo">${Number.isFinite(importo) ? escapeHtml(formattaPrezzo(importo)) : "—"}</td>
    </tr>`;
  }).join("");
  const righeVuote = Array.from(
    { length: Math.max(0, 10 - ddt.righe_merce.length) },
    () => '<tr class="riga-vuota" aria-hidden="true"><td></td><td></td><td></td></tr>'
  ).join("");
  const partenza = mittente.indirizzo_partenza_merce;
  const totaleDocumento = Number.isFinite(testata.importo_totale)
    ? testata.importo_totale
    : ddt.righe_merce.reduce((totale, articolo, indice) => {
      const importo = Number.isFinite(articolo.importo)
        ? articolo.importo
        : Number(ordineCorrente.items?.[indice]?.prezzo) * articolo.quantita;
      return totale + (Number.isFinite(importo) ? importo : 0);
    }, 0);
  const dataOrdine = ordineCorrente.creatoIl instanceof Date
    ? ordineCorrente.creatoIl
    : ordineCorrente.creatoIl?.toDate?.() || null;
  const dataOrdineFormattata = dataOrdine && !Number.isNaN(dataOrdine.getTime())
    ? formattaDataDdt(dataOrdine.toISOString().slice(0, 10))
    : "—";
  const destinatarioAlternativo = Boolean(destinatario.indirizzo_consegna);
  const destinatarioNome = logistica.vettore_tipo === "Destinatario";
  const datiFiscaliMittente = [
    mittente.partita_iva ? `P. IVA ${mittente.partita_iva}` : "",
    mittente.codice_fiscale ? `C.F. ${mittente.codice_fiscale}` : ""
  ].filter(Boolean).map(escapeHtml).join(" · ");
  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DDT ${escapeHtml(testata.numero_ddt)}</title>
  <style>
    @page{size:A4 portrait;margin:6mm}
    *{box-sizing:border-box}
    html{background:#e9edf2;color:#152b43;font-family:Arial,Helvetica,sans-serif}
    body{margin:0;font-size:9pt;line-height:1.2}
    .toolbar{display:flex;justify-content:flex-end;width:min(196mm,calc(100% - 24px));margin:12px auto}
    .toolbar button{min-height:42px;padding:9px 16px;border:0;border-radius:6px;background:#07569a;color:#fff;font:700 10pt Arial,Helvetica,sans-serif;cursor:pointer}
    main{width:min(196mm,calc(100% - 24px));margin:0 auto 20px;padding:4mm;border:1.5px solid #07569a;background:#fff}
    h1,h2,h3,p{margin:0}
    .ddt-header{display:grid;grid-template-columns:1.05fr .95fr;min-height:29mm;border-bottom:1.5px solid #07569a}
    .mittente,.titolo-documento{min-width:0;padding:2mm}
    .mittente{border-right:1.5px solid #07569a}
    .etichetta{display:block;color:#07569a;font-size:7pt;font-weight:700;text-transform:uppercase}
    .nome-mittente{margin:3mm 0 1.5mm;color:#07569a;font-size:11pt;font-weight:800}
    .titolo-documento h1{color:#07569a;font-size:17pt;line-height:1.05;font-weight:900}
    .titolo-documento h1 small{font-size:12pt}
    .riferimento-legale{margin-top:1mm;color:#07569a;font-size:7pt;font-weight:700}
    .numero-data{display:grid;grid-template-columns:1fr 1fr;gap:2mm;margin-top:4mm;color:#07569a;font-size:9pt;font-weight:700}
    .numero-data strong{display:block;min-height:5mm;padding-top:1mm;border-bottom:1px solid #07569a}
    .riga-modulo{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #07569a}
    .cella{min-width:0;min-height:12mm;padding:1.5mm 2mm;border-right:1px solid #07569a}
    .cella:last-child{border-right:0}
    .cella.destinatario{min-height:17mm}
    .cella.destinatario strong{display:block;margin-top:1mm;font-size:10pt}
    .cella.destinatario p{margin-top:1mm}
    .indirizzo{overflow-wrap:anywhere}
    .riga-metadati{display:grid;grid-template-columns:1.35fr 1.15fr 1fr 1.35fr;border-bottom:1px solid #07569a}
    .riga-metadati .cella{min-height:12mm}
    .campo span{display:block;color:#07569a;font-size:7pt;font-weight:700;text-transform:uppercase}
    .campo strong{display:block;margin-top:1mm;overflow-wrap:anywhere;font-size:9pt}
    .checkbox-riga{display:flex;flex-wrap:wrap;gap:2mm 5mm;margin-top:1mm;font-size:8pt}
    .checkbox-riga span::before{display:inline-block;width:3mm;height:3mm;margin-right:1mm;border:1px solid #07569a;content:"";vertical-align:middle}
    .checkbox-riga .selezionato::before{background:#07569a;box-shadow:inset 0 0 0 1px white}
    .tabella-wrap{margin-top:0}
    table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:8.5pt}
    col.quantita{width:16%}col.descrizione{width:66%}col.importo{width:18%}
    th,td{height:6mm;padding:.8mm 1.5mm;border:1px solid #07569a;vertical-align:middle;overflow-wrap:anywhere}
    th{height:6mm;background:#07569a;color:#fff;font-size:8pt;text-align:center;text-transform:uppercase;letter-spacing:.025em}
    td.quantita,td.importo{text-align:center}
    td.importo{background:#e4e8ef}
    tbody tr:nth-child(even):not(.riga-vuota) td{background:#f2f5f9}
    tbody tr:nth-child(even):not(.riga-vuota) td.importo{background:#dfe5ef}
    .codice-articolo{display:block;margin-top:1mm;color:#435c77;font-size:7pt}
    .riga-vuota td{height:6mm}
    .totali{display:grid;grid-template-columns:.65fr .75fr .7fr 1.4fr 1.1fr}
    .totali .cella{min-height:12mm}
    .totale{background:#e4e8ef}
    .totale strong{color:#07569a;font-size:12pt}
    .firme{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #07569a}
    .firma{min-height:20mm;padding:2mm;border-right:1px solid #07569a}
    .firma:last-child{border-right:0}
    .firma .spazio-firma{height:9mm;margin-top:2mm;border-bottom:1px solid #07569a}
    .annotazioni{min-height:15mm;padding:2mm;border-bottom:1px solid #07569a}
    .annotazioni p{margin-top:1mm}
    .nota-fondo{padding:1.5mm;color:#07569a;font-size:7pt;font-weight:700}
    .screen-only{display:flex}
    @media(max-width:700px){
      html{background:#fff}
      main,.toolbar{width:calc(100% - 16px)}
      main{min-height:0;margin:0 auto 12px;padding:8px}
      .ddt-header{grid-template-columns:1fr}
      .mittente{border-right:0;border-bottom:1px solid #07569a}
      .titolo-documento h1{font-size:15pt}
      .cella{padding:6px}
      .riga-metadati{grid-template-columns:1fr 1fr}
      .riga-metadati .cella:first-child{grid-column:1/-1}
      th,td{height:38px;padding:5px;font-size:8pt}
      th{font-size:7pt}
      .totali{grid-template-columns:1fr 1fr}
      .totali .cella{min-height:48px}
      .firme{grid-template-columns:1fr}
      .firma{min-height:65px;border-right:0;border-bottom:1px solid #07569a}
    }
    @media print{
      html,body{background:#fff}
      .toolbar{display:none!important}
      main{width:100%;min-height:0;margin:0;padding:0;border:1.5px solid #07569a}
      .ddt-header{grid-template-columns:1.05fr .95fr;min-height:24mm}
      .mittente{border-right:1.5px solid #07569a;border-bottom:0}
      .riga-metadati{grid-template-columns:1.35fr 1.15fr 1fr 1.35fr}
      .riga-metadati .cella:first-child{grid-column:auto}
      .totali{grid-template-columns:.65fr .75fr .7fr 1.4fr 1.1fr}
      .firme{grid-template-columns:1fr 1fr 1fr}
      .firma{border-right:1px solid #07569a;border-bottom:0}
      .firma:last-child{border-right:0}
      .cella{min-height:10mm;padding:1mm 1.5mm}
      .cella.destinatario{min-height:14mm}
      .riga-metadati .cella{min-height:9mm}
      .totali .cella{min-height:9mm}
      .firma{min-height:16mm;padding:1.5mm}
      .firma .spazio-firma{height:6mm;margin-top:1mm}
      .annotazioni{min-height:10mm;padding:1.2mm}
      .cella,.firma,.annotazioni{break-inside:avoid;page-break-inside:avoid}
      thead{display:table-header-group}
      tr{break-inside:avoid;page-break-inside:avoid}
      th,td{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .riga-vuota{break-inside:avoid;page-break-inside:avoid}
    }
  </style>
</head>
<body>
  <div class="toolbar screen-only">
    <button type="button" onclick="window.print()">Stampa / Salva PDF</button>
  </div>
  <main aria-label="Documento di trasporto">
    <header class="ddt-header">
      <section class="mittente">
        <span class="etichetta">Mittente: ditta, dipendenza, domicilio o residenza, P. IVA, codice fiscale</span>
        <strong class="nome-mittente">${escapeHtml(mittente.ragione_sociale)}</strong>
        <p>${datiFiscaliMittente}</p>
        <p class="indirizzo">${indirizzoHtmlDdt(mittente.indirizzo_sede_legale)}</p>
        ${partenza ? `<p class="indirizzo"><strong>Partenza merce:</strong><br>${indirizzoHtmlDdt(partenza)}</p>` : ""}
      </section>
      <section class="titolo-documento">
        <h1>Documento di trasporto<br><small>(D.d.t.)</small></h1>
        <p class="riferimento-legale">Documento accompagnatorio della merce</p>
        <div class="numero-data">
          <div>N. <strong>${escapeHtml(testata.numero_ddt)}</strong></div>
          <div>Del <strong>${escapeHtml(formattaDataDdt(testata.data_ddt))}</strong></div>
        </div>
      </section>
    </header>

    <section class="riga-modulo" aria-label="Destinatario e luogo di destinazione">
      <div class="cella destinatario">
        <span class="etichetta">Destinatario: ditta, dipendenza, domicilio o residenza, P. IVA, codice fiscale</span>
        <strong>${escapeHtml(destinatario.ragione_sociale)}</strong>
        <p>${escapeHtml(destinatario.partita_iva_o_cf || "")}</p>
        <p class="indirizzo">${indirizzoHtmlDdt(destinatario.indirizzo_sede_legale)}</p>
      </div>
      <div class="cella destinatario">
        <span class="etichetta">Luogo di destinazione${destinatarioAlternativo ? "" : " (se diverso dall'indirizzo del destinatario)"}</span>
        <strong>${escapeHtml(destinatario.ragione_sociale)}</strong>
        <p class="indirizzo">${indirizzoHtmlDdt(indirizzoDestinazione)}</p>
      </div>
    </section>

    <section class="riga-metadati" aria-label="Causale, vettore e riferimento ordine">
      <div class="cella">${campo("Causale del trasporto", testata.causale_trasporto)}</div>
      <div class="cella">${campo("Vs. ordine / del", `${ordineCorrente.numero} · ${dataOrdineFormattata}`)}</div>
      <div class="cella">
        <span class="etichetta">A mezzo</span>
        <div class="checkbox-riga">
          <span class="${logistica.vettore_tipo === "Mittente" ? "selezionato" : ""}">Mittente</span>
          <span class="${destinatarioNome ? "selezionato" : ""}">Destinatario</span>
          ${logistica.vettore_tipo === "Vettore Terzo" ? `<span class="selezionato">${escapeHtml(datiVettore?.ragione_sociale || "Vettore")}</span>` : ""}
        </div>
      </div>
      <div class="cella">${campo("Vettore", datiVettore
        ? `${datiVettore.ragione_sociale} · P.IVA ${datiVettore.partita_iva} · ${datiVettore.indirizzo}`
        : logistica.vettore_tipo)}</div>
    </section>

    <div class="tabella-wrap">
      <table>
        <colgroup><col class="quantita"><col class="descrizione"><col class="importo"></colgroup>
        <thead><tr>
          <th scope="col">Quantità</th>
          <th scope="col">Descrizione dei beni (natura e qualità)</th>
          <th scope="col">Importo (€)</th>
        </tr></thead>
        <tbody>${righeProdotti}${righeVuote}</tbody>
      </table>
    </div>

    <section class="totali" aria-label="Dati colli, peso, porto e totale">
      <div class="cella">${campo("N. colli", logistica.numero_colli)}</div>
      <div class="cella">${campo("Peso lordo kg", logistica.peso_lordo_kg)}</div>
      <div class="cella">${campo("Porto", logistica.porto)}</div>
      <div class="cella">
        <span class="etichetta">Consegna: mittente / destinatario</span>
        <div class="checkbox-riga">
          <span class="${!destinatarioNome ? "selezionato" : ""}">Mittente</span>
          <span class="${destinatarioNome ? "selezionato" : ""}">Destinatario</span>
        </div>
      </div>
      <div class="cella totale">${campo("Totale € (IVA inclusa)", formattaPrezzo(totaleDocumento))}</div>
    </section>
    <section class="firme" aria-label="Spazi per le firme">
      <div class="firma">
        <span class="etichetta">Data e ora del ritiro</span>
        <strong>${escapeHtml(formattaDataDdt(logistica.data_ora_inizio_trasporto, true))}</strong>
        <p class="codice-articolo">Aspetto: ${escapeHtml(logistica.aspetto_esteriore_beni || "—")}</p>
        <div class="spazio-firma"></div>
      </div>
      <div class="firma">
        <span class="etichetta">Peso e firma del conducente</span>
        <strong>${escapeHtml(logistica.peso_lordo_kg !== undefined ? `${logistica.peso_lordo_kg} kg` : " ")}</strong>
        <div class="spazio-firma"></div>
      </div>
      <div class="firma">
        <span class="etichetta">Firma del destinatario</span>
        <div class="spazio-firma"></div>
      </div>
    </section>
    <section class="annotazioni">
      <span class="etichetta">Annotazioni e variazioni</span>
      <p>${escapeHtml(note.note_consegna || "")}</p>
    </section>
    <p class="nota-fondo">Documento di trasporto generato dal gestionale · Conservare una copia del documento.</p>
  </main>
</body>
</html>`;
  const finestraStampa = window.open("", "_blank");
  if (!finestraStampa) {
    mostraMessaggio(
      elementi.orderSummaryMessage,
      "Il browser ha bloccato la finestra di stampa. Consenti i popup per questo sito e riprova."
    );
    return;
  }
  finestraStampa.document.open();
  finestraStampa.document.write(html);
  finestraStampa.document.close();
  window.setTimeout(() => {
    if (finestraStampa.closed) return;
    if (typeof finestraStampa.print !== "function") {
      mostraMessaggio(elementi.orderSummaryMessage, "Questo browser non supporta la stampa del documento.");
      finestraStampa.close();
      return;
    }
    finestraStampa.focus();
    finestraStampa.print();
  }, 300);
}

function evidenziaTesto(testo, termini) {
  const originale = String(testo ?? "");
  const mappa = [];
  let normalizzato = "";
  let posizione = 0;

  for (const carattere of originale) {
    const inizio = posizione;
    posizione += carattere.length;
    const parte = normalizza(carattere);
    for (const lettera of parte) {
      normalizzato += lettera;
      mappa.push({ inizio, fine: posizione });
    }
  }

  const intervalli = [];
  termini.forEach((termine) => {
    let inizio = normalizzato.indexOf(termine);
    while (inizio !== -1) {
      const fine = inizio + termine.length - 1;
      if (mappa[inizio] && mappa[fine]) {
        intervalli.push([mappa[inizio].inizio, mappa[fine].fine]);
      }
      inizio = normalizzato.indexOf(termine, inizio + termine.length);
    }
  });

  intervalli.sort((a, b) => a[0] - b[0]);
  const uniti = [];
  intervalli.forEach(([inizio, fine]) => {
    const ultimo = uniti[uniti.length - 1];
    if (ultimo && inizio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fine);
    else uniti.push([inizio, fine]);
  });

  const frammento = document.createDocumentFragment();
  let cursore = 0;
  uniti.forEach(([inizio, fine]) => {
    frammento.append(document.createTextNode(originale.slice(cursore, inizio)));
    const forte = document.createElement("strong");
    forte.textContent = originale.slice(inizio, fine);
    frammento.append(forte);
    cursore = fine;
  });
  frammento.append(document.createTextNode(originale.slice(cursore)));
  return frammento;
}

function trovaCorrispondenze(query) {
  const termini = normalizza(query).trim().split(/\s+/).filter(Boolean);
  if (!termini.length) return [];
  const testoQuery = termini.join(" ");
  return prodotti.map((prodotto) => {
    const nome = normalizza(prodotto.nome);
    const codice = normalizza(prodotto.codice);
    const corrisponde = termini.length > 1
      ? termini.every((termine) => nome.includes(termine))
      : nome.includes(termini[0]) || codice.includes(termini[0]);
    if (!corrisponde) return null;
    const ordine = codiceIniziaCon(codice, testoQuery) ? 0
      : nome.startsWith(testoQuery) ? 1
        : 2;
    return { prodotto, ordine };
  }).filter(Boolean).sort((a, b) =>
    a.ordine - b.ordine
    || normalizza(a.prodotto.nome).localeCompare(normalizza(b.prodotto.nome), "it")
    || a.prodotto.id.localeCompare(b.prodotto.id, "it")
  ).map((voce) => voce.prodotto);
}

function codiceIniziaCon(codice, testoQuery) {
  return codice.startsWith(testoQuery);
}

function creaSuggerimento(prodotto, termini, indice) {
  const opzione = document.createElement("li");
  opzione.className = "suggestion";
  opzione.id = `suggestion-${indice}`;
  opzione.setAttribute("role", "option");
  opzione.setAttribute("aria-selected", String(indice === indiceSuggerimento));
  if (prodotto.fotoUrl) {
    opzione.append(creaImmagine(prodotto.fotoUrl, "", `Miniatura di ${prodotto.nome}`));
  } else {
    const miniatura = creaPlaceholder();
    miniatura.className = "product-photo-placeholder";
    miniatura.style.width = "48px";
    miniatura.style.height = "48px";
    miniatura.style.borderRadius = "9px";
    miniatura.style.fontSize = "1.3rem";
    opzione.append(miniatura);
  }

  const copia = document.createElement("span");
  copia.className = "suggestion-copy";
  const nome = document.createElement("span");
  nome.className = "suggestion-name";
  nome.append(evidenziaTesto(prodotto.nome, termini));
  const meta = document.createElement("span");
  meta.className = "suggestion-meta";
  meta.append(evidenziaTesto(prodotto.codice, termini));
  meta.append(document.createTextNode(` · ${prodotto.categoria || prodotto.confezione || "Senza categoria"}`));
  copia.append(nome, meta);
  const prezzo = document.createElement("span");
  prezzo.className = "suggestion-price";
  prezzo.textContent = formattaPrezzo(prodotto.prezzo);
  opzione.append(copia, prezzo);
  opzione.addEventListener("click", () => apriDettaglio(prodotto));
  return opzione;
}

function mostraSuggerimenti() {
  const query = elementi.searchInput.value;
  const termini = normalizza(query).trim().split(/\s+/).filter(Boolean);
  elementi.suggestions.replaceChildren();
  indiceSuggerimento = -1;
  if (!termini.length) {
    chiudiSuggerimenti();
    return;
  }

  suggerimentiVisibili = trovaCorrispondenze(query).slice(0, 8);
  elementi.searchInput.setAttribute("aria-expanded", "true");
  elementi.suggestions.hidden = false;
  if (!suggerimentiVisibili.length) {
    const vuoto = document.createElement("li");
    vuoto.className = "suggestion-empty";
    vuoto.textContent = "Nessun prodotto trovato";
    elementi.suggestions.append(vuoto);
    return;
  }
  suggerimentiVisibili.forEach((prodotto, indice) => {
    elementi.suggestions.append(creaSuggerimento(prodotto, termini, indice));
  });
}

function chiudiSuggerimenti() {
  elementi.suggestions.hidden = true;
  elementi.searchInput.setAttribute("aria-expanded", "false");
  elementi.searchInput.removeAttribute("aria-activedescendant");
  indiceSuggerimento = -1;
}

function selezionaSuggerimento(indice) {
  const opzioni = [...elementi.suggestions.querySelectorAll(".suggestion[role='option']")];
  if (!opzioni.length) return;
  indiceSuggerimento = (indice + opzioni.length) % opzioni.length;
  opzioni.forEach((opzione, posizione) => {
    const selezionata = posizione === indiceSuggerimento;
    opzione.setAttribute("aria-selected", String(selezionata));
    if (selezionata) {
      elementi.searchInput.setAttribute("aria-activedescendant", `suggestion-${posizione}`);
      opzione.scrollIntoView({ block: "nearest" });
    }
  });
}

function apriDettaglio(prodotto) {
  chiudiSuggerimenti();
  elementi.detailContent.replaceChildren();
  const fotoUrls = [
    prodotto.fotoUrl,
    ...(Array.isArray(prodotto.fotoUrls) ? prodotto.fotoUrls : [])
  ].filter((url, indice, urls) => typeof url === "string" && url && urls.indexOf(url) === indice);
  if (fotoUrls.length) {
    const galleria = document.createElement("div");
    galleria.className = "detail-photo-gallery";
    fotoUrls.forEach((url, indice) => {
      const etichetta = indice === 0 ? "principale" : `aggiuntiva ${indice}`;
      galleria.append(creaImmagine(url, "detail-photo", `Foto ${etichetta} di ${prodotto.nome}`));
    });
    elementi.detailContent.append(galleria);
  } else {
    const placeholder = creaPlaceholder();
    placeholder.style.height = "170px";
    placeholder.style.borderRadius = "12px";
    elementi.detailContent.append(placeholder);
  }
  const titolo = document.createElement("h2");
  titolo.id = "detail-title";
  titolo.className = "detail-title";
  titolo.textContent = prodotto.nome || "Prodotto";
  const codice = document.createElement("div");
  codice.className = "detail-code";
  codice.textContent = `Codice: ${prodotto.codice || "—"}`;
  const fatti = document.createElement("dl");
  fatti.className = "detail-facts";
  [
    ["Prezzo", formattaPrezzo(prodotto.prezzo)],
    ["Prezzo alternativo", typeof prodotto.prezzoAlt === "number" ? formattaPrezzo(prodotto.prezzoAlt) : "—"],
    ["Confezione", prodotto.confezione],
    ["Categoria", prodotto.categoria]
  ].forEach(([etichetta, valore]) => fatti.append(...creaRigaDettaglio(etichetta, valore)));
  elementi.detailContent.append(titolo, codice, fatti);
  if (prodotto.caratteristiche) {
    const caratteristiche = document.createElement("p");
    caratteristiche.className = "detail-description";
    caratteristiche.textContent = prodotto.caratteristiche;
    elementi.detailContent.append(caratteristiche);
  }
  if (utenteAmministratore) {
    const azioni = document.createElement("div");
    azioni.className = "detail-actions";
    const aggiungiAlCarrelloButton = document.createElement("button");
    aggiungiAlCarrelloButton.className = "button button-primary";
    aggiungiAlCarrelloButton.type = "button";
    aggiungiAlCarrelloButton.textContent = "Aggiungi al carrello";
    const messaggio = document.createElement("p");
    messaggio.className = "message";
    messaggio.setAttribute("role", "status");
    messaggio.setAttribute("aria-live", "polite");
    aggiungiAlCarrelloButton.addEventListener("click", () => aggiungiAlCarrello(prodotto, messaggio));
    azioni.append(aggiungiAlCarrelloButton, messaggio);
    elementi.detailContent.append(azioni);
  }
  elementi.detailDialog.showModal();
}

function apriFormProdotto(prodotto = null) {
  elementi.productForm.reset();
  mostraMessaggio(elementi.productFormMessage, "");
  elementi.productId.value = prodotto?.id || "";
  elementi.productName.value = prodotto?.nome || "";
  elementi.productCode.value = prodotto?.codice || "";
  elementi.productPrice.value = typeof prodotto?.prezzo === "number" ? String(prodotto.prezzo) : "";
  elementi.productAltPrice.value = typeof prodotto?.prezzoAlt === "number" ? String(prodotto.prezzoAlt) : "";
  elementi.productPackage.value = prodotto?.confezione || "";
  elementi.productCategory.value = prodotto?.categoria || "";
  elementi.productFeatures.value = prodotto?.caratteristiche || "";
  elementi.photoStatus.textContent = "";
  elementi.productFormTitle.textContent = prodotto ? "Modifica prodotto" : "Nuovo prodotto";
  elementi.saveProductButton.disabled = false;
  if (urlAnteprima) URL.revokeObjectURL(urlAnteprima);
  urlAnteprima = null;
  if (prodotto?.fotoUrl) mostraAnteprima(prodotto.fotoUrl, false);
  else nascondiAnteprima();
  elementi.productDialog.showModal();
  elementi.productName.focus();
}

function mostraAnteprima(url, temporanea) {
  if (urlAnteprima) URL.revokeObjectURL(urlAnteprima);
  urlAnteprima = temporanea ? url : null;
  elementi.photoPreview.src = url;
  elementi.photoPreview.hidden = false;
  elementi.photoPlaceholder.hidden = true;
  elementi.photoPreview.onerror = () => nascondiAnteprima();
}

function nascondiAnteprima() {
  elementi.photoPreview.removeAttribute("src");
  elementi.photoPreview.hidden = true;
  elementi.photoPlaceholder.hidden = false;
}

async function ridimensionaFoto(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Seleziona un file immagine valido.");
  }
  const immagine = await createImageBitmap(file);
  const scala = Math.min(1, 1000 / Math.max(immagine.width, immagine.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(immagine.width * scala));
  canvas.height = Math.max(1, Math.round(immagine.height * scala));
  const contesto = canvas.getContext("2d");
  if (!contesto) {
    immagine.close();
    throw new Error("Il browser non riesce a elaborare la foto.");
  }
  contesto.drawImage(immagine, 0, 0, canvas.width, canvas.height);
  immagine.close();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((risultato) => {
      if (risultato) resolve(risultato);
      else reject(new Error("Non è stato possibile preparare la foto."));
    }, "image/jpeg", 0.8);
  });
  if (blob.size >= 2 * 1024 * 1024) {
    throw new Error("La foto ridimensionata supera 2 MB. Scegli un’immagine più leggera.");
  }
  return blob;
}

async function caricaFotoCloudinary(file, idProdotto, nomeCloudinary = idProdotto) {
  const fotoRidimensionata = await ridimensionaFoto(file);
  const dati = new FormData();
  dati.append("file", fotoRidimensionata, `${nomeCloudinary}.jpg`);
  dati.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), CLOUDINARY_UPLOAD_TIMEOUT_MS);
  let risposta;
  try {
    risposta = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: dati, signal: controller.signal }
    );
  } catch (errore) {
    if (errore.name === "AbortError") {
      throw new Error("Caricamento foto scaduto dopo 45 secondi. Verifica connessione e preset Cloudinary.");
    }
    throw new Error("Connessione a Cloudinary non riuscita. Verifica la rete e il preset unsigned.");
  } finally {
    window.clearTimeout(timer);
  }

  let risultato;
  try {
    risultato = await risposta.json();
  } catch {
    throw new Error("Cloudinary ha restituito una risposta non valida.");
  }
  if (!risposta.ok) {
    throw new Error(risultato.error?.message || "Cloudinary non ha accettato la foto.");
  }
  if (!risultato.secure_url) {
    throw new Error("Cloudinary ha risposto senza un URL sicuro per la foto.");
  }
  return { fotoUrl: risultato.secure_url, fotoPath: "" };
}

async function caricaFoto(file, idProdotto) {
  elementi.photoStatus.textContent = "Preparazione foto...";
  const risultato = await caricaFotoCloudinary(file, idProdotto);
  elementi.photoStatus.textContent = "Foto caricata su Cloudinary.";
  return risultato;
}

function abbinaFotoAProdotti(files) {
  const prodottiPerCodice = new Map();
  for (const prodotto of prodotti) {
    const codice = typeof prodotto.codice === "string" ? prodotto.codice : "";
    if (!codice) continue;
    const corrispondenze = prodottiPerCodice.get(codice) || [];
    corrispondenze.push(prodotto);
    prodottiPerCodice.set(codice, corrispondenze);
  }
  const gruppiPerCodice = new Map();
  const scartate = [];
  const conflitti = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      scartate.push(`${file.name}: non è un’immagine.`);
      continue;
    }
    const conSuffisso = file.name.match(/^(.+)_([1-9]\d*)\.png$/i);
    const senzaSuffisso = file.name.match(/^(.+)\.png$/i);
    if (!conSuffisso && !senzaSuffisso) {
      scartate.push(`${file.name}: usa il codice esatto, per esempio CAR-0001.png o CAR-0007_2.png.`);
      continue;
    }
    const codice = conSuffisso ? conSuffisso[1] : senzaSuffisso[1];
    const numeroFoto = conSuffisso ? Number(conSuffisso[2]) : null;
    const corrispondenze = prodottiPerCodice.get(codice) || [];
    if (corrispondenze.length === 0) {
      scartate.push(`${file.name}: nessun prodotto con codice identico ${codice}.`);
      continue;
    }
    if (corrispondenze.length > 1) {
      scartate.push(`${file.name}: il codice ${codice} identifica più prodotti; abbinamento dubbio.`);
      continue;
    }
    const gruppo = gruppiPerCodice.get(codice) || [];
    gruppo.push({ file, prodotto: corrispondenze[0], numeroFoto });
    gruppiPerCodice.set(codice, gruppo);
  }

  const abbinate = [];
  for (const [codice, gruppo] of gruppiPerCodice) {
    const senzaSuffisso = gruppo.filter(({ numeroFoto }) => numeroFoto === null);
    const numeri = gruppo
      .filter(({ numeroFoto }) => numeroFoto !== null)
      .map(({ numeroFoto }) => numeroFoto);
    if ((senzaSuffisso.length && gruppo.length > 1)
      || new Set(numeri).size !== numeri.length
      || (senzaSuffisso.length === 0 && !numeri.includes(1))) {
      scartate.push(`${codice}: nomi foto ambigui o manca la foto principale _1; nessun file caricato.`);
      continue;
    }
    const ordinate = [...gruppo].sort((a, b) => (a.numeroFoto ?? 0) - (b.numeroFoto ?? 0));
    if (haFotoProdotto(gruppo[0].prodotto)) {
      conflitti.push(codice);
      continue;
    }
    abbinate.push({ prodotto: gruppo[0].prodotto, files: ordinate });
  }
  return { abbinate, scartate, conflitti };
}

function haFotoProdotto(prodotto) {
  return Boolean(
    prodotto?.fotoUrl
    || prodotto?.fotoPath
    || (Array.isArray(prodotto?.fotoUrls) && prodotto.fotoUrls.some((url) => typeof url === "string" && url))
  );
}

async function importaFotoInBlocco(files) {
  if (!verificaConnessioneOperazione()) {
    elementi.photoBatchFiles.value = "";
    return;
  }
  if (!files.length) return;

  const { abbinate, scartate, conflitti } = abbinaFotoAProdotti(files);
  if (!abbinate.length) {
    const dettagli = [...scartate, ...conflitti.map((codice) => `${codice}: foto già presente; non sovrascritta.`)]
      .slice(0, 4)
      .join(" ");
    mostraMessaggio(elementi.appMessage, `Nessuna nuova foto da caricare. ${dettagli}`, "avviso");
    elementi.photoBatchProgress.textContent = `Ignorati ${scartate.length}; già presenti ${conflitti.length}`;
    elementi.photoBatchFiles.value = "";
    return;
  }

  impostaBarraOccupata(true);
  elementi.photoBatchButton.disabled = true;
  elementi.photoBatchProgress.textContent = `Prodotti elaborati 0/${abbinate.length}`;
  mostraMessaggio(elementi.appMessage, "");
  let prossima = 0;
  let completate = 0;
  let prodottiAggiornati = 0;
  let fotoCaricate = 0;
  const conflittiRemoti = [];
  const saltateRemotamente = [];
  const errori = [];

  async function lavora() {
    while (prossima < abbinate.length) {
      const corrente = abbinate[prossima];
      prossima += 1;
      try {
        const { files: fotoProdotto, prodotto } = corrente;
        const riferimento = doc(db, "prodotti", prodotto.id);
        const remoto = await getDocFromServer(riferimento);
        if (!remoto.exists()) {
          saltateRemotamente.push(`${prodotto.codice}: record non presente su Firestore.`);
          continue;
        }
        if (haFotoProdotto(remoto.data())) {
          conflittiRemoti.push(prodotto.codice);
          continue;
        }

        const urls = [];
        for (let indice = 0; indice < fotoProdotto.length; indice += 1) {
          const voce = fotoProdotto[indice];
          const suffissoCloudinary = indice === 0 ? "" : `-${indice + 1}`;
          const foto = await caricaFotoCloudinary(
            voce.file,
            prodotto.id,
            `${prodotto.id}${suffissoCloudinary}`
          );
          urls.push(foto.fotoUrl);
        }

        const aggiornato = await runTransaction(db, async (transazione) => {
          const documento = await transazione.get(riferimento);
          if (!documento.exists() || haFotoProdotto(documento.data())) return false;
          transazione.set(riferimento, {
            fotoUrl: urls[0],
            fotoUrls: urls.slice(1),
            fotoPath: "",
            aggiornatoIl: serverTimestamp()
          }, { merge: true });
          return true;
        });
        if (aggiornato) {
          prodottiAggiornati += 1;
          fotoCaricate += urls.length;
        } else {
          conflittiRemoti.push(prodotto.codice);
        }
      } catch (errore) {
        const file = corrente.files.map(({ file }) => file.name).join(", ");
        console.error(`Errore durante l’importazione delle foto ${file}:`, errore);
        errori.push(`${file}: ${errore.message || "caricamento non riuscito"}`);
      } finally {
        completate += 1;
        elementi.photoBatchProgress.textContent = `Prodotti elaborati ${completate}/${abbinate.length}`;
      }
    }
  }

  try {
    const numeroLavoratori = Math.min(3, abbinate.length);
    await Promise.all(Array.from({ length: numeroLavoratori }, () => lavora()));
    const riepilogo = `Foto collegate: ${fotoCaricate} su ${prodottiAggiornati} prodotti. Già presenti e non sovrascritte: ${conflitti.length + conflittiRemoti.length}. Ignorate: ${scartate.length + saltateRemotamente.length}. Errori: ${errori.length}.`;
    const dettagli = [
      ...scartate,
      ...conflitti.map((codice) => `${codice}: foto già presente; non sovrascritta.`),
      ...conflittiRemoti.map((codice) => `${codice}: foto già presente su Firestore; non sovrascritta.`),
      ...saltateRemotamente,
      ...errori
    ].slice(0, 6).join(" ");
    mostraMessaggio(elementi.appMessage, [riepilogo, dettagli].filter(Boolean).join(" "), errori.length || scartate.length || conflitti.length || conflittiRemoti.length || saltateRemotamente.length ? "avviso" : "successo");
    elementi.photoBatchProgress.textContent = `Completato: ${fotoCaricate} foto; già presenti ${conflitti.length + conflittiRemoti.length}; ignorate ${scartate.length + saltateRemotamente.length}; errori ${errori.length}`;
  } finally {
    impostaBarraOccupata(false);
    elementi.photoBatchFiles.value = "";
  }
}

function valoreNumerico(input, etichetta) {
  if (!input.value.trim()) return null;
  const valore = Number(input.value);
  if (!Number.isFinite(valore) || valore < 0) {
    throw new Error(`${etichetta}: inserisci un importo valido.`);
  }
  return valore;
}

async function salvaProdotto(evento) {
  evento.preventDefault();
  mostraMessaggio(elementi.productFormMessage, "");
  elementi.saveProductButton.disabled = true;
  let fotoCaricata = null;
  let caricamentoFotoAvviato = false;
  let prodottoSalvato = false;
  let idProdotto = elementi.productId.value;
  try {
    const nuovo = !idProdotto;
    const riferimento = nuovo ? doc(prodottiRef) : doc(db, "prodotti", idProdotto);
    idProdotto = riferimento.id;
    const dati = {
      nome: elementi.productName.value.trim(),
      codice: elementi.productCode.value.trim(),
      prezzo: valoreNumerico(elementi.productPrice, "Prezzo"),
      prezzoAlt: valoreNumerico(elementi.productAltPrice, "Prezzo alternativo"),
      confezione: elementi.productPackage.value.trim(),
      categoria: elementi.productCategory.value.trim(),
      caratteristiche: elementi.productFeatures.value.trim(),
      aggiornatoIl: serverTimestamp()
    };
    if (nuovo) dati.creatoIl = serverTimestamp();

    await setDoc(riferimento, dati, { merge: true });
    prodottoSalvato = true;

    const file = elementi.productPhoto.files?.[0];
    if (file) {
      caricamentoFotoAvviato = true;
      fotoCaricata = await caricaFoto(file, idProdotto);
      await setDoc(riferimento, {
        fotoUrl: fotoCaricata.fotoUrl,
        fotoPath: fotoCaricata.fotoPath,
        aggiornatoIl: serverTimestamp()
      }, { merge: true });
    }

    elementi.productDialog.close();
    elementi.productForm.reset();
    mostraMessaggio(elementi.appMessage, "Prodotto salvato correttamente.", "successo");
  } catch (errore) {
    console.error("Errore durante il salvataggio del prodotto:", errore);
    if (caricamentoFotoAvviato) {
      elementi.photoStatus.textContent = prodottoSalvato
        ? "Il prodotto è salvato; il caricamento della foto non è riuscito."
        : "Caricamento o salvataggio della foto non riuscito.";
    }
    const dettaglio = errore?.code === "permission-denied"
      ? "Permesso negato: verifica l’accesso e le regole Firestore."
        : errore?.code === "unavailable" || !navigator.onLine
          ? "Connessione assente o instabile. Riprova quando sei online."
          : errore.message || "Non è stato possibile salvare il prodotto.";
    mostraMessaggio(elementi.productFormMessage, prodottoSalvato
      ? `Prodotto salvato, ma non è stato possibile completare la foto: ${dettaglio}`
      : dettaglio);
  } finally {
    elementi.saveProductButton.disabled = false;
  }
}

async function eliminaProdotto(prodotto) {
  if (!verificaConnessioneOperazione()) return;
  const nome = prodotto.nome || "Prodotto senza nome";
  const codice = prodotto.codice || "—";
  if (!window.confirm(`Vuoi eliminare definitivamente «${nome}» (codice ${codice})? L'operazione non si può annullare.`)) return;
  try {
    await deleteDoc(doc(db, "prodotti", prodotto.id));
  } catch (errore) {
    console.error("Errore durante l’eliminazione del prodotto:", errore);
    mostraMessaggio(elementi.appMessage, messaggioErroreOperazione(errore, "eliminare il prodotto"));
    return;
  }
  await eliminaFotoDaStorage(prodotto.fotoPath);
  mostraMessaggio(elementi.appMessage, "Prodotto eliminato.", "successo");
  if (prodotto.fotoUrl && !prodotto.fotoPath) {
    elementi.connectionMessage.textContent = "La foto Cloudinary resta nella libreria Cloudinary: rimuovila manualmente se non ti serve più.";
  }
}

function verificaConnessioneOperazione() {
  if (navigator.onLine) return true;
  mostraMessaggio(elementi.appMessage, "Connettiti a internet per eseguire questa operazione");
  return false;
}

function messaggioErroreOperazione(errore, operazione) {
  if (!navigator.onLine || errore?.code === "unavailable") {
    return "Connettiti a internet per eseguire questa operazione";
  }
  if (errore?.code === "permission-denied") {
    return `Permesso negato: verifica l’accesso e le regole Firestore prima di ${operazione}.`;
  }
  return `Non è stato possibile ${operazione}. Riprova e controlla la connessione.`;
}

function impostaBarraOccupata(occupata) {
  elementi.toolbar.querySelectorAll("button, select, input").forEach((controllo) => {
    controllo.disabled = occupata;
  });
  elementi.photoBatchButton.disabled = occupata;
}

async function eliminaFotoDaStorage(percorso) {
  if (!percorso) return;
  try {
    await deleteObject(ref(getStorage(appFirebase), percorso));
  } catch (errore) {
    console.warn(`Foto Storage non eliminata (${percorso}); procedo con l'operazione:`, errore);
  }
}

async function eliminaTuttiProdotti() {
  if (!verificaConnessioneOperazione()) return;

  let istantanea;
  try {
    istantanea = await getDocs(prodottiRef);
  } catch (errore) {
    console.error("Errore durante la lettura dei prodotti da eliminare:", errore);
    mostraMessaggio(elementi.appMessage, messaggioErroreOperazione(errore, "leggere il catalogo"));
    return;
  }
  if (istantanea.empty) {
    window.alert("Non ci sono prodotti da eliminare.");
    return;
  }

  if (!window.confirm(`Stai per eliminare TUTTI i ${istantanea.size} prodotti del catalogo. L'operazione non si può annullare. Vuoi continuare?`)) {
    mostraMessaggio(elementi.appMessage, "Operazione annullata", "avviso");
    return;
  }
  const parolaConferma = window.prompt("Per confermare, scrivi esattamente ELIMINA.");
  if (parolaConferma !== "ELIMINA") {
    mostraMessaggio(elementi.appMessage, "Operazione annullata", "avviso");
    return;
  }

  impostaBarraOccupata(true);
  elementi.importProgress.textContent = "Lettura aggiornata del catalogo...";
  mostraMessaggio(elementi.appMessage, "");
  try {
    if (!verificaConnessioneOperazione()) return;
    const prodottiAggiornati = await getDocs(prodottiRef);
    if (prodottiAggiornati.empty) {
      elementi.importProgress.textContent = "";
      window.alert("Non ci sono prodotti da eliminare.");
      return;
    }

    const documenti = prodottiAggiornati.docs;
    let eliminati = 0;
    for (let inizio = 0; inizio < documenti.length; inizio += 400) {
      const gruppo = documenti.slice(inizio, inizio + 400);
      const batch = writeBatch(db);
      gruppo.forEach((documento) => batch.delete(documento.ref));
      await batch.commit();
      eliminati += gruppo.length;
      elementi.importProgress.textContent = `Eliminati ${eliminati}/${documenti.length}`;
    }

    let fotoCloudinaryRimaste = false;
    for (const documento of documenti) {
      const prodotto = documento.data();
      if (prodotto.fotoPath) await eliminaFotoDaStorage(prodotto.fotoPath);
      if (prodotto.fotoUrl && !prodotto.fotoPath) fotoCloudinaryRimaste = true;
    }

    mostraMessaggio(elementi.appMessage, "Tutti i prodotti sono stati eliminati.", "successo");
    elementi.importProgress.textContent = `Eliminati ${eliminati}/${documenti.length}`;
    elementi.connectionMessage.textContent = fotoCloudinaryRimaste
      ? "Le foto Cloudinary restano nella libreria Cloudinary: rimuovile manualmente se non ti servono più."
      : "";
  } catch (errore) {
    console.error("Errore durante l’eliminazione del catalogo:", errore);
    mostraMessaggio(elementi.appMessage, messaggioErroreOperazione(errore, "eliminare il catalogo"));
  } finally {
    impostaBarraOccupata(false);
  }
}

function mappaProdottoJson(voce, indice) {
  if (!voce || typeof voce !== "object" || Array.isArray(voce)) {
    throw new Error(`L’elemento ${indice + 1} del file non è un prodotto valido.`);
  }
  const id = voce.id;
  if ((typeof id !== "number" && typeof id !== "string") || !String(id).trim()) {
    throw new Error(`Manca un ID valido nel prodotto alla riga ${indice + 1}.`);
  }
  if (typeof voce.codice !== "string" || typeof voce.nome !== "string") {
    throw new Error(`Nome o codice non validi nel prodotto alla riga ${indice + 1}.`);
  }
  return {
    id: String(id),
    dati: {
      codice: voce.codice,
      nome: voce.nome,
      confezione: voce.confezione || "",
      prezzo: typeof voce.prezzo === "number" ? voce.prezzo : null,
      prezzoAlt: typeof voce.prezzo_alt === "number" ? voce.prezzo_alt : null,
      categoria: voce.categoria || "",
      caratteristiche: voce.note || "",
      creatoIl: serverTimestamp(),
      aggiornatoIl: serverTimestamp()
    }
  };
}

async function importaDaJson(file) {
  if (!verificaConnessioneOperazione()) {
    elementi.jsonFile.value = "";
    return;
  }
  impostaBarraOccupata(true);
  elementi.importProgress.textContent = "Lettura del file...";
  mostraMessaggio(elementi.appMessage, "");
  try {
    const contenuto = JSON.parse(await file.text());
    if (!Array.isArray(contenuto)) {
      throw new Error("Il file JSON deve contenere un array di prodotti.");
    }
    const mappati = contenuto.map(mappaProdottoJson);
    const idVisti = new Set();
    for (const prodotto of mappati) {
      if (idVisti.has(prodotto.id)) throw new Error(`ID duplicato nel file: ${prodotto.id}.`);
      idVisti.add(prodotto.id);
    }
    if (!mappati.length) throw new Error("Il file JSON non contiene prodotti.");

    let importati = 0;
    for (let inizio = 0; inizio < mappati.length; inizio += 400) {
      const gruppo = mappati.slice(inizio, inizio + 400);
      const batch = writeBatch(db);
      gruppo.forEach((prodotto) => {
        batch.set(doc(db, "prodotti", prodotto.id), prodotto.dati, { merge: true });
      });
      await batch.commit();
      importati += gruppo.length;
      elementi.importProgress.textContent = `Importati ${importati}/${mappati.length}`;
    }
    mostraMessaggio(elementi.appMessage, `Importazione completata: ${importati} prodotti aggiornati o aggiunti.`, "successo");
    elementi.importProgress.textContent = `Completato: ${importati}/${mappati.length}`;
  } catch (errore) {
    console.error("Errore durante l’importazione JSON:", errore);
    elementi.importProgress.textContent = "";
    const dettaglio = !navigator.onLine || errore.code === "unavailable"
      ? "Connettiti a internet per eseguire questa operazione"
      : errore instanceof SyntaxError
      ? "Il file non contiene JSON valido."
      : errore.code === "permission-denied"
        ? "Permesso negato: verifica l’accesso e le regole Firestore."
      : errore.code === "unavailable" || !navigator.onLine
        ? "Connessione assente o instabile. Riprova quando sei online."
        : errore.message || "Importazione non riuscita.";
    mostraMessaggio(elementi.appMessage, `Importazione non riuscita: ${dettaglio}`);
  } finally {
    impostaBarraOccupata(false);
    elementi.jsonFile.value = "";
  }
}

function iniziaAscolto() {
  if (interrompiAscolto) interrompiAscolto();
  interrompiAscolto = onSnapshot(prodottiRef, { includeMetadataChanges: true }, (istantanea) => {
    prodotti = istantanea.docs.map((documento) => ({ id: documento.id, ...documento.data() }))
      .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "it"));
    catalogoCaricato = true;
    aggiornaCategorie();
    filtraProdotti();
    aggiornaCarrello();
    if (!navigator.onLine) {
      elementi.connectionMessage.textContent = "Sei offline: vengono mostrati i dati salvati sul dispositivo.";
    } else if (istantanea.metadata.fromCache) {
      elementi.connectionMessage.textContent = "Dati dalla cache locale: verranno aggiornati appena possibile.";
    } else {
      elementi.connectionMessage.textContent = "";
    }
  }, (errore) => {
    console.error("Errore nell’ascolto Firestore:", errore);
    mostraMessaggio(elementi.appMessage, errore.code === "permission-denied"
      ? "Accesso ai prodotti negato: verifica login e regole Firestore."
      : "Non riesco a caricare i prodotti. Controlla la connessione e riprova.");
  });
}

function iniziaAscoltoCarrello(uid) {
  if (interrompiCarrelloAscolto) interrompiCarrelloAscolto();
  carrello.clear();
  carrelloCaricato = false;
  scritturaCarrello = Promise.resolve();
  aggiornaCarrello();
  interrompiCarrelloAscolto = onSnapshot(doc(db, "carrelli", uid), (istantanea) => {
    if (utenteCorrente?.uid !== uid) return;
    const articoli = istantanea.exists() ? istantanea.data().items : [];
    const carrelloCaricatoDaFirestore = new Map();
    if (Array.isArray(articoli)) {
      articoli.forEach((articolo) => {
        if (typeof articolo?.productId === "string"
          && Number.isInteger(articolo.quantita)
          && articolo.quantita > 0) {
          carrelloCaricatoDaFirestore.set(articolo.productId, { quantita: articolo.quantita });
        }
      });
    }
    carrello = carrelloCaricatoDaFirestore;
    carrelloCaricato = true;
    elementi.cartMessage.textContent = "";
    aggiornaCarrello();
  }, (errore) => {
    console.error("Errore durante il caricamento del carrello:", errore);
    carrelloCaricato = false;
    mostraMessaggio(elementi.cartMessage, errore.code === "permission-denied"
      ? "Accesso al carrello negato: pubblica le nuove regole Firestore."
      : "Non è stato possibile caricare il carrello. Controlla la connessione e riprova.");
  });
}

function aggiornaStatoConnessione() {
  if (!navigator.onLine) {
    elementi.connectionMessage.textContent = "Sei offline: i dati già memorizzati restano consultabili.";
  } else if (prodotti.length) {
    elementi.connectionMessage.textContent = "";
  }
}

elementi.loginForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const email = new FormData(elementi.loginForm).get("email");
  const password = new FormData(elementi.loginForm).get("password");
  const pulsante = elementi.loginForm.querySelector("button[type='submit']");
  pulsante.disabled = true;
  mostraMessaggio(elementi.loginMessage, "");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (errore) {
    console.error("Errore di accesso:", errore);
    const testo = errore.code === "auth/invalid-credential" || errore.code === "auth/invalid-login-credentials" || errore.code === "auth/wrong-password" || errore.code === "auth/user-not-found"
      ? "Email o password non corretti."
      : errore.code === "auth/unauthorized-domain"
        ? "Dominio non autorizzato: aggiungilo nelle impostazioni di Firebase Authentication."
        : errore.code === "auth/network-request-failed"
          ? "Connessione assente o instabile. Riprova."
          : "Accesso non riuscito. Verifica i dati e riprova.";
    mostraMessaggio(elementi.loginMessage, testo);
  } finally {
    pulsante.disabled = false;
  }
});

elementi.logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    mostraMessaggio(elementi.loginMessage, "Hai effettuato la disconnessione.", "successo");
  } catch (errore) {
    console.error("Errore durante la disconnessione:", errore);
    mostraMessaggio(elementi.appMessage, "Non è stato possibile uscire. Riprova.");
  }
});

onAuthStateChanged(auth, (utente) => {
  elementi.authLoadingView.hidden = true;
  elementi.loginView.hidden = Boolean(utente);
  elementi.appView.hidden = !utente;
  if (utente) {
    utenteCorrente = utente;
    mostraMessaggio(elementi.appMessage, "");
    mostraCarrello(false);
    iniziaAscolto();
    caricaPermessiCatalogo(utente.uid);
  }
  else {
    if (interrompiAscolto) interrompiAscolto();
    interrompiAscolto = null;
    if (interrompiCarrelloAscolto) interrompiCarrelloAscolto();
    interrompiCarrelloAscolto = null;
    if (interrompiOrdiniAscolto) interrompiOrdiniAscolto();
    interrompiOrdiniAscolto = null;
    utenteCorrente = null;
    carrelloCaricato = false;
    catalogoCaricato = false;
    scritturaCarrello = Promise.resolve();
    ordineCorrente = null;
    ordini = [];
    righeOrdineInModifica = [];
    prodotti = [];
    carrello.clear();
    impostaPermessiCatalogo(false);
    elementi.productList.replaceChildren();
    elementi.productCount.textContent = "Accedi per vedere il catalogo";
    mostraCarrello(false);
    mostraDashboardOrdini(false);
    aggiornaCarrello();
    chiudiSuggerimenti();
  }
}, (errore) => {
  console.error("Errore durante il ripristino della sessione:", errore);
  elementi.authLoadingView.hidden = true;
  elementi.loginView.hidden = false;
  elementi.appView.hidden = true;
  mostraMessaggio(elementi.loginMessage, "Non è stato possibile verificare la sessione. Ricarica la pagina.");
});

elementi.brandHome.addEventListener("click", (evento) => {
  evento.preventDefault();
  elementi.mobileMenu.open = false;
  mostraCarrello(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
elementi.cartButton.addEventListener("click", () => mostraCarrello(elementi.cartPage.hidden));
elementi.mobileCartButton.addEventListener("click", () => {
  elementi.mobileMenu.open = false;
  mostraCarrello(true);
});
elementi.orderDashboardButton.addEventListener("click", () => mostraDashboardOrdini(true));
elementi.mobileOrderDashboardButton.addEventListener("click", () => {
  elementi.mobileMenu.open = false;
  mostraDashboardOrdini(true);
});
elementi.mobileLogoutButton.addEventListener("click", () => {
  elementi.mobileMenu.open = false;
  elementi.logoutButton.click();
});
elementi.backToCatalogButton.addEventListener("click", () => mostraCarrello(false));
elementi.ordersBackToCatalogButton.addEventListener("click", () => mostraDashboardOrdini(false));
elementi.ordersList.addEventListener("click", (evento) => {
  const pulsante = evento.target.closest("button[data-order-action]");
  if (!pulsante || !utenteAmministratore) return;
  const ordine = ordini.find((voce) => voce.id === pulsante.dataset.orderId);
  if (!ordine) return;
  if (pulsante.dataset.orderAction === "modifica") apriModificaOrdine(ordine);
  if (pulsante.dataset.orderAction === "annulla") annullaOrdine(ordine, pulsante);
});
elementi.orderStatusFilter.addEventListener("change", mostraOrdini);
elementi.orderEditItems.addEventListener("input", (evento) => {
  if (evento.target.matches("[data-order-item-quantity]")) aggiornaTotaleEditorOrdine();
});
elementi.orderEditItems.addEventListener("click", (evento) => {
  const pulsante = evento.target.closest("button[data-remove-order-item]");
  if (!pulsante) return;
  righeOrdineInModifica.splice(Number(pulsante.dataset.removeOrderItem), 1);
  renderRigheEditorOrdine();
});
elementi.orderAddProductButton.addEventListener("click", aggiungiProdottoAllOrdine);
elementi.orderEditForm.addEventListener("submit", salvaModificheOrdine);
elementi.orderEditDialog.querySelectorAll("[data-close-order-edit]").forEach((pulsante) => {
  pulsante.addEventListener("click", () => elementi.orderEditDialog.close());
});
elementi.orderEditDialog.addEventListener("click", (evento) => {
  if (evento.target === elementi.orderEditDialog) elementi.orderEditDialog.close();
});
elementi.cartItems.addEventListener("click", gestisciAzioneCarrello);
elementi.clearCartButton.addEventListener("click", svuotaCarrello);
elementi.placeOrderButton.addEventListener("click", apriConfermaOrdine);
elementi.checkoutForm.addEventListener("submit", inviaOrdine);
elementi.senderDepartureToggle.addEventListener("change", aggiornaCampiCondizionaliDdt);
elementi.customerDeliveryToggle.addEventListener("change", aggiornaCampiCondizionaliDdt);
elementi.carrierType.addEventListener("change", aggiornaCampiCondizionaliDdt);
elementi.checkoutForm.addEventListener("input", aggiornaStatoSezioniCheckout);
elementi.checkoutForm.addEventListener("change", aggiornaStatoSezioniCheckout);
elementi.checkoutForm.querySelectorAll(".checkout-accordion").forEach((sezione) => {
  sezione.addEventListener("toggle", () => {
    if (!sezione.open) return;
    elementi.checkoutForm.querySelectorAll(".checkout-accordion").forEach((altraSezione) => {
      if (altraSezione !== sezione) altraSezione.open = false;
    });
  });
});
aggiornaCampiCondizionaliDdt();
aggiornaStatoSezioniCheckout();
elementi.checkoutForm.querySelectorAll("[data-close-checkout]").forEach((pulsante) => {
  pulsante.addEventListener("click", () => elementi.checkoutDialog.close());
});
elementi.checkoutDialog.addEventListener("click", (evento) => {
  if (evento.target === elementi.checkoutDialog) elementi.checkoutDialog.close();
});
elementi.orderBackToCatalogButton.addEventListener("click", () => mostraCarrello(false));
elementi.printShippingNoteButton.addEventListener("click", stampaBollaPdf);
elementi.categoryFilter.addEventListener("change", filtraProdotti);
elementi.addProductButton.addEventListener("click", () => apriFormProdotto());
elementi.productForm.addEventListener("submit", salvaProdotto);
elementi.productForm.querySelectorAll("[data-close-product]").forEach((pulsante) => {
  pulsante.addEventListener("click", () => elementi.productDialog.close());
});
elementi.productDialog.addEventListener("close", () => {
  if (urlAnteprima) URL.revokeObjectURL(urlAnteprima);
  urlAnteprima = null;
});
elementi.detailDialog.querySelector("[data-close-detail]").addEventListener("click", () => elementi.detailDialog.close());
elementi.productDialog.addEventListener("click", (evento) => {
  if (evento.target === elementi.productDialog) elementi.productDialog.close();
});
elementi.detailDialog.addEventListener("click", (evento) => {
  if (evento.target === elementi.detailDialog) elementi.detailDialog.close();
});

elementi.productPhoto.addEventListener("change", () => {
  const file = elementi.productPhoto.files?.[0];
  if (!file) return;
  if (urlAnteprima) URL.revokeObjectURL(urlAnteprima);
  const anteprima = URL.createObjectURL(file);
  mostraAnteprima(anteprima, true);
  elementi.photoStatus.textContent = "";
});

elementi.importButton.addEventListener("click", () => {
  if (!verificaConnessioneOperazione()) return;
  elementi.jsonFile.click();
});
elementi.jsonFile.addEventListener("change", () => {
  const file = elementi.jsonFile.files?.[0];
  if (file) importaDaJson(file);
});
elementi.deleteAllButton.addEventListener("click", eliminaTuttiProdotti);
elementi.photoBatchButton.addEventListener("click", () => {
  if (!verificaConnessioneOperazione()) return;
  elementi.photoBatchFiles.click();
});
elementi.photoBatchFiles.addEventListener("change", () => {
  const files = [...(elementi.photoBatchFiles.files || [])];
  if (files.length) importaFotoInBlocco(files);
});

elementi.searchInput.addEventListener("input", () => {
  window.clearTimeout(timerRicerca);
  timerRicerca = window.setTimeout(mostraSuggerimenti, 100);
});
elementi.searchInput.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    chiudiSuggerimenti();
  } else if (evento.key === "ArrowDown" && !elementi.suggestions.hidden) {
    evento.preventDefault();
    selezionaSuggerimento(indiceSuggerimento + 1);
  } else if (evento.key === "ArrowUp" && !elementi.suggestions.hidden) {
    evento.preventDefault();
    selezionaSuggerimento(indiceSuggerimento <= 0 ? suggerimentiVisibili.length - 1 : indiceSuggerimento - 1);
  } else if (evento.key === "Enter" && !elementi.suggestions.hidden && indiceSuggerimento >= 0) {
    evento.preventDefault();
    const selezionato = suggerimentiVisibili[indiceSuggerimento];
    if (selezionato) apriDettaglio(selezionato);
  }
});
document.addEventListener("click", (evento) => {
  if (!elementi.searchArea.contains(evento.target)) chiudiSuggerimenti();
  if (!elementi.mobileMenu.contains(evento.target)) elementi.mobileMenu.open = false;
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && elementi.mobileMenu.open) {
    elementi.mobileMenu.open = false;
  }
});
elementi.searchInput.addEventListener("focus", () => {
  if (elementi.searchInput.value.trim()) mostraSuggerimenti();
});
window.addEventListener("online", aggiornaStatoConnessione);
window.addEventListener("offline", aggiornaStatoConnessione);
