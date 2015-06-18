'use strict';

var Q = require('q');
var app = require('app');
var childProcess = require('child_process');
var jetpack = require('fs-jetpack');
var path = require('path');

var appDir = jetpack.cwd(path.resolve(process.execPath, '..'));
var updateDotExe = appDir.path('..', 'Update.exe');

var runUpdate = function (args) {
    var deferred = Q.defer();

    console.log("Running Update.exe ", args.join(" "));

    var update = childProcess.spawn(updateDotExe, args, { cwd: appDir } );

    update.on('stdout', function(data) {
        console.log('Update.exe: ' + data);
    });
    update.on('stderr', function(data) {
        console.log('Update.exe: ' + data);
    });
    update.on('error', function (code) {
        console.log('Failed to run Update.exe');
        deferred.reject();
    });
    update.on('close', function (code) {
        if (code != 0) {
            console.log('Update.exe exited with status ' + code);
	    deferred.reject();
	    return;
	}
        console.log('Update.exe completed');
        deferred.resolve();
    });

    return deferred.promise;

};

var checkForUpdate = function () {
    if (!jetpack.exists(updateDotExe)) {
        return;
    }
    console.log("Checking for updates...");
    runUpdate(['--update', 'https://ygor.lsa.umich.edu/win32/updates'])
        .done();
    return;
};

module.exports.handleStartupEvent = function () {

    if (process.platform !== 'win32') {
        return false;
    }
    console.log("Will look for Update.exe at " + updateDotExe);

    var squirrelCommand = process.argv[1];
    console.log("squirrelCommand is " + squirrelCommand);
    switch (squirrelCommand) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Do things such as:
            // - Install desktop and start menu shortcuts
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus
            runUpdate(['--createShortcut', path.basename(process.execPath)]).done();
            app.quit();
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers
            runUpdate(['--removeShortcut', path.basename(process.execPath)]).done();
            app.quit();
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before 
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;

        }

    //setInterval(checkForUpdate, 1000 * 60 * 60 * 4);
    //checkForUpdate();
    return;

};

