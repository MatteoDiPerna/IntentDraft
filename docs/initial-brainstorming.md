# AI Prompt Assistant — Initial Brainstorming

**Documento:** `initial-brainstorming.md`  
**Versione:** 0.1  
**Stato:** Concept iniziale — da validare  
**Scopo:** raccogliere l'idea iniziale, il problema, le ipotesi di prodotto e una possibile direzione per la prima versione beta.

---

## 1. Executive summary

L'idea è realizzare un software che aiuti persone senza competenze specifiche in IT, intelligenza artificiale o prompt engineering a comunicare in modo più efficace con i Large Language Models (LLM).

L'utente descrive in linguaggio naturale ciò che vuole ottenere, anche con poche frasi incomplete, imprecise o disordinate. Il software interpreta l'intento, identifica le informazioni mancanti, pone eventuali domande di chiarimento e genera un prompt strutturato e contestualizzato.

Per le attività complesse, il software può inoltre suddividere l'obiettivo in compiti e sotto-compiti, costruendo una sequenza coerente di istruzioni.

### Visione

Rendere accessibile a chiunque la capacità di utilizzare efficacemente i modelli di intelligenza artificiale, indipendentemente dalle competenze tecniche.

### Proposta di valore

> Tu spieghi cosa vuoi ottenere. Il software trasforma la tua idea in istruzioni che aiutano l'AI a lavorare meglio.

Il valore del prodotto non dovrebbe limitarsi a rendere un prompt più lungo o più elegante, ma aiutare l'utente a ottenere risultati più pertinenti, completi, accurati e utilizzabili, riducendo le iterazioni necessarie.

---

## 2. Il problema

Molte persone sanno quale risultato desiderano ottenere da un LLM, ma non sanno come descrivere il compito in modo sufficientemente chiaro, completo e strutturato.

Le difficoltà principali sono tre.

### 2.1 Difficoltà nell'esprimere il bisogno

L'utente conosce il risultato desiderato, ma non sa quali dettagli, vincoli o informazioni contestuali fornire.

**Esempio:** «Fammi un piano marketing», senza specificare pubblico, budget, obiettivi, settore o tempistiche.

### 2.2 Difficoltà nel scomporre attività complesse

Alcune richieste comprendono più attività che richiedono passaggi distinti, dipendenze e verifiche.

**Esempio:** analizzare dati, individuare tendenze, confrontare scenari, formulare raccomandazioni e produrre una relazione.

### 2.3 Risultati poco accurati o poco utilizzabili

L'utente potrebbe non sapere come specificare criteri di qualità, formato, fonti, limiti o verifiche.

**Esempio:** ottenere una relazione apparentemente convincente ma contenente supposizioni non dichiarate o conclusioni non supportate dai dati.

### Ipotesi centrale

Il prodotto potrebbe offrire più valore combinando:

- comprensione dell'intento;
- identificazione delle informazioni mancanti;
- domande di chiarimento adattive;
- scomposizione delle attività complesse;
- generazione di istruzioni strutturate;
- criteri di qualità e verifica.

Un semplice strumento di riscrittura dei prompt potrebbe essere facilmente replicabile. Un assistente che comprende l'obiettivo e costruisce un processo adeguato al compito potrebbe risultare più utile.

---

## 3. Concept e funzionamento ipotizzato

Il prodotto si presenta inizialmente come un'interfaccia conversazionale semplice.

### Fase 1 — L'utente descrive il proprio bisogno

L'utente scrive liberamente ciò che vuole fare, anche in modo incompleto o disordinato.

**Esempio:**

> Devo preparare una presentazione per il mio responsabile sui risultati delle vendite, usando i dati che ho in Excel. Vorrei qualcosa di professionale e facile da capire.

Non è necessario che l'utente conosca il prompt engineering o sappia anticipare tutte le informazioni rilevanti.

### Fase 2 — Il software interpreta e struttura la richiesta

Il sistema prova a identificare:

- obiettivo principale;
- contesto;
- destinatario del risultato;
- input e risorse disponibili;
- vincoli;
- formato desiderato;
- criteri di successo;
- informazioni mancanti;
- complessità e possibili sotto-attività.

