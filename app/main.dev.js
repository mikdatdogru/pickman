/* eslint global-require: off */

import electron, { app, clipboard, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import MenuBuilder from './utils/menu';
import tray from './utils/tray';
import config, { installExtensions } from './config';
import {
  onActivate,
  onBeforeQuit,
  onWillQuit,
  initShortcuts,
  onBlur,
  onClose,
  onClosed,
  onDidFinishLoad,
  onWindowAllClosed,
  initClipboard
} from './helpers';
import receiver from './helpers/receiver';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
let robot = require('robotjs');

let mainWindow = null;
let trayBuilder = null;
config();

/**
 * Add event listeners...
 */

app.dock.hide();

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    frame: true,
    width: 200,
    height: 300
    // titleBarStyle: 'hiddenInset'
    // titleBarStyle: 'hiddenInset'
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    onDidFinishLoad(mainWindow);
  });

  app.on('activate', () => onActivate(mainWindow));
  mainWindow.on('blur', () => onBlur(mainWindow));

  app.on('before-quit', () => onBeforeQuit());
  mainWindow.on('close', event => onClose(mainWindow, event));
  app.on('will-quit', () => onWillQuit());
  mainWindow.on('closed', () => onClosed(mainWindow));

  initShortcuts(mainWindow);
  initClipboard(mainWindow);
  receiver(data => {
    console.log(data.data);
    mainWindow.hide();
    app.hide();
    // robot.typeString(data.data);
    // todo base64 convert etmek lazim
    clipboard.write({ text: data.data });

    setTimeout(() => {
      robot.keyToggle('v', 'down', 'command');
      setTimeout(() => {
        robot.keyToggle('v', 'up', 'command');
      }, 100);
    }, 200);
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // eslint-disable-next-line new-cap
  trayBuilder = new tray();
  trayBuilder.buildTray();
  console.log(process.env.ALWAYS_SHOW);
  if (process.env.ALWAYS_SHOW) {
    mainWindow.show();
    mainWindow.focus();
  }

  // eslint-disable-next-line
  new AppUpdater();
});

app.on('window-all-closed', () => onWindowAllClosed());
