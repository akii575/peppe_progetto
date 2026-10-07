# Catalogo prodotti Dolcevolta

Applicazione statica mobile-first per consultare e gestire il catalogo. Usa HTML, CSS e JavaScript standard: non richiede npm, framework o compilazione.

## 1. Creare il progetto Firebase gratuito

1. Apri [console.firebase.google.com](https://console.firebase.google.com/) e scegli **Aggiungi progetto**. Dai al progetto il nome che preferisci; Google Analytics non è necessario.
2. Nel progetto fai clic su **Aggiungi app** e scegli l’app Web (`</>`).
3. La configurazione Web del progetto `peppeprogetto-8afc8` è già inserita nel blocco `firebaseConfig` all’inizio di `app.js`. Se colleghi un altro progetto, sostituisci quei valori con la configurazione della sua app Web.

Le chiavi di configurazione Firebase presenti nel frontend non sono segrete: sono visibili a chiunque apra il sito. È quindi essenziale pubblicare le regole di sicurezza indicate qui sotto: sono le regole a limitare i dati agli utenti autenticati.

## 2. Attivare i servizi

1. In **Authentication > Metodo di accesso**, abilita **Email/Password**. Poi apri **Utenti > Aggiungi utente** e crea l’utente con la tua email e password. L’app non permette la registrazione pubblica.
2. Apri **Firestore Database > Crea database**, scegli la modalità **produzione** e una regione europea (per esempio `eur3`). Dalla scheda **Regole**, incolla il contenuto di `firestore.rules` e fai clic su **Pubblica**.
3. Per usare Firebase Storage, collega un account di fatturazione e passa al piano **Blaze**. Crea il bucket da **Storage > Inizia**, poi nella scheda **Regole** incolla il contenuto di `storage.rules` e fai clic su **Pubblica**. Su Blaze può essere disponibile una quota senza costo; l’uso oltre le quote previste può essere addebitato. Consulta la [FAQ ufficiale di Firebase Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) e i prezzi correnti prima di abilitare la fatturazione.

## 3. Pubblicare e usare

1. Pubblica la cartella trascinandola su [Netlify Drop](https://app.netlify.com/drop), oppure collega il repository a Vercel come sito statico.
2. In **Firebase Authentication > Impostazioni > Domini autorizzati**, verifica che `localhost` sia presente per i test locali e aggiungi il dominio del sito pubblicato.
3. Apri il sito, accedi con l’utente creato nella Console Firebase, fai clic su **Importa da file JSON** e scegli `prodotti_dolcevolta.json`. L’importazione usa l’ID numerico del file come ID documento; rilanciarla aggiorna i prodotti esistenti senza cancellare le foto già caricate.

Per provare il sito localmente, avvialo da un server statico (non aprire `index.html` direttamente come file), per esempio con l’estensione Live Server di VS Code. Non serve alcun comando di build.

### Problemi comuni

- **`permission-denied`**: verifica di aver effettuato l’accesso e di aver pubblicato le regole di `firestore.rules` e `storage.rules` nel progetto corretto.
- **Dominio non autorizzato**: aggiungi il dominio effettivo del sito in **Authentication > Impostazioni > Domini autorizzati**.
- **Foto che non si carica**: controlla che il bucket Storage sia stato creato, che il progetto sia sul piano Blaze e che le regole siano pubblicate. Le foto vengono ridimensionate in JPEG e devono restare sotto 2 MB.
- **Cache offline**: Firestore mantiene una cache locale consultabile con connessione assente o debole. La sincronizzazione delle modifiche richiede comunque una connessione; non cancellare i dati del browser se vuoi mantenere la cache.