### Fase 3 — Il software chiarisce eventuali ambiguità

Se mancano informazioni che potrebbero cambiare significativamente il risultato, il sistema pone domande mirate.

Le domande devono essere adattive: una richiesta semplice non dovrebbe generare un'intervista lunga, mentre un compito complesso potrebbe richiedere più chiarimenti.

Il sistema dovrebbe distinguere tra informazioni essenziali, informazioni utili ma facoltative e assunzioni ragionevoli che può dichiarare esplicitamente.

### Fase 4 — Il software genera il prompt

Il sistema produce istruzioni strutturate e contestualizzate, che possono includere:

- ruolo o prospettiva utile;
- obiettivo;
- contesto;
- input disponibili;
- compiti e sotto-compiti;
- vincoli e regole;
- formato dell'output;
- criteri di qualità;
- gestione delle informazioni mancanti;
- verifiche da eseguire;
- indicazione di non inventare dati o fonti.

La struttura deve adattarsi al tipo di attività, evitando di applicare rigidamente lo stesso modello a ogni richiesta.

### Fase 5 — L'utente utilizza il prompt

Nella prima versione, l'utente può copiare il prompt e incollarlo nel proprio LLM preferito.

In una versione successiva, il software potrebbe eseguire direttamente il prompt attraverso un modello integrato, verificare i risultati e supportare un ciclo di miglioramento.

---

## 4. Esempio concettuale di utilizzo

### Richiesta iniziale

> Devo analizzare un file Excel con le vendite degli ultimi 12 mesi. Voglio capire quali prodotti vendono meglio, quali stanno andando male e cosa potrei fare per migliorare i risultati. Devo presentare tutto al mio responsabile.

### Interpretazione del sistema

- **Obiettivo:** analizzare le performance commerciali e individuare opportunità di miglioramento.
- **Input:** file Excel con i dati delle vendite.
- **Destinatario:** responsabile aziendale.
- **Risultato desiderato:** sintesi esecutiva, analisi, visualizzazioni e raccomandazioni.
- **Chiarimento potenzialmente utile:** analizzare soltanto i volumi oppure anche fatturato e margini, se disponibili?

### Esempio di prompt generato

**Ruolo e obiettivo**

Agisci come un analista commerciale esperto. Analizza il file Excel fornito per identificare le performance di vendita degli ultimi 12 mesi e produrre una relazione destinata a un responsabile aziendale.

**Attività**

1. Verifica la struttura, le colonne e la qualità dei dati.
2. Identifica dati mancanti, duplicati, anomalie e limitazioni rilevanti.
3. Analizza le performance per prodotto e periodo, in base ai campi disponibili.
4. Individua trend, variazioni significative e possibili criticità.
5. Formula raccomandazioni basate sui dati disponibili.
6. Prepara una sintesi esecutiva con tabelle e grafici pertinenti.

**Vincoli di qualità**

- Non inventare dati.
- Distingui i risultati verificabili dalle ipotesi.
- Segnala eventuali limiti informativi.
- Giustifica le raccomandazioni con evidenze quantitative quando disponibili.
- Non formulare conclusioni che i dati non consentono di sostenere.
- Adatta il linguaggio a un responsabile aziendale che necessita di informazioni chiare e sintetiche.

Questo esempio è illustrativo e non rappresenta un risultato già prodotto da un sistema funzionante.

---

## 5. Target e segmenti iniziali

La visione può essere generalista, ma la prima versione dovrebbe essere validata su un segmento specifico.

### 5.1 Professionisti e impiegati

**Possibili attività:**

- creazione di report;
- preparazione di email e documenti;
- analisi di dati;
- preparazione di presentazioni;
- pianificazione di progetti;
- sintesi di informazioni.

**Vantaggio potenziale:** il valore può essere misurato in tempo risparmiato e qualità del risultato.

### 5.2 Piccole imprese e professionisti autonomi

**Possibili attività:**

- marketing e comunicazione;
- organizzazione operativa;
- analisi commerciale;
- documentazione;
- procedure ripetibili;
- preparazione di contenuti.

