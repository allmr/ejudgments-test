const { app, BrowserWindow, globalShortcut } = require("electron");
const { Menu, MenuItem } = require("electron");
const { ipcMain } = require("electron");
const remote = require("electron").remote;

const menu = new Menu();
const path = require("path");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let splash;
function createWindow() {
  const mode = process.env.NODE_ENV;
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    skipTaskbar: true,
  });

  Menu.setApplicationMenu(null);
  mainWindow.maximize();
  mainWindow.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  createWindow();

  // splash = new BrowserWindow({
  //     minWidth: 400,
  //     minHeight: 280,
  //     width: 500,
  //     height: 280,
  //     center:true,
  //     backgroundColor: '#e0eff8',
  //     webPreferences: {
  //       nodeIntegration: true,
  //       webSecurity: false
  //     },
  //     frame: false,
  //     skipTaskbar: true,
  //     resizable: false,
  //     alwaysOnTop: true,
  // });

  // splash.maximize()
  // splash.loadURL(`file://${path.join(__dirname, '../public/splash.html')}`);

  // ipcMain.on('showMainWindow',()=>{
  //     splash.destroy();
  //     mainWindow.maximize();
  // });

  globalShortcut.register("CommandOrControl+F", () => {
    console.log("search");
    mainWindow.webContents.send("on-find");
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
