# Catalogo prodotti Dolcevolta

Applicazione statica mobile-first per consultare e gestire il catalogo. Usa HTML, CSS e JavaScript standard: non richiede npm, framework o compilazione. Firestore conserva prodotti e account; Cloudinary ospita le foto.

## 1. Creare il progetto Firebase gratuito

1. Apri [console.firebase.google.com](https://console.firebase.google.com/) e scegli **Aggiungi progetto**. Dai al progetto il nome che preferisci; Google Analytics non è necessario.
2. Nel progetto fai clic su **Aggiungi app** e scegli l’app Web (`</>`).
3. La configurazione Web del progetto `peppeprogetto-8afc8` è già inserita nel blocco `firebaseConfig` all’inizio di `app.js`. Se colleghi un altro progetto, sostituisci quei valori con la configurazione della sua app Web.

Le chiavi di configurazione Firebase presenti nel frontend non sono segrete: sono visibili a chiunque apra il sito. È quindi essenziale pubblicare le regole di sicurezza indicate qui sotto: sono le regole a limitare i dati agli utenti autenticati.

## 2. Attivare i servizi

1. In **Authentication > Metodo di accesso**, abilita **Email/Password**. Poi apri **Utenti > Aggiungi utente** e crea l’utente con la tua email e password. L’app non permette la registrazione pubblica.
2. Apri **Firestore Database > Crea database**, scegli la modalità **produzione** e una regione europea (per esempio `eur3`). Dalla scheda **Regole**, incolla il contenuto di `firestore.rules` e fai clic su **Pubblica**.
3. Per caricare le foto, crea un account Cloudinary e un preset unsigned in **Settings > Upload > Upload presets**. Il Cloud name `lgpus1ka` e il preset `peppe_progetto` sono già impostati all’inizio di `app.js`. Nel preset consenti solo JPEG, limita la dimensione a 2 MB e imposta la cartella `prodotti`, se queste opzioni sono disponibili. Non serve attivare Firebase Storage né pubblicare `storage.rules`.

Gli upload unsigned non richiedono un segreto API nel browser, ma il preset è pubblico: chiunque lo conosca può tentare di caricare immagini. Limita formati e dimensioni nel preset e controlla periodicamente gli utilizzi. Il prodotto viene salvato su Firestore prima del caricamento della foto; se l’upload fallisce, i dati restano salvati e puoi riprovare la foto modificando il prodotto. Per mantenere il sito solo frontend, l’app non elimina le immagini da Cloudinary: quando elimini un prodotto o sostituisci la foto, il file remoto può restare nella libreria Cloudinary e va rimosso da lì manualmente.

## 3. Pubblicare e usare

1. Pubblica la cartella trascinandola su [Netlify Drop](https://app.netlify.com/drop), oppure collega il repository a Vercel come sito statico.
2. In **Firebase Authentication > Impostazioni > Domini autorizzati**, verifica che `localhost` sia presente per i test locali e aggiungi il dominio del sito pubblicato.
3. Apri il sito, accedi con l’utente creato nella Console Firebase, fai clic su **Importa JSON** e scegli `prodotti_dolcevolta.json`. L’importazione usa l’ID numerico del file come ID documento; rilanciarla aggiorna i prodotti esistenti senza cancellare le foto già caricate.

La barra strumenti permette di filtrare per categoria, aggiungere prodotti, importare il JSON ed eliminare il catalogo intero. L’eliminazione completa richiede una conferma e la parola `ELIMINA`; importazioni ed eliminazioni richiedono una connessione Internet. Per associare molte foto in una volta, selezionale con **Seleziona foto**: ciascun nome deve iniziare con l’ID numerico Firestore del prodotto, per esempio `235.jpg`. L’app non usa il codice prodotto per l’abbinamento, perché i codici possono essere duplicati. Le foto caricate su Cloudinary non possono essere eliminate dall’app frontend: rimuovile dalla libreria Cloudinary se necessario.

Ogni scheda prodotto ha il pulsante **Aggiungi al carrello**. L’icona accanto a **Esci** apre la vista carrello, dove puoi aumentare o diminuire le quantità, rimuovere articoli e vedere il totale. Il totale usa il prezzo standard `prezzo` (IVA inclusa) e non include `prezzoAlt`; gli articoli senza prezzo sono indicati ma non conteggiati nel totale. Il carrello è solo temporaneo nel browser: non viene salvato su Firestore o sul dispositivo, si svuota ricaricando la pagina o uscendo dall’account e non invia ordini né pagamenti.

Toccando la foto o il contenuto di una scheda si apre il dettaglio del prodotto. Anche un suggerimento della ricerca apre lo stesso dettaglio, da cui puoi aggiungere il prodotto al carrello.

Per provare il sito localmente, avvialo da un server statico (non aprire `index.html` direttamente come file), per esempio con l’estensione Live Server di VS Code. Non serve alcun comando di build.

### Problemi comuni

- **`permission-denied`**: verifica di aver effettuato l’accesso e di aver pubblicato le regole di `firestore.rules` nel progetto corretto.
- **Dominio non autorizzato**: aggiungi il dominio effettivo del sito in **Authentication > Impostazioni > Domini autorizzati**.
- **Foto che non si carica**: verifica Cloud name e preset unsigned in `app.js`, le impostazioni del preset Cloudinary e la connessione. Le foto vengono ridimensionate in JPEG e devono restare sotto 2 MB.
- **Cache offline**: Firestore mantiene una cache locale consultabile con connessione assente o debole. La sincronizzazione delle modifiche richiede comunque una connessione; non cancellare i dati del browser se vuoi mantenere la cache.