**Vantaggio potenziale:** il prodotto potrebbe aiutare a utilizzare l'AI senza competenze specialistiche o personale dedicato.

### 5.3 Studenti e persone in formazione

**Possibili attività:**

- organizzazione dello studio;
- spiegazione di concetti;
- preparazione di presentazioni;
- creazione di esercizi;
- pianificazione di percorsi di apprendimento.

**Possibile limite:** la disponibilità a pagare potrebbe essere inferiore rispetto a quella di segmenti professionali.

### 5.4 Utenti generalisti

**Possibili attività:**

- organizzazione personale;
- viaggi;
- hobby;
- confronto di opzioni;
- pianificazione di attività quotidiane.

**Vantaggio potenziale:** pubblico ampio e casi d'uso numerosi.

### Ipotesi iniziale

Valutare come segmento iniziale persone che già utilizzano strumenti AI per lavorare, ma non hanno competenze tecniche specifiche.

Questa ipotesi deve essere verificata attraverso interviste, test di utilizzo e prove di disponibilità a pagare.

---

## 6. Proposta di valore e posizionamento

Il posizionamento non dovrebbe limitarsi a «scrivere prompt migliori».

Possibili elementi distintivi:

- **Semplicità:** l'utente non deve conoscere il prompt engineering.
- **Comprensione dell'intento:** il processo parte dal risultato desiderato.
- **Chiarimenti adattivi:** il sistema chiede solo ciò che serve.
- **Scomposizione intelligente:** i compiti complessi vengono organizzati in passaggi coerenti.
- **Adattamento al dominio:** le istruzioni variano in base al tipo di attività.
- **Qualità verificabile:** il prompt include criteri per controllare il risultato.
- **Portabilità:** i prompt possono essere utilizzati su diversi LLM, con eventuali adattamenti quando necessari.
- **Riutilizzo:** prompt e workflow ricorrenti possono essere salvati e adattati.

### Rischio competitivo

Gli LLM migliorano continuamente nella comprensione di richieste semplici e nella riscrittura dei prompt.

Il prodotto deve quindi dimostrare un vantaggio concreto soprattutto in:

- attività complesse;
- processi ripetibili;
- contesti professionali;
- richieste con molti vincoli;
- scomposizione in fasi;
- controllo della qualità del risultato.

---

## 7. Funzionalità ipotizzate per fasi

### 7.1 MVP — Funzionalità essenziali

La prima versione utilizzabile dovrebbe concentrarsi su un flusso breve, affidabile e facilmente testabile.

- [ ] Interfaccia conversazionale in linguaggio naturale.
- [ ] Inserimento di una richiesta libera.
- [ ] Interpretazione dell'obiettivo.
- [ ] Identificazione del contesto, dei vincoli e dell'output desiderato.
- [ ] Rilevazione delle informazioni mancanti.
- [ ] Domande di chiarimento quando necessarie.
- [ ] Generazione di un prompt strutturato.
- [ ] Scomposizione in compiti e sotto-compiti quando utile.
- [ ] Presentazione del prompt in un formato leggibile.
- [ ] Copia del prompt negli appunti.
- [ ] Possibilità di modificare o rigenerare il prompt.
- [ ] Gestione degli errori e degli stati di caricamento.
- [ ] Feedback minimo sulla qualità del risultato.
- [ ] Informativa chiara sui limiti del sistema.

Le tecnologie e i dettagli implementativi devono essere scelti dopo aver analizzato la repository e i vincoli reali del progetto.

### 7.2 Versione successiva — Intelligenza operativa

- [ ] Classificazione del tipo di attività.
- [ ] Strategie di prompt specifiche per dominio.
- [ ] Workflow composti da più prompt coordinati.
- [ ] Gestione delle dipendenze tra attività.
- [ ] Libreria personale di prompt.
- [ ] Modifica e riutilizzo dei prompt.
- [ ] Esportazione in diversi formati.
- [ ] Modelli o template per attività ricorrenti.

### 7.3 Evoluzione futura — Piattaforma integrata

