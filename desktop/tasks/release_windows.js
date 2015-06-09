'use strict';

var Q = require('q');
var gulpUtil = require('gulp-util');
var childProcess = require('child_process');
var jetpack = require('fs-jetpack');
var asar = require('asar');
var utils = require('./utils');

var projectDir;
var tmpDir;
var releasesDir;
var readyAppDir;
var manifest;
var finalPackageName;
var signingInfo;

var init = function () {
    projectDir = jetpack;
    tmpDir = projectDir.dir('./tmp', { empty: true });
    releasesDir = projectDir.dir('./releases');
    manifest = projectDir.read('app/package.json', 'json');
    readyAppDir = tmpDir.cwd(manifest.name);

    return Q();
};

var copyRuntime = function () {
    return projectDir.copyAsync('node_modules/electron-prebuilt/dist', readyAppDir.path(), { overwrite: true });
};

var packageBuiltApp = function () {
    var deferred = Q.defer();

    asar.createPackage(projectDir.path('build'), readyAppDir.path('resources/app.asar'), function() {
        deferred.resolve();
    });

    return deferred.promise;
};

var finalize = function () {
    var deferred = Q.defer();

    projectDir.copy('resources/windows/icon.ico', readyAppDir.path('icon.ico'));

    // Replace Electron icon for your own.
    var rcedit = require('rcedit');
    rcedit(readyAppDir.path('electron.exe'), {
        icon: projectDir.path('resources/windows/icon.ico')
    }, function (err) {
        if (!err) {
            deferred.resolve();
        }
    });

    return deferred.promise;
};

var sign = function (filename) {
    var deferred = Q.defer();
    gulpUtil.log('Signing ' + filename + ' ...');

    var signtool = childProcess.spawn( signingInfo['signtool'],
	[ "sign", "/f", signingInfo['certificate'],
	    "/p", signingInfo['password'],
	    "/t", signingInfo['timestampService'],
	    filename ],
	{ stdio: 'inherit' }
    );

    signtool.on('close', function () {
        gulpUtil.log('File signed!', filename);
        deferred.resolve();
    });

    return deferred.promise;

};

var signCode = function () {

    // To enable code signing, copy the file resources/osx/sign.example
    // to resources/osx/sign.json and edit it to fill in the correct
    // values for your development environment.

    signingInfo = projectDir.read('resources/windows/sign.json', 'json');
    if (! signingInfo) {
        gulpUtil.log('Skipping code signing (file resources/windows/sign.json does not exist)');
        return Q();
    }
    gulpUtil.log('Signing code using certificate ' + signingInfo['certificate'] + ' ...');

    var filesToSign = jetpack.find(readyAppDir.cwd(),
        { matching: [ '*.exe', '*.dll' ] });

    var promise = Q();
    filesToSign.forEach(function (f) {
        promise = promise.then( function() { return sign(f); } );
    });
    return promise;

};

var createInstaller = function () {
    var deferred = Q.defer();

    finalPackageName = manifest.name + '-' + manifest.version + '.exe';

    var signCmd = "echo Not signing the uninstaller";
    if (signingInfo) {
        signCmd = "$\\\"" + signingInfo['signtool']
	    + "$\\\" sign /f $\\\"" + signingInfo['certificate']
	    + "$\\\" /p $\\\"" + signingInfo['password']
	    + "$\\\" /t $\\\"" + signingInfo['timestampService']
	    + "$\\\"";
    }
    gulpUtil.log('uninstaller sign: ' + signCmd);

    var installScript = projectDir.read('resources/windows/installer.nsi');
    installScript = utils.replace(installScript, {
        name: manifest.name,
        productName: manifest.productName,
        version: manifest.version,
        src: readyAppDir.path(),
        dest: releasesDir.path(finalPackageName),
        icon: readyAppDir.path('icon.ico'),
        setupIcon: projectDir.path('resources/windows/setup-icon.ico'),
        banner: projectDir.path('resources/windows/setup-banner.bmp'),
        tmpDir: tmpDir.path(),
	signCmd: signCmd,
    });
    tmpDir.write('installer.nsi', installScript);

    gulpUtil.log('Building installer with NSIS...');

    // Remove destination file if already exists.
    releasesDir.remove(finalPackageName);

    // Note: NSIS have to be added to PATH (environment variables).
    var nsis = childProcess.spawn('makensis', [
        tmpDir.path('installer.nsi')
    ], {
        stdio: 'inherit'
    });
    nsis.on('close', function () {
        gulpUtil.log('Installer ready!', releasesDir.path(finalPackageName));
        deferred.resolve();
    });

    return deferred.promise;
};

var signInstaller = function () {
    if (!signingInfo) {
        return Q();
    }
    return sign(releasesDir.path(finalPackageName));
};

var cleanClutter = function () {
    return tmpDir.removeAsync('.');
};

module.exports = function () {
    return init()
    .then(copyRuntime)
    .then(packageBuiltApp)
    .then(finalize)
    .then(signCode)
    .then(createInstaller)
    .then(signInstaller)
    .then(cleanClutter);
};
