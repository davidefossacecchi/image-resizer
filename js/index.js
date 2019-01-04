const {app, BrowserWindow} = require('electron')
const path = require('path');

// Mantiene un riferimento globale all'oggetto window, se non lo fai, la finestra sarà
// chiusa automaticamente quando l'oggetto JavaScript sarà garbage collected.
let win

function createWindow() {
    // Creazione della finestra del browser.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, '../img/icon64.png')
    })
    
    //win.webContents.openDevTools()
    

    // e viene caricato il file index.html della nostra app.
    win.loadFile('index.html')

    // Emesso quando la finestra viene chiusa.
    win.on('closed', () => {
        // Eliminiamo il riferimento dell'oggetto window;  solitamente si tiene traccia delle finestre
        // in array se l'applicazione supporta più finestre, questo è il momento in cui 
        // si dovrebbe eliminare l'elemento corrispondente.
        win = null
    })
    
    
}

// Questo metodo viene chiamato quando Electron ha finito
// l'inizializzazione ed è pronto a creare le finestre browser.
// Alcune API possono essere utilizzate solo dopo che si verifica questo evento.
app.on('ready', createWindow)

// Terminiamo l'App quando tutte le finestre vengono chiuse.
app.on('window-all-closed', () => {
    // Su macOS è comune che l'applicazione e la barra menù 
    // restano attive finché l'utente non esce espressamente tramite i tasti Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // Su macOS è comune ri-creare la finestra dell'app quando
    // viene cliccata l'icona sul dock e non ci sono altre finestre aperte.
    if (win === null) {
        createWindow()
    }
})