- [ ] Esecuzione diretta tramite uno o più LLM.
- [ ] Selezione del modello in base al compito.
- [ ] Integrazione con file e strumenti esterni.
- [ ] Verifica del risultato rispetto all'obiettivo iniziale.
- [ ] Ciclo di miglioramento iterativo.
- [ ] Workflow condivisibili.
- [ ] Personalizzazione per team e organizzazioni.
- [ ] Funzionalità di amministrazione e controllo per ambienti aziendali, se giustificate.

Queste funzionalità sono ipotesi evolutive, non impegni di sviluppo per la prima beta.

---

## 8. Motore di ragionamento concettuale

Un possibile flusso interno è il seguente.

### 8.1 Intent detection

Comprendere che cosa l'utente vuole ottenere, distinguendo l'obiettivo reale dalla formulazione letterale.

### 8.2 Context analysis

Estrarre le informazioni già disponibili:

- contesto;
- destinatario;
- input;
- risorse;
- vincoli;
- formato;
- criteri di successo.

### 8.3 Gap analysis

Identificare le informazioni mancanti e valutarne l'impatto sul risultato.

Il sistema dovrebbe distinguere tra:

- informazioni indispensabili;
- informazioni utili;
- informazioni non necessarie;
- assunzioni che possono essere dichiarate.

### 8.4 Task decomposition

Determinare se la richiesta può essere gestita con un singolo prompt o se richiede una sequenza di attività.

In caso di scomposizione, definire:

- sotto-attività;
- ordine;
- dipendenze;
- input e output intermedi;
- criteri di completamento.

### 8.5 Prompt generation

Comporre il prompt finale con istruzioni, contesto, vincoli, formato e criteri di qualità appropriati.

### 8.6 Quality checks

Verificare che il prompt:

- sia coerente con l'obiettivo;
- non ometta vincoli importanti già forniti;
- non inventi informazioni contestuali;
- distingua dati disponibili e assunzioni;
- specifichi il formato del risultato;
- includa verifiche proporzionate al compito;
- non sia inutilmente prolisso.

### 8.7 Adattività

Il sistema deve scegliere quando chiedere chiarimenti e quando procedere con le informazioni disponibili.

Una richiesta semplice non dovrebbe generare un questionario eccessivo. Una richiesta complessa potrebbe richiedere più passaggi di chiarimento.

---

## 9. Strategie diverse per diversi tipi di attività

Il software non dovrebbe applicare rigidamente lo stesso template a ogni richiesta.

| Tipo di attività | Elementi che il sistema potrebbe considerare |
|---|---|
| Scrittura | Obiettivo, destinatario, tono, lunghezza, formato |
| Ricerca | Domande, fonti, criteri di attendibilità, sintesi e limiti |
| Analisi dati | Input, controlli, calcoli, interpretazione e visualizzazioni |
| Pianificazione | Obiettivi, risorse, fasi, dipendenze, tempi e rischi |
| Programmazione | Requisiti, ambiente, vincoli tecnici, test ed errori |
| Apprendimento | Livello iniziale, spiegazioni progressive, esempi ed esercizi |
| Comunicazione | Pubblico, messaggio, tono, canale e risultato atteso |
| Decisioni | Alternative, criteri di confronto, ipotesi, rischi e incertezze |

Queste strategie dovrebbero essere validate con esempi reali, non considerate automaticamente corrette per ogni situazione.

---

## 10. Principi di esperienza utente

L'esperienza dovrebbe essere progettata per utenti non tecnici.

Principi iniziali:

1. **Linguaggio semplice:** evitare gergo tecnico non necessario.
2. **Basso attrito:** partire da una descrizione libera del bisogno.
3. **Chiarimenti proporzionati:** chiedere solo le informazioni che possono influenzare il risultato.
4. **Trasparenza:** mostrare in modo comprensibile che cosa è stato interpretato e quali assunzioni sono state fatte.
5. **Controllo dell'utente:** consentire di correggere l'interpretazione e modificare il prompt.
6. **Risultato utilizzabile:** rendere semplice copiare, modificare e riutilizzare il prompt.
7. **Feedback:** permettere di segnalare quando il risultato non è adeguato.
8. **Robustezza:** gestire input vuoti, richieste ambigue, errori del modello e interruzioni.
9. **Privacy:** comunicare chiaramente come vengono trattati input e dati eventualmente forniti.
10. **Accessibilità:** rendere l'interfaccia utilizzabile senza competenze tecniche specifiche.

