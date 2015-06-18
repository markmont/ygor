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
var nugetPackageName;
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

    projectDir.copy('resources/windows/squirrel/Update.exe', readyAppDir.path('Update.exe'));
    readyAppDir.rename('electron.exe', manifest.name + '.exe');

    // TODO: should nuget do this for us?
    // Replace Electron icon for your own.
    var rcedit = require('rcedit');
    rcedit(readyAppDir.path(manifest.name + '.exe'), {
        'icon': projectDir.path('resources/windows/icon.ico'),
        'version-string': {
            'ProductName': manifest.productName,
            //'FileDescription': manifest.description,
            'FileDescription': manifest.productName, // used for Mac menu name in VMWare Fusion's Unity mode
        }
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

    nugetPackageName = manifest.name + '.' + manifest.version + '.nupkg';

    var nuspec = projectDir.read('resources/windows/template.nuspec');
    nuspec = utils.replace(nuspec, {
        name: manifest.name,
	title: manifest.productName ? manifest.productName : manifest.name,
        version: manifest.version.replace(/-.*$/, ''),
	authors: manifest.author ? manifest.author : '',
        setupIcon: 'file://' + projectDir.path('resources/windows/setup-icon.ico'),
	description: manifest.description ? manifest.description : '',
	exe: manifest.name + '.exe',
    });
    var nuspecFile = manifest.name + '.nuspec';
    tmpDir.write(nuspecFile, nuspec);

    gulpUtil.log('Building installer with Nuget...');

    // Remove destination file if already exists.
    releasesDir.remove(nugetPackageName);

    var nuget = childProcess.spawn(
        projectDir.path('resources/windows/squirrel/nuget.exe'), [
          'pack', tmpDir.path(nuspecFile),
          '-BasePath', readyAppDir.cwd(),
          '-OutputDirectory', tmpDir.cwd(),
          '-NoDefaultExcludes'
    ], {
        stdio: 'inherit'
    });
    nuget.on('close', function () {
        gulpUtil.log('Nuget done!', nugetPackageName);
        deferred.resolve();
    });

    return deferred.promise;
};

var updateInstaller = function () {
    var deferred = Q.defer();

    gulpUtil.log('Updating installer...');

    var update = childProcess.spawn(
        projectDir.path('resources/windows/squirrel/Update.com'), [
          '--releasify', tmpDir.path(nugetPackageName),
          '--releaseDir', releasesDir.cwd(),
          '--loadingGif', projectDir.path('resources/windows/install-spinner.gif'),
          '--setupIcon', projectDir.path('resources/windows/setup-icon.ico'),
    ], {
        stdio: 'inherit'
    });
    update.on('close', function () {
        gulpUtil.log('update done!');
        deferred.resolve();
    });


    return deferred.promise;
};

var signInstaller = function () {
    var finalPackageName = manifest.name + '-' + manifest.version
        + '-' + 'Setup.exe';
    releasesDir.rename('Setup.exe', finalPackageName);
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
    // TODO: run SyncReleases.exe -u $URL -r releasesDir.cwd()
    .then(updateInstaller)
    .then(signInstaller)
    .then(cleanClutter);
};
