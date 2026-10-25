# Prompt per Cursor Composer — Analisi e roadmap fino alla prima beta

Agisci come un **Senior Product Manager, Software Architect, UX Designer e Technical Lead** che collabora con un founder per trasformare un'idea iniziale in una specifica di prodotto e in un piano di sviluppo realistico.

Il tuo compito è **analizzare la repository esistente e redigere una documentazione di progettazione completa, dettagliata e attuabile**, fino a una prima versione beta del prodotto descritto in `initial-brainstorming.md`.

## 1. Obiettivo

Partendo da `initial-brainstorming.md` e dallo stato reale della repository, produci:

1. un'analisi critica del concept e delle ipotesi da validare;
2. una definizione chiara dell'MVP e della prima beta;
3. requisiti funzionali e non funzionali;
4. user journey, casi d'uso e stati principali dell'interfaccia;
5. una proposta di architettura coerente con lo stack esistente;
6. un disegno del flusso AI per interpretazione, chiarimenti e generazione dei prompt;
7. una strategia di sicurezza, privacy, affidabilità e gestione dei costi;
8. una strategia di test e valutazione della qualità;
9. una roadmap dettagliata in fasi, con checklist, dipendenze e criteri di completamento;
10. un piano operativo che permetta di iniziare lo sviluppo in modo incrementale, senza ambiguità importanti.

Il risultato deve essere utile a un founder e a un team di sviluppo per decidere cosa costruire, in quale ordine, come testarlo e quando considerare la beta pronta.

## 2. Concept di prodotto

Il prodotto è un assistente conversazionale per persone che non hanno competenze specifiche in IT, AI o prompt engineering.

L'utente descrive in linguaggio naturale ciò che vuole ottenere, anche in poche frasi imprecise o incomplete. Il sistema:

- interpreta l'obiettivo reale;
- estrae contesto, vincoli, input, destinatario e risultato atteso;
- individua informazioni mancanti o ambiguità;
- pone domande di chiarimento quando hanno un impatto significativo;
- decide quando può procedere con assunzioni esplicite;
- scompone le attività complesse in compiti e sotto-compiti, quando opportuno;
- genera un prompt chiaro, contestualizzato, strutturato e pronto all'uso;
- permette all'utente di visualizzare, modificare, rigenerare e copiare il prompt.

La proposta di valore non è semplicemente rendere un prompt più lungo o più elegante. Il prodotto dovrebbe aiutare l'utente a ottenere risultati più pertinenti, completi e utilizzabili, riducendo ambiguità e iterazioni.

Per la prima beta, considera come ipotesi di partenza un prodotto che **genera prompt e permette di copiarli in un LLM esterno**, senza esecuzione diretta dei task tramite il prodotto, a meno che la repository o i requisiti già esistenti non indichino chiaramente una scelta diversa. Tratta questa impostazione come un'ipotesi da esplicitare e valutare, non come un fatto immutabile.

Il target iniziale ipotizzato è costituito da professionisti e lavoratori che già usano strumenti AI, ma non possiedono competenze specifiche di prompt engineering. Non dare per validato questo segmento: valuta alternative e proponi un metodo di validazione.

## 3. Regole di lavoro fondamentali

### 3.1 Analizza prima di decidere

Prima di produrre raccomandazioni:

- esamina la struttura della repository;
- leggi i README, i documenti esistenti e le convenzioni di progetto;
- identifica linguaggi, framework, dipendenze, strumenti di build, test, lint e type checking;
- individua frontend, backend, API, database, autenticazione, integrazioni AI, configurazione e deployment, se presenti;
- analizza lo stato del codice e delle funzionalità già implementate;
- individua test esistenti, debito tecnico, TODO e punti incompleti rilevanti;
- identifica le convenzioni per documentazione, naming e organizzazione dei file.

Non presumere che la repository sia vuota o che utilizzi uno stack particolare. Non proporre una riscrittura completa senza una motivazione verificabile.

### 3.2 Non implementare ancora il prodotto

In questa fase il compito è di **analisi e progettazione**, non di implementazione.

- Non modificare codice applicativo.
- Non installare dipendenze.
- Non eseguire migrazioni.
- Non modificare configurazioni di runtime o deployment.
- Non creare segreti, chiavi API o account esterni.
- Non eliminare o sovrascrivere documentazione esistente.
- Non effettuare refactoring.

Puoi creare o aggiornare esclusivamente i documenti di progettazione richiesti, rispettando le convenzioni già presenti nella repository. Se è necessario modificare un documento esistente, verifica prima che non contenga decisioni o informazioni da preservare.

