'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var autoUpdater = require('auto-updater');
var ipc = require('ipc');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 600
});

// You have data from config/env_XXX.json file loaded here in case you need it.
// console.log(env.name);

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        show: false,
        'min-width': 600,
        'min-height': 400,
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width || 1000,
        height: mainWindowState.height || 600
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    mainWindow.loadUrl('file://' + __dirname + '/app.html');

    if (env.name === 'development') {
        devHelper.setDevMenu();
        //mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.show();
        mainWindow.focus();
        if (env.name !== 'development') {
            console.log('Setting update URL...');
            autoUpdater.setFeedUrl('https://miflux.lsa.umich.edu/cgi-bin/check-for-update?platform=' + process.platform + '&version=' + app.getVersion());
            // TODO: schedule a periodic check, say, every 4 hours
            autoUpdater.checkForUpdates();
        }

    });

    app.on('activate-with-no-open-windows', function () {
        if (mainWindow) {
            //mainWindow.show();
        }
        return false;
    });

    var updating = false;
    ipc.on('application:quit-install', function () {
        updating = true;
        autoUpdater.quitAndInstall();
    });

    app.on('before-quit', function () {
        if (!updating) {
            //mainWindow.webContents.send('application:quitting');
        }
    });

    autoUpdater.on('checking-for-update', function () {
        console.log('Checking for update...');
    });

    autoUpdater.on('update-available', function () {
        console.log('Update available.');
    });

    autoUpdater.on('update-not-available', function () {
        console.log('Update not available.');
    });

    autoUpdater.on('update-downloaded', function (e, releaseNotes, releaseName, releaseDate, updateURL, quitAndUpdate) {
        console.log('Update downloaded.');
        console.log(releaseNotes, releaseName, releaseDate, updateURL);
        //mainWindow.webContents.send('application:update-available');
        quitAndUpdate(); // TODO: remove
    });

    autoUpdater.on('error', function (e, error) {
        console.log('An error occured while checking for updates.');
        console.log(error);
    });


}); // app.on('ready')

app.on('window-all-closed', function () {
    app.quit();
    /* if (process.platform != 'darwin') {
        app.quit();
    } */
});