---

## 11. Principi di qualità, affidabilità e sicurezza

Il prodotto non può garantire che un prompt produca sempre risultati corretti. Può però aiutare a migliorare la chiarezza delle istruzioni e la verificabilità degli output.

Principi da considerare:

- non inventare informazioni sull'utente o sul contesto;
- non presentare assunzioni come fatti;
- chiedere chiarimenti quando l'ambiguità è sostanziale;
- dichiarare i limiti informativi;
- incoraggiare la verifica delle affermazioni importanti;
- includere controlli sui dati quando il compito lo richiede;
- non chiedere informazioni personali non necessarie;
- non inserire segreti o credenziali nei prompt;
- trattare input e documenti dell'utente come dati, non come istruzioni privilegiate per il sistema;
- considerare i rischi di prompt injection se verranno introdotti file, documenti o fonti esterne;
- gestire con attenzione eventuali ambiti ad alto impatto, senza suggerire che il prompt garantisca correttezza professionale.

### Privacy e gestione dei dati

Le scelte definitive dipenderanno dall'architettura, dai provider e dal pubblico. Prima della beta sarà necessario documentare:

- quali dati vengono raccolti;
- se e dove vengono conservate le conversazioni;
- se i prompt vengono inviati a provider esterni;
- quali dati sono inclusi nei log;
- per quanto tempo i dati sono conservati;
- come vengono gestiti cancellazione, accesso e consenso;
- quali informazioni non devono essere inserite dagli utenti.

---

## 12. Ipotesi architetturale ad alto livello

Questa sezione è intenzionalmente tecnologicamente neutrale. L'architettura effettiva deve essere definita dopo l'analisi dei requisiti e della repository esistente.

Possibili componenti logici:

1. **Interfaccia utente:** chat, visualizzazione dei chiarimenti e del prompt finale.
2. **Orchestrazione applicativa:** gestione dello stato della richiesta e dei passaggi conversazionali.
3. **Analisi della richiesta:** estrazione di obiettivo, contesto, vincoli e informazioni mancanti.
4. **Gestione dei chiarimenti:** generazione delle domande e integrazione delle risposte.
5. **Motore di composizione:** generazione del prompt finale o di una sequenza di prompt.
6. **Controlli di qualità:** verifica della completezza e coerenza delle istruzioni.
7. **Persistenza, se necessaria:** gestione delle sessioni e degli eventuali prompt salvati.
8. **Integrazione LLM:** accesso a uno o più provider, con gestione di errori, limiti e costi.
9. **Osservabilità:** logging tecnico, misurazione degli errori e metriche di utilizzo compatibili con i principi di privacy.
10. **Configurazione:** gestione sicura di chiavi, ambienti e parametri.

Non è necessario implementare tutti questi componenti separatamente nella beta. La complessità deve essere proporzionata ai casi d'uso validati.

---

## 13. Validazione prima e durante lo sviluppo

Prima di investire in una piattaforma completa, è utile verificare se il prodotto genera un miglioramento misurabile.

### Esperimento iniziale

1. Raccogliere 15–20 richieste reali da persone con livelli diversi di esperienza nell'uso degli LLM.
2. Selezionare casi d'uso rappresentativi e autorizzati.
3. Prototipare il flusso di chiarimento e generazione del prompt.
4. Confrontare la richiesta originale e il prompt generato usando lo stesso modello, gli stessi input e criteri di valutazione comparabili.
5. Valutare completezza, accuratezza, pertinenza, utilità e numero di correzioni successive.
6. Raccogliere feedback qualitativo e osservare dove gli utenti incontrano difficoltà.
7. Verificare se gli utenti tornerebbero a utilizzare il prodotto.
8. Testare la disponibilità a pagare, se rilevante per il modello di business.

### Principio fondamentale

Il test non deve misurare quanto il prompt generato sembri professionale o sia lungo.

