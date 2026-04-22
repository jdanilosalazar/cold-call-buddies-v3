const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function getDataPath() {
  return path.join(app.getPath('userData'), 'data.json');
}

function loadData() {
  try {
    const p = getDataPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {}
  return { quota: 20, history: [] };
}

function saveData(data) {
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2));
}

function createWindow() {
  win = new BrowserWindow({
    width: 220,
    height: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

ipcMain.handle('load-data', () => loadData());

ipcMain.handle('save-data', (_, data) => {
  saveData(data);
});

ipcMain.handle('notify', (_, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('set-height', (_, height) => {
  const [w] = win.getSize();
  win.setSize(w, height, true);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(createWindow);
