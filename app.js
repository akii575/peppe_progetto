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
  getDocs,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
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
  loginView: document.getElementById("login-view"),
  loginForm: document.getElementById("login-form"),
  loginMessage: document.getElementById("login-message"),
  appView: document.getElementById("app-view"),
  topbarInner: document.querySelector(".topbar-inner"),
  logoutButton: document.getElementById("logout-button"),
  cartButton: document.getElementById("cart-button"),
  cartCount: document.getElementById("cart-count"),
  catalogPage: document.getElementById("catalog-page"),
  cartPage: document.getElementById("cart-page"),
  orderSummaryPage: document.getElementById("order-summary-page"),
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
  orderNumber: document.getElementById("order-number"),
  orderDate: document.getElementById("order-date"),
  orderCustomer: document.getElementById("order-customer"),
  orderItems: document.getElementById("order-items"),
  orderTotal: document.getElementById("order-total"),
  downloadShippingNoteButton: document.getElementById("download-shipping-note"),
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
const formatterPrezzo = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR"
});
let prodotti = [];
let carrello = new Map();
let interrompiAscolto = null;
let interrompiCarrelloAscolto = null;
let utenteCorrente = null;
let carrelloCaricato = false;
let catalogoCaricato = false;
let scritturaCarrello = Promise.resolve();
let ordineCorrente = null;
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
  elementi.addProductButton.hidden = !amministratore;
  elementi.deleteAllButton.hidden = !amministratore;
  elementi.toolbarImport.hidden = !amministratore;
  if (catalogoCaricato) filtraProdotti();
}