Deve misurare se produce risultati concretamente migliori rispetto alla richiesta iniziale e rispetto a un approccio semplice, come chiedere direttamente a un LLM di migliorare il prompt.

---

## 14. Metriche iniziali da considerare

Le metriche devono essere selezionate in base al prodotto effettivamente implementato.

Possibili indicatori:

- percentuale di richieste per cui viene generato un prompt utilizzabile;
- percentuale di utenti che copiano o esportano il prompt;
- percentuale di utenti che modificano sostanzialmente il prompt;
- numero medio di domande di chiarimento;
- tempo necessario per arrivare a un prompt soddisfacente;
- valutazione della qualità del risultato finale;
- frequenza di rigenerazione;
- tasso di completamento del flusso;
- ritorno degli utenti dopo il primo utilizzo;
- costi medi di inferenza per richiesta;
- frequenza di errori tecnici;
- tasso di feedback negativo.

Queste metriche sono ipotesi da valutare, non requisiti definitivi. Le metriche raccolte devono rispettare le scelte di privacy e minimizzazione dei dati.

---

## 15. Possibile modello di business

Il modello di business non è ancora definito.

Possibili opzioni da esplorare:

### Freemium

- uso gratuito con limiti;
- funzionalità avanzate a pagamento;
- cronologia, libreria personale o workflow evoluti nel piano premium.

### Abbonamento individuale

Potrebbe essere adatto a utenti professionali che utilizzano frequentemente il prodotto.

### Piano per team o aziende

Potrebbe includere condivisione di workflow, standard interni, amministrazione e controlli aziendali, se esiste una domanda reale.

### Pagamento a consumo

Potrebbe essere utile se il prodotto esegue direttamente richieste tramite modelli AI e i costi variano in modo significativo.

### Ipotesi da validare

Non scegliere un modello soltanto sulla base della facilità tecnica. Verificare prima frequenza d'uso, valore percepito, costi operativi e disponibilità a pagare.

---

## 16. Rischi e questioni aperte

### Rischi di prodotto

- Il valore potrebbe essere percepito come una semplice riscrittura di prompt.
- Gli utenti potrebbero preferire utilizzare direttamente il proprio LLM.
- Il processo di chiarimento potrebbe risultare troppo lungo.
- Il prodotto potrebbe cercare di coprire troppi casi d'uso fin dall'inizio.
- La qualità del risultato potrebbe variare tra modelli e tipologie di richiesta.

### Rischi tecnici e operativi

- Costi e limiti dei provider LLM.
- Dipendenza da un singolo provider.
- Errori, timeout e risposte malformate.
- Gestione delle conversazioni e dello stato.
- Protezione delle chiavi API.
- Privacy, conservazione e cancellazione dei dati.
- Sicurezza degli input e dei documenti esterni.
- Valutazione ripetibile della qualità dei prompt.

### Domande ancora aperte

- Il prodotto sarà generalista o partirà da un dominio specifico?
- La prima beta genererà soltanto prompt o eseguirà anche le attività?
- Gli utenti potranno allegare file?
- Sarà necessaria la registrazione?
- Le conversazioni verranno salvate?
- Quali LLM saranno supportati?
- Quali sono i costi sostenibili per richiesta?
- Quali metriche definiranno il successo della beta?
- Quali requisiti legali, privacy e sicurezza si applicano al pubblico scelto?

Queste decisioni dovranno essere esplicitate durante la fase di progettazione, distinguendo i requisiti necessari alla beta dalle evoluzioni future.

---

## 17. Bozza iniziale della definizione di prodotto

### Nome provvisorio

AI Prompt Assistant. Il nome definitivo è da scegliere.

### Descrizione breve

Un assistente conversazionale che trasforma richieste espresse in linguaggio naturale in prompt chiari, strutturati e adattati al compito, guidando l'utente attraverso domande di chiarimento quando necessario.

### Problema risolto

Gli utenti spesso non sanno come formulare istruzioni efficaci per gli LLM e faticano a ottenere risultati coerenti con il proprio obiettivo.

### Soluzione proposta

