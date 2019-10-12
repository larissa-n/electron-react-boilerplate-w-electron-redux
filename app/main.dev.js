/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { configureStore } from './shared/store/configureStore';
import { increment, decrement } from './shared/actions/counter';

const store = configureStore(undefined, 'main');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let window1 = null;
let window2 = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  window1 = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  window2 = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  window1.loadURL(`file://${__dirname}/window1/app.html`);
  window2.loadURL(`file://${__dirname}/window2/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  window1.webContents.on('did-finish-load', () => {
    if (!window1) {
      throw new Error('"window1" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window1.minimize();
    } else {
      window1.show();
      window1.focus();
    }
  });

  window2.webContents.on('did-finish-load', () => {
    if (!window2) {
      throw new Error('"window2" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window2.minimize();
    } else {
      window2.show();
      window2.focus();
    }
  });

  window1.on('closed', () => {
    window1 = null;
  });

  window2.on('closed', () => {
    window2 = null;
  });

  const menuBuilder1 = new MenuBuilder(window1);
  const menuBuilder2 = new MenuBuilder(window2);
  menuBuilder1.buildMenu();
  menuBuilder2.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

// electron-redux demonstration, sending actions from the main process, updating the store
// pretty useless example, as an IPC call from the renderer triggers this, but it should
// serve as a demonstration that the functionality works
ipcMain.on('store', (event, message) => {
  switch (message) {
    case 'increment': {
      store.dispatch(increment());
      break;
    }
    case 'decrement': {
      store.dispatch(decrement());
      break;
    }
    default: {
      break;
    }
  }
});