async function caricaPermessiCatalogo(uid) {
  impostaPermessiCatalogo(false);
  try {
    const amministratore = await getDoc(doc(db, "admins", uid));
    if (utenteCorrente?.uid !== uid) return;
    impostaPermessiCatalogo(amministratore.exists() && amministratore.data().abilitato === true);
    if (!utenteAmministratore) {
      mostraMessaggio(elementi.appMessage, "Modalità sola lettura: questo account non è abilitato a modificare il catalogo.", "avviso");
    }
  } catch (errore) {
    console.error("Errore durante la verifica dei permessi amministratore:", errore);
    if (utenteCorrente?.uid !== uid) return;
    impostaPermessiCatalogo(false);
    mostraMessaggio(elementi.appMessage, "Non è stato possibile verificare i permessi. Catalogo in sola lettura.");
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
  const aggiungiAlCarrelloButton = document.createElement("button");
  aggiungiAlCarrelloButton.className = "button button-primary button-cart";
  aggiungiAlCarrelloButton.type = "button";
  aggiungiAlCarrelloButton.textContent = "Aggiungi al carrello";
  aggiungiAlCarrelloButton.addEventListener("click", () => aggiungiAlCarrello(prodotto));
  azioni.append(aggiungiAlCarrelloButton);
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
  elementi.catalogPage.hidden = aperto;
  elementi.cartPage.hidden = !aperto;
  elementi.orderSummaryPage.hidden = true;
  elementi.searchArea.hidden = aperto;
  elementi.topbarInner.classList.toggle("cart-open", aperto);
  elementi.cartButton.setAttribute("aria-label", aperto ? "Torna al catalogo" : `Apri carrello, ${elementi.cartCount.textContent} articoli`);
  chiudiSuggerimenti();
  if (aperto) aggiornaCarrello();
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
  if (!utenteCorrente || !carrelloCaricato) {
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
    raccogliRigheOrdine();
    mostraMessaggio(elementi.checkoutMessage, "");
    elementi.checkoutForm.reset();
    elementi.checkoutDialog.showModal();
  } catch (errore) {
    mostraMessaggio(elementi.cartMessage, errore.message);
  }
}

function messaggioErroreOrdine(errore) {
  if (!navigator.onLine || errore?.code === "unavailable") {
    return "Connessione assente: l'ordine non è stato inviato. Riprova quando sei online.";
  }
  if (errore?.code === "permission-denied") {
    return "Permesso negato: pubblica le nuove regole Firestore e verifica il tuo accesso.";
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

  let righe;
  try {
    righe = raccogliRigheOrdine();
  } catch (errore) {
    mostraMessaggio(elementi.checkoutMessage, errore.message);
    return;
  }

  const modulo = new FormData(elementi.checkoutForm);
  const cliente = {
    nome: String(modulo.get("nome") || "").trim(),
    telefono: String(modulo.get("telefono") || "").trim(),
    email: String(modulo.get("email") || "").trim(),
    indirizzo: String(modulo.get("indirizzo") || "").trim(),
    cap: String(modulo.get("cap") || "").trim(),
    citta: String(modulo.get("citta") || "").trim(),
    provincia: String(modulo.get("provincia") || "").trim(),
    note: String(modulo.get("note") || "").trim()
  };
  const totale = righe.reduce((somma, riga) => somma + riga.subtotale, 0);
  if (!window.confirm(`Confermi l'invio dell'ordine per ${cliente.nome}? Totale: ${formattaPrezzo(totale)}. L'operazione non si può annullare.`)) {
    mostraMessaggio(elementi.checkoutMessage, "Ordine non inviato.", "avviso");
    return;
  }

  elementi.confirmOrderButton.disabled = true;
  mostraMessaggio(elementi.checkoutMessage, "Invio dell'ordine in corso...", "avviso");
  try {
    await persistiCarrello();
    if (!navigator.onLine) throw new Error("Connessione assente: l'ordine non è stato inviato.");

    const riferimentoOrdine = doc(collection(db, "ordini"));
    const creatoIl = new Date();
    const numero = `ORD-${creatoIl.toISOString().slice(0, 10).replace(/-/g, "")}-${riferimentoOrdine.id.slice(-6).toUpperCase()}`;
    const batch = writeBatch(db);
    batch.set(riferimentoOrdine, {
      uid: utenteCorrente.uid,
      numero,
      destinatario: cliente,
      items: righe,
      totale,
      creatoIl: serverTimestamp()
    });
    batch.set(doc(db, "carrelli", utenteCorrente.uid), {
      items: [],
      aggiornatoIl: serverTimestamp()
    }, { merge: true });
    await batch.commit();

    carrello.clear();
    scritturaCarrello = Promise.resolve();
    aggiornaCarrello();
    ordineCorrente = { numero, creatoIl, destinatario: cliente, items: righe, totale };
    elementi.checkoutDialog.close();
    elementi.checkoutForm.reset();
    mostraRiepilogoOrdine(ordineCorrente);
  } catch (errore) {
    console.error("Errore durante l'invio dell'ordine:", errore);
    mostraMessaggio(elementi.checkoutMessage, messaggioErroreOrdine(errore));
  } finally {
    elementi.confirmOrderButton.disabled = false;
  }
}

function mostraRiepilogoOrdine(ordine) {
  elementi.catalogPage.hidden = true;
  elementi.cartPage.hidden = true;
  elementi.orderSummaryPage.hidden = false;
  elementi.searchArea.hidden = true;
  elementi.topbarInner.classList.add("cart-open");
  elementi.cartButton.setAttribute("aria-label", "Apri il carrello");
  chiudiSuggerimenti();

  elementi.orderNumber.textContent = ordine.numero;
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

function scaricaBollaSpedizione() {
  if (!ordineCorrente) return;
  const ordine = ordineCorrente;
  const destinatario = ordine.destinatario;
  const righeCliente = [
    ["Nome o ragione sociale", destinatario.nome],
    ["Telefono", destinatario.telefono],
    ["Email", destinatario.email],
    ["Indirizzo", destinatario.indirizzo],
    ["CAP", destinatario.cap],
    ["Città", destinatario.citta],
    ["Provincia", destinatario.provincia],
    ["Note per la consegna", destinatario.note]
  ].filter(([, valore]) => valore)
    .map(([etichetta, valore]) => `<p><strong>${escapeHtml(etichetta)}:</strong> ${escapeHtml(valore)}</p>`)
    .join("");
  const righeProdotti = ordine.items.map((articolo) =>
    `<tr><td>${escapeHtml(articolo.nome)}</td><td>${escapeHtml(articolo.codice || "—")}</td><td>${escapeHtml(articolo.confezione || "—")}</td><td>${articolo.quantita}</td><td>${escapeHtml(formattaPrezzo(articolo.prezzo))}</td><td>${escapeHtml(formattaPrezzo(articolo.subtotale))}</td></tr>`
  ).join("");
  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bolla di spedizione ${escapeHtml(ordine.numero)}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#26352f;margin:32px;line-height:1.45}
    main{max-width:900px;margin:auto}h1{color:#2F5D50}table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{padding:9px;border:1px solid #d9ded8;text-align:left}th{background:#f2f6f3}
    .totale{text-align:right;font-size:1.2rem;font-weight:bold;margin-top:20px}
    @media print{body{margin:0}main{max-width:none}}
    @media(max-width:600px){body{margin:14px}table{font-size:.78rem}th,td{padding:5px}}
  </style>
</head>
<body>
  <main>
    <h1>Bolla di spedizione</h1>
    <p><strong>Ordine:</strong> ${escapeHtml(ordine.numero)}</p>
    <p><strong>Data:</strong> ${escapeHtml(new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeStyle: "short" }).format(ordine.creatoIl))}</p>
    <h2>Destinatario</h2>
    ${righeCliente}
    <h2>Prodotti</h2>
    <table><thead><tr><th>Prodotto</th><th>Codice</th><th>Confezione</th><th>Qtà</th><th>Prezzo unitario</th><th>Subtotale</th></tr></thead><tbody>${righeProdotti}</tbody></table>
    <p class="totale">Totale: ${escapeHtml(formattaPrezzo(ordine.totale))}</p>
    <p>Documento generato dal gestionale Dolcevolta.</p>
  </main>
</body>
</html>`;
  const file = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bolla-${ordine.numero.replace(/[^A-Za-z0-9-]/g, "")}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  if (prodotto.fotoUrl) {
    elementi.detailContent.append(creaImmagine(prodotto.fotoUrl, "detail-photo", `Foto di ${prodotto.nome}`));
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

async function caricaFotoCloudinary(file, idProdotto) {
  const fotoRidimensionata = await ridimensionaFoto(file);
  const dati = new FormData();
  dati.append("file", fotoRidimensionata, `${idProdotto}.jpg`);
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
  const prodottiPerId = new Map(prodotti.map((prodotto) => [prodotto.id, prodotto]));
  const gruppiPerId = new Map();
  const scartate = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      scartate.push(`${file.name}: non è un’immagine.`);
      continue;
    }
    const corrispondenza = file.name.match(/^(\d+)\.[^.]+$/);
    if (!corrispondenza) {
      scartate.push(`${file.name}: il nome deve essere un ID, per esempio 235.jpg.`);
      continue;
    }
    const id = corrispondenza[1].replace(/^0+(?=\d)/, "");
    const prodotto = prodottiPerId.get(id);
    if (!prodotto) {
      scartate.push(`${file.name}: nessun prodotto con ID ${id}.`);
      continue;
    }
    const gruppo = gruppiPerId.get(id) || [];
    gruppo.push({ file, prodotto });
    gruppiPerId.set(id, gruppo);
  }

  const abbinate = [];
  for (const [id, gruppo] of gruppiPerId) {
    if (gruppo.length > 1) {
      scartate.push(`Più immagini selezionate per l’ID ${id}; nessuna è stata caricata.`);
      continue;
    }
    abbinate.push(gruppo[0]);
  }
  return { abbinate, scartate };
}

async function importaFotoInBlocco(files) {
  if (!verificaConnessioneOperazione()) {
    elementi.photoBatchFiles.value = "";
    return;
  }
  if (!files.length) return;

  const { abbinate, scartate } = abbinaFotoAProdotti(files);
  if (!abbinate.length) {
    const dettagli = scartate.slice(0, 4).join(" ");
    mostraMessaggio(elementi.appMessage, `Nessuna foto abbinabile. ${dettagli}`);
    elementi.photoBatchProgress.textContent = `Ignorate ${scartate.length} foto`;
    elementi.photoBatchFiles.value = "";
    return;
  }

  const giaConFoto = abbinate.filter(({ prodotto }) => prodotto.fotoUrl).length;
  if (giaConFoto && !window.confirm(`${giaConFoto} prodotti hanno già una foto. I nuovi collegamenti la sostituiranno, ma le vecchie immagini resteranno su Cloudinary. Vuoi continuare?`)) {
    mostraMessaggio(elementi.appMessage, "Operazione annullata", "avviso");
    elementi.photoBatchFiles.value = "";
    return;
  }

  impostaBarraOccupata(true);
  elementi.photoBatchButton.disabled = true;
  elementi.photoBatchProgress.textContent = `Foto elaborate 0/${abbinate.length}`;
  mostraMessaggio(elementi.appMessage, "");
  let prossima = 0;
  let completate = 0;
  let caricate = 0;
  const errori = [];

  async function lavora() {
    while (prossima < abbinate.length) {
      const corrente = abbinate[prossima];
      prossima += 1;
      try {
        const { file, prodotto } = corrente;
        const foto = await caricaFotoCloudinary(file, prodotto.id);
        await setDoc(doc(db, "prodotti", prodotto.id), {
          fotoUrl: foto.fotoUrl,
          fotoPath: foto.fotoPath,
          aggiornatoIl: serverTimestamp()
        }, { merge: true });
        caricate += 1;
      } catch (errore) {
        console.error(`Errore durante l’importazione della foto ${corrente.file.name}:`, errore);
        errori.push(`${corrente.file.name}: ${errore.message || "caricamento non riuscito"}`);
      } finally {
        completate += 1;
        elementi.photoBatchProgress.textContent = `Foto elaborate ${completate}/${abbinate.length}`;
      }
    }
  }

  try {
    const numeroLavoratori = Math.min(3, abbinate.length);
    await Promise.all(Array.from({ length: numeroLavoratori }, () => lavora()));
    const riepilogo = `Foto collegate: ${caricate}/${abbinate.length}. Ignorate: ${scartate.length}. Errori: ${errori.length}.`;
    const dettagli = [...scartate, ...errori].slice(0, 4).join(" ");
    mostraMessaggio(elementi.appMessage, [riepilogo, dettagli].filter(Boolean).join(" "), errori.length || scartate.length ? "avviso" : "successo");
    elementi.photoBatchProgress.textContent = `Completato: ${caricate}/${abbinate.length}`;
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
  elementi.loginView.hidden = Boolean(utente);
  elementi.appView.hidden = !utente;
  if (utente) {
    utenteCorrente = utente;
    mostraCarrello(false);
    iniziaAscolto();
    iniziaAscoltoCarrello(utente.uid);
    caricaPermessiCatalogo(utente.uid);
  }
  else {
    if (interrompiAscolto) interrompiAscolto();
    interrompiAscolto = null;
    if (interrompiCarrelloAscolto) interrompiCarrelloAscolto();
    interrompiCarrelloAscolto = null;
    utenteCorrente = null;
    carrelloCaricato = false;
    catalogoCaricato = false;
    scritturaCarrello = Promise.resolve();
    ordineCorrente = null;
    prodotti = [];
    carrello.clear();
    impostaPermessiCatalogo(false);
    elementi.productList.replaceChildren();
    elementi.productCount.textContent = "Accedi per vedere il catalogo";
    mostraCarrello(false);
    aggiornaCarrello();
    chiudiSuggerimenti();
  }
});

elementi.cartButton.addEventListener("click", () => mostraCarrello(elementi.cartPage.hidden));
elementi.backToCatalogButton.addEventListener("click", () => mostraCarrello(false));
elementi.cartItems.addEventListener("click", gestisciAzioneCarrello);
elementi.clearCartButton.addEventListener("click", svuotaCarrello);
elementi.placeOrderButton.addEventListener("click", apriConfermaOrdine);
elementi.checkoutForm.addEventListener("submit", inviaOrdine);
elementi.checkoutForm.querySelectorAll("[data-close-checkout]").forEach((pulsante) => {
  pulsante.addEventListener("click", () => elementi.checkoutDialog.close());
});
elementi.checkoutDialog.addEventListener("click", (evento) => {
  if (evento.target === elementi.checkoutDialog) elementi.checkoutDialog.close();
});
elementi.orderBackToCatalogButton.addEventListener("click", () => mostraCarrello(false));
elementi.downloadShippingNoteButton.addEventListener("click", scaricaBollaSpedizione);
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
});
elementi.searchInput.addEventListener("focus", () => {
  if (elementi.searchInput.value.trim()) mostraSuggerimenti();
});
window.addEventListener("online", aggiornaStatoConnessione);
window.addEventListener("offline", aggiornaStatoConnessione);