Un sistema che interpreta l'intento, organizza il contesto, identifica le informazioni mancanti e genera prompt utilizzabili, con una complessità proporzionata al compito.

### Utente iniziale ipotizzato

Professionisti e lavoratori che utilizzano già l'AI ma non hanno competenze specifiche di prompt engineering.

### Funzionalità centrali della beta

- inserimento di una richiesta libera;
- interpretazione dell'obiettivo;
- domande di chiarimento adattive;
- generazione del prompt;
- scomposizione delle attività quando utile;
- visualizzazione e modifica del prompt;
- copia del prompt;
- gestione degli errori;
- feedback essenziale.

### Criterio di successo

La beta dovrebbe dimostrare che gli utenti riescono a ottenere prompt più utilizzabili e risultati migliori o raggiungibili con meno iterazioni rispetto a un flusso di riferimento, senza introdurre un livello di complessità eccessivo.

---

## 18. Prossimi passi proposti

1. [X] Analizzare la repository e documentare lo stato attuale del progetto.
2. [X] Definire i casi d'uso prioritari per la beta.
3. [X] Distinguere requisiti indispensabili, requisiti desiderabili e funzionalità future.
4. [X] Definire il flusso utente principale e gli stati dell'interfaccia.
5. [X] Definire il comportamento del motore di interpretazione, chiarimento e generazione.
6. [X] Selezionare l'architettura e le tecnologie coerenti con il progetto esistente (proposta in `docs/product/` — decisione stack **OQ-001** ancora aperta).
7. [X] Definire requisiti non funzionali: privacy, sicurezza, affidabilità, accessibilità e costi.
8. [X] Progettare una strategia di test e valutazione della qualità.
9. [X] Creare una roadmap tecnica con dipendenze, priorità e criteri di completamento.
10. [ ] Implementare una prima beta limitata e misurabile.
11. [ ] Testare il prodotto con utenti reali.
12. [ ] Usare i risultati per decidere le funzionalità successive.

---

## 19. Direzioni strategiche da discutere

Tre possibili direzioni, non necessariamente mutuamente esclusive.

### A. Assistente universale per creare prompt

L'utente inserisce qualsiasi richiesta e riceve un prompt migliore, pronto da copiare nel proprio LLM.

**Vantaggio:** proposta semplice e ampia.

**Rischio:** differenziazione limitata rispetto alle funzionalità già disponibili negli LLM.

### B. Costruttore intelligente di workflow AI

Il software analizza l'obiettivo, lo divide in attività e sotto-attività e crea una sequenza coordinata di prompt.

**Vantaggio:** maggiore valore per compiti complessi.

**Rischio:** maggiore complessità di progettazione, validazione e utilizzo.

### C. Assistente AI orientato al lavoro

Il software aiuta a svolgere attività professionali concrete, generando istruzioni, processi e risultati riutilizzabili per uno specifico ambito.

**Vantaggio:** proposta più focalizzata e potenzialmente più facile da validare commercialmente.

**Rischio:** richiede di scegliere un segmento iniziale e potrebbe limitare temporaneamente la varietà dei casi d'uso.

### Decisione complementare: generazione o esecuzione?

- **Solo generazione:** il software prepara il prompt e l'utente lo esegue nel proprio LLM.
- **Esecuzione integrata:** il software prepara ed esegue direttamente il prompt.
- **Entrambe:** l'utente può scegliere.

Per una prima beta, partire dalla generazione e dalla copia del prompt potrebbe ridurre la complessità iniziale. La scelta definitiva deve comunque considerare la repository esistente, gli obiettivi di validazione e le aspettative degli utenti.

---

## 20. Stato del documento

Questo documento rappresenta una prima raccolta strutturata di idee e ipotesi, non una specifica funzionale definitiva.

Le sezioni su target, funzionalità, architettura, business model e metriche devono essere validate e trasformate in decisioni esplicite.

La fase successiva dovrebbe produrre:

- requisiti funzionali e non funzionali;
- casi d'uso e user journey;
- architettura proposta;
- strategia di valutazione della qualità;
- piano di test;
- roadmap di progettazione e sviluppo;
- checklist per arrivare a una prima beta verificabile.
