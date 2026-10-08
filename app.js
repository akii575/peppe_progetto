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
  logoutButton: document.getElementById("logout-button"),
  connectionMessage: document.getElementById("connection-message"),
  toolbar: document.querySelector(".toolbar"),
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
let interrompiAscolto = null;
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

function formattaPrezzo(prezzo) {
  return typeof prezzo === "number" && Number.isFinite(prezzo)
    ? formatterPrezzo.format(prezzo)
    : "Prezzo non indicato";
}

function creaPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "product-photo-placeholder";
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
    immagine.replaceWith(creaPlaceholder());
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

  if (prodotto.fotoUrl) {
    scheda.append(creaImmagine(prodotto.fotoUrl, "product-photo", `Foto di ${prodotto.nome}`));
  } else {
    scheda.append(creaPlaceholder());
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
  corpo.append(azioni);
  scheda.append(corpo);
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
    aggiornaCategorie();
    filtraProdotti();
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
  if (utente) iniziaAscolto();
  else {
    if (interrompiAscolto) interrompiAscolto();
    interrompiAscolto = null;
    prodotti = [];
    elementi.productList.replaceChildren();
    elementi.productCount.textContent = "Accedi per vedere il catalogo";
    chiudiSuggerimenti();
  }
});

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