Se una decisione richiede input del founder, documenta la questione come **decisione aperta**, indica le opzioni, i trade-off, la tua raccomandazione e il motivo. Non inventare requisiti mancanti e non bloccare tutta l'analisi per dettagli che possono essere dichiarati come ipotesi.

### 3.3 Distingui fatti, ipotesi e raccomandazioni

In tutta la documentazione usa categorie esplicite quando utile:

- **Fatto osservato:** verificato nella repository o nei requisiti forniti.
- **Ipotesi:** non ancora validata.
- **Raccomandazione:** proposta motivata.
- **Decisione aperta:** richiede una scelta del founder o ulteriori evidenze.
- **Fuori scope beta:** idea che non deve entrare nella prima versione, salvo motivazione esplicita.

Per ogni scelta tecnica importante spiega brevemente perché è adatta al progetto esistente e quali alternative sono state considerate. Evita affermazioni non supportate.

### 3.4 Evita l'overengineering

Progetta la soluzione minima che possa validare la proposta di valore in modo credibile.

- Non introdurre microservizi, code, agenti autonomi, vector database, sistemi multi-model o infrastrutture complesse senza un requisito concreto.
- Non aggiungere autenticazione, pagamenti, cronologia persistente, upload di file o integrazioni esterne alla beta se non sono necessari per il caso d'uso prioritario o già presenti e funzionali.
- Distingui ciò che è essenziale per una beta affidabile da ciò che appartiene a versioni future.
- Preferisci componenti semplici, confini chiari, testabilità e costi operativi controllabili.
- Non confondere un prompt ben strutturato con una garanzia di accuratezza dell'output.

## 4. Documenti da produrre

Prima di creare i file, verifica la struttura della repository e individua la cartella documentale già adottata. Se esiste una convenzione, rispettala. Altrimenti crea una cartella `docs/product/` per i documenti di prodotto e progettazione.

Mantieni `initial-brainstorming.md` come documento sorgente del concept. Non riscriverlo per forzare decisioni che devono ancora essere validate.

Produci almeno i seguenti documenti. I nomi possono essere adattati alle convenzioni esistenti, ma il contenuto deve essere presente.

### Documento 1 — `product-requirements.md`

Deve includere:

- executive summary;
- problema e opportunità;
- target primario e target secondari;
- personas o profili utente essenziali;
- jobs-to-be-done;
- casi d'uso prioritari;
- proposta di valore;
- obiettivi della beta;
- non-obiettivi e funzionalità esplicitamente fuori scope;
- requisiti funzionali numerati e tracciabili, per esempio `FR-001`;
- requisiti non funzionali numerati, per esempio `NFR-001`;
- priorità MoSCoW (Must, Should, Could, Won't);
- criteri di accettazione verificabili per i requisiti Must;
- assunzioni e decisioni aperte;
- rischi di prodotto e dipendenze;
- metriche e ipotesi di validazione.

Evita requisiti vaghi come “il sistema deve essere intuitivo” se non sono accompagnati da criteri osservabili o da un metodo di verifica.

### Documento 2 — `user-journeys-and-ux.md`

Descrivi:

- il percorso principale dal primo accesso alla copia del prompt;
- i passaggi conversazionali;
- gli stati dell'interfaccia;
- le domande di chiarimento;
- la visualizzazione dell'interpretazione del sistema;
- la revisione e rigenerazione del prompt;
- il comportamento in caso di input vuoto, ambiguo, troppo ampio o non supportato;
- loading, errori, timeout, retry e stati di successo;
- i messaggi e le indicazioni utili a un utente non tecnico;
- accessibilità e responsive design;
- edge case principali.

Includi almeno 3 scenari completi e concreti, dal testo iniziale dell'utente al prompt generato, comprendendo:
1. richiesta semplice che non necessita chiarimenti;
2. richiesta con un'ambiguità importante;
3. richiesta complessa che beneficia di task decomposition.

Non è necessario produrre mockup grafici: descrivi con precisione struttura, contenuti e comportamento dell'interfaccia.

### Documento 3 — `technical-architecture.md`

Descrivi l'architettura raccomandata sulla base della repository reale.

Includi:

- stato attuale e componenti già presenti;
- architettura target per la beta;
- responsabilità dei componenti;
- flusso dei dati;
- confini frontend/backend, se applicabili;
- integrazione con il provider LLM;
- gestione della configurazione e delle chiavi;
- gestione degli errori e dei timeout;
- validazione degli input e degli output;
- persistenza necessaria e dati che non devono essere conservati;
- logging e osservabilità;
- sicurezza e privacy;
- gestione dei costi e limiti di utilizzo;
- deployment e ambienti, se applicabili;
- alternative considerate e trade-off;
- diagramma Mermaid, se utile;
- decisioni architetturali che meritano un ADR.

Non proporre uno stack nuovo se quello esistente può soddisfare i requisiti senza costi sproporzionati. Se la repository è incompleta, separa chiaramente architettura attuale e proposta.

### Documento 4 — `ai-prompt-engine-design.md`

Progetta nel dettaglio il comportamento del motore AI.

Includi:

- schema dei dati estratti dalla richiesta;
- rappresentazione di obiettivo, contesto, vincoli, input, output e criteri di successo;
- classificazione della tipologia di task, solo se giustificata;
- rilevazione delle ambiguità e delle informazioni mancanti;
- criteri per decidere se fare una domanda, procedere o dichiarare un'assunzione;
- gestione dello stato conversazionale;
- generazione delle domande di chiarimento;
- criteri per la scomposizione in compiti e sotto-compiti;
- struttura del prompt finale;
- adattamento del formato al tipo di attività;
- gestione delle richieste fuori ambito;
- validazione e controlli di qualità;
- strategie di retry e fallback;
- prevenzione di istruzioni contraddittorie o dettagli inventati;
- trattamento sicuro di input non attendibili;
- esempi di input e output;
- pseudocodice o diagramma del flusso;
- limiti noti e casi che richiedono verifica umana.

Proponi una soluzione implementabile nella beta, non un sistema teorico eccessivamente complesso. Specifica cosa può essere gestito con istruzioni al modello, cosa richiede logica applicativa deterministica e cosa può essere rimandato.

### Documento 5 — `testing-and-evaluation.md`

Definisci come verificare che il prodotto funzioni e che la generazione dei prompt offra valore.

Includi:

- strategia di test unitari, integrazione ed end-to-end coerente con lo stack;
- test dei flussi conversazionali;
- test per input vuoti, ambigui, lunghi, malformati e non supportati;
- test per errori provider, timeout, rate limit e risposte non valide;
- test di sicurezza e privacy pertinenti;
- test di regressione dei prompt;
- dataset iniziale di valutazione, usando dati sintetici o autorizzati;
- rubric di valutazione con criteri definiti, ad esempio aderenza all'obiettivo, completezza, chiarezza, gestione delle ambiguità, rispetto dei vincoli e assenza di dettagli inventati;
- metodo di confronto tra richiesta originale e prompt migliorato;
- confronto con una baseline ragionevole;
- modalità per valutare la qualità senza affidarsi esclusivamente a un altro LLM come giudice;
- metriche tecniche e di prodotto;
- criteri di pass/fail per la beta;
- limiti e rischi della valutazione.

Quando possibile, proponi esempi ripetibili e criteri misurabili. Non inventare risultati di test: descrivi test da eseguire e risultati attesi.

### Documento 6 — `beta-roadmap.md`

Questo è il documento operativo principale.

Crea una roadmap dalla fase attuale fino al rilascio della prima beta. Organizzala in fasi ordinate e dipendenze esplicite, ad esempio:

1. discovery e verifica della repository;
2. chiusura delle decisioni di prodotto essenziali;
3. requisiti e UX;
4. architettura e contratti;
5. setup e fondazioni tecniche, se necessari;
6. implementazione del flusso principale;
7. implementazione del motore AI;
8. gestione errori, sicurezza e privacy;
9. test e valutazione;
10. beta interna;
11. beta con utenti pilota;
12. criteri di rilascio e retrospettiva.

Adatta le fasi alla realtà del progetto: non includere passaggi che sono già completati senza segnalarli come tali.

Per ogni fase includi:

- obiettivo;
- attività;
- checklist di task atomici;
- identificativo univoco per ogni task, ad esempio `BETA-001`;
- priorità;
- dipendenze;
- deliverable;
- criteri di accettazione;
- come verificare il completamento;
- rischi o blocchi;
- definizione di completato (Definition of Done).

La checklist deve essere concreta e spuntabile con Markdown, ad esempio `- [ ] BETA-001 — ...`.

Non usare stime temporali arbitrarie se non sono disponibili informazioni sufficienti su team, disponibilità e complessità. Se le stime sono utili, esprimile come intervalli orientativi e dichiara le assunzioni.

Evidenzia il percorso critico e identifica ciò che può procedere in parallelo.

Concludi con:
- checklist complessiva per dichiarare la beta pronta;
- criteri Go/No-Go;
- problemi che bloccano il rilascio;
- miglioramenti post-beta;
- decisioni che il founder deve prendere prima dell'implementazione.

### Documento 7 — `open-questions-and-decisions.md`

Crea un registro delle decisioni aperte.

Per ogni decisione includi:

- ID;
- domanda;
- contesto;
- opzioni plausibili;
- vantaggi e svantaggi;
- raccomandazione;
- impatto sul prodotto o sull'architettura;
- urgenza;
- chi deve decidere;
- stato (`Open`, `Proposed`, `Accepted`, `Deferred`).

Distingui le decisioni che bloccano la beta da quelle che possono essere rinviate. Non presentare le raccomandazioni come decisioni già approvate dal founder.

### Documento 8 — `repository-assessment.md`

Riassumi lo stato della repository:

- struttura e componenti;
- stack e versioni rilevanti, se identificabili;
- funzionalità già implementate;
- test e controlli disponibili;
- documentazione esistente;
- debito tecnico e rischi osservati;
- lacune rispetto ai requisiti della beta;
- elementi da riutilizzare;
- elementi da chiarire;
- riferimenti a file e percorsi effettivi della repository.

Distingui ciò che hai verificato direttamente da ciò che non è stato possibile verificare.

## 5. Requisiti di progettazione da affrontare

La documentazione deve trattare esplicitamente i seguenti temi.

### 5.1 Flusso conversazionale

Definisci gli stati e le transizioni principali, ad esempio:

- richiesta iniziale;
- analisi in corso;
- richiesta di chiarimento;
- attesa della risposta dell'utente;
- analisi aggiornata;
- generazione del prompt;
- revisione del prompt;
- prompt pronto da copiare;
- errore recuperabile;
- errore non recuperabile.

Non adottare necessariamente questi nomi se lo stack o il modello di prodotto suggeriscono un'altra soluzione, ma documenta chiaramente il comportamento.

### 5.2 Gestione delle domande

Progetta un comportamento che eviti sia domande inutili sia assunzioni rischiose.

Per ogni domanda, considera:
- quale incertezza risolve;
- quanto può cambiare il risultato;
- se è possibile procedere con un'assunzione esplicita;
- se la domanda è comprensibile a un utente non tecnico;
- se il costo di una domanda aggiuntiva è giustificato.

### 5.3 Prompt finale

Valuta una struttura che, quando pertinente, includa:

- obiettivo;
- contesto;
- input;
- destinatario;
- compiti e sotto-compiti;
- vincoli;
- formato dell'output;
- criteri di qualità;
- gestione delle incertezze;
- controlli finali.

La struttura deve essere flessibile e proporzionata alla complessità. Non inserire sezioni irrilevanti solo per rispettare un template.

### 5.4 Task decomposition

Definisci criteri per scegliere tra:
- singolo prompt;
- prompt con passaggi sequenziali espliciti;
- più prompt coordinati.

Per la beta, preferisci il comportamento più semplice che consenta di validare il valore. Non introdurre un motore autonomo di esecuzione multi-step se il prodotto deve soltanto generare e copiare prompt.

### 5.5 Qualità e affidabilità

Definisci come ridurre:
- dettagli contestuali inventati;
- obiettivi interpretati male;
- vincoli omessi;
- domande eccessive;
- prompt ridondanti;
- output malformati;
- istruzioni in conflitto;
- falsi segnali di certezza.

### 5.6 Sicurezza e privacy

Valuta almeno:
- protezione delle chiavi API;
- validazione input e output;
- rate limiting, se necessario;
- abuso del servizio e costi inattesi;
- gestione degli errori senza esporre segreti;
- minimizzazione dei dati e log;
- eventuale conservazione della cronologia;
- contenuti sensibili inviati al provider LLM;
- prompt injection, soprattutto se in futuro saranno accettati file o contenuti esterni;
- limiti e avvertenze per ambiti ad alto impatto.

Non dichiarare conformità legale o certificazioni senza una verifica specifica. Segnala gli aspetti che richiedono una valutazione professionale.

## 6. Strategia di scope per la beta

Proponi una versione beta minima che consenta di verificare il valore centrale.

Come ipotesi iniziale, valuta questo flusso:

1. l'utente inserisce una richiesta in linguaggio naturale;
2. il sistema interpreta obiettivo, contesto e risultato desiderato;
3. se necessario, pone una o più domande mirate;
4. il sistema genera un prompt strutturato;
5. l'utente può leggerlo, modificarlo, rigenerarlo e copiarlo;
6. il sistema gestisce in modo chiaro errori, limiti e casi non supportati.

Valuta se la beta necessita davvero di:
- account e autenticazione;
- database e cronologia;
- upload di file;
- esecuzione diretta dei task;
- scelta manuale del modello;
- libreria di template;
- pagamenti;
- collaborazione tra utenti;
- analytics avanzate.

Per ogni funzione indica se è `Must`, `Should`, `Could` o `Won't` per la beta, con una motivazione. Non includere una funzionalità soltanto perché è comune in prodotti simili.

## 7. Qualità attesa della documentazione

La documentazione deve essere completa ma leggibile, specifica e utilizzabile.

- Scrivi in italiano.
- Usa titoli, tabelle e checklist quando migliorano la consultazione.
- Mantieni coerenti nomi, termini e identificativi tra i documenti.
- Evita ripetizioni estese: usa riferimenti incrociati quando opportuno.
- Collega i requisiti alle fasi della roadmap e ai test.
- Se una sezione non è applicabile, spiega perché invece di riempirla con contenuto generico.
- Non inventare metriche, risultati, versioni, file o funzionalità.
- Cita i percorsi reali dei file quando descrivi lo stato della repository.
- Evidenzia le informazioni che richiedono una decisione del founder.
- Se la documentazione diventa molto lunga, mantieni un indice e separa correttamente gli argomenti.

La roadmap deve essere eseguibile: ogni task deve descrivere un risultato concreto, non un'intenzione vaga come “migliorare l'AI” o “rendere il sistema sicuro”.

## 8. Tracciabilità

Crea una tracciabilità essenziale tra:

- obiettivi di prodotto;
- requisiti;
- componenti architetturali;
- user journey;
- test;
- task della roadmap;
- criteri di rilascio.

Usa identificativi coerenti e riferimenti incrociati. Non è necessario costruire un sistema di gestione requisiti complesso, ma deve essere possibile capire quali task realizzano un requisito e quali test ne verificano il comportamento.

## 9. Processo operativo da seguire

Procedi in questo ordine:

### Passo 1 — Ispezione

Analizza la repository, individua i documenti esistenti e raccogli evidenze sullo stato del progetto.

### Passo 2 — Sintesi iniziale

Definisci:
- cosa esiste già;
- cosa manca;
- quali sono i rischi più rilevanti;
- quali assunzioni sono necessarie;
- quali decisioni bloccano la progettazione.

### Passo 3 — Definizione della beta

Proponi uno scope minimo, criteri di successo, funzionalità escluse e casi d'uso prioritari.

### Passo 4 — Progettazione

Redigi i documenti richiesti, mantenendo coerenza tra requisiti, UX, architettura, motore AI, test e roadmap.

### Passo 5 — Verifica di coerenza

Prima di concludere:
- controlla che ogni requisito Must abbia criteri di accettazione;
- controlla che ogni requisito Must sia coperto da almeno un task di roadmap;
- controlla che i comportamenti principali siano coperti da test;
- controlla che la beta abbia criteri Go/No-Go;
- controlla che le dipendenze tra task siano coerenti;
- verifica che le funzionalità fuori scope non ricompaiano come requisiti obbligatori;
- segnala eventuali contraddizioni o lacune residue.

### Passo 6 — Riepilogo finale

Al termine, fornisci un riepilogo conciso che riporti:
- documenti creati o aggiornati;
- principali evidenze della repository;
- proposta di scope beta;
- decisioni più urgenti per il founder;
- primi task da affrontare;
- rischi o limiti che restano aperti.

## 10. Condizioni di completamento del tuo incarico

Considera completata questa fase solo quando:

- [X] la repository è stata analizzata e lo stato attuale è documentato;
- [X] lo scope della beta è definito e motivato;
- [X] requisiti funzionali e non funzionali sono documentati e prioritizzati;
- [X] il flusso UX principale e gli edge case sono descritti;
- [X] l'architettura è coerente con lo stack esistente;
- [X] il motore di interpretazione, chiarimento e generazione è specificato;
- [X] sicurezza, privacy, errori e costi sono stati considerati;
- [X] la strategia di test e valutazione è documentata;
- [X] la roadmap contiene checklist atomiche, dipendenze e criteri di accettazione;
- [X] sono presenti criteri verificabili per dichiarare la beta pronta;
- [X] le decisioni aperte sono registrate senza fingere che siano state approvate;
- [X] è stata eseguita una verifica di coerenza tra documenti;
- [X] non è stato modificato codice applicativo né sono state introdotte dipendenze.

**Inizia ora dal Passo 1: ispeziona la repository e leggi `initial-brainstorming.md`. Non iniziare a implementare il prodotto.**
