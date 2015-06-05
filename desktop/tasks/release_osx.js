'use strict';

var Q = require('q');
var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var shell = require('gulp-shell');
//var zip = require('gulp-vinyl-zip');
var jetpack = require('fs-jetpack');
var asar = require('asar');
var utils = require('./utils');

var projectDir;
var releasesDir;
var tmpDir;
var finalAppDir;
var manifest;

var init = function () {
    projectDir = jetpack;
    tmpDir = projectDir.dir('./tmp', { empty: true });
    releasesDir = projectDir.dir('./releases');
    manifest = projectDir.read('app/package.json', 'json');
    finalAppDir = tmpDir.cwd(manifest.productName + '.app');

    return Q();
};

var copyRuntime = function () {
    return projectDir.copyAsync('node_modules/electron-prebuilt/dist/Electron.app', finalAppDir.path());
};

var packageBuiltApp = function () {
    var deferred = Q.defer();

    asar.createPackage(projectDir.path('build'), finalAppDir.path('Contents/Resources/app.asar'), function() {
        deferred.resolve();
    });

    return deferred.promise;
};

var finalize = function () {
    // Prepare main Info.plist
    var info = projectDir.read('resources/osx/Info.plist');
    info = utils.replace(info, {
        productName: manifest.productName,
        identifier: manifest.identifier,
        version: manifest.version
    });
    finalAppDir.write('Contents/Info.plist', info);

    // Prepare Info.plist of Helper app
    info = projectDir.read('resources/osx/helper_app/Info.plist');
    info = utils.replace(info, {
        productName: manifest.productName,
        identifier: manifest.identifier
    });
    finalAppDir.write('Contents/Frameworks/Electron Helper.app/Contents/Info.plist', info);

    // Copy icon
    projectDir.copy('resources/osx/icon.icns', finalAppDir.path('Contents/Resources/icon.icns'));

    return Q();
};

var sign = function () {
    var deferred = Q.defer();

    // To enable code signing, create a file resources/osx/sign.json
    // containing an item, identity, whose value is the UID of the Apple
    // code signing certificate stored in the Keychain that should
    // be used to sign the code.  The UID will look something like WXYZAAPQRS
    //
    // Example:
    //
    // {
    //   "identity": "WXYZAAPQRS"
    // }

    var signingInfo = projectDir.read('resources/osx/sign.json', 'json');
    if (! signingInfo) {
        gulpUtil.log('Skipping code signing (file resources/osx/sign.json does not exist)');
        return Q();
    }
    var identity = signingInfo['identity'];
    gulpUtil.log('Signing code using identity \'' + identity + '\'...');

    var frameworks = [
        'Electron Framework.framework',
        'Electron Helper EH.app',
        'Electron Helper NP.app',
        'Electron Helper.app',
        'ReactiveCocoa.framework',
        'Squirrel.framework',
        'Mantle.framework'
    ];

    var stream = gulp.src('');
    frameworks.forEach(function (f) {
        stream = stream.pipe(shell([
            'codesign --deep --force --sign <%= identity %> <%= filename %>'
            ], {
              templateData: {
                  identity: "'" + identity + "'",
                  filename: "'" + finalAppDir.path('Contents/Frameworks/' + f) + "'"
              }
            }));
    });

    stream = stream.pipe(shell([
        'codesign --force --sign <%= identity %> <%= filename %>'
        ], {
          templateData: {
              identity: "'" + identity + "'",
              filename: "'" + finalAppDir.cwd() + "'"
          }
        }));

    stream.on('finish', function() {
        gulpUtil.log('Done signing code');
        deferred.resolve();
    });

    return deferred.promise;

};

var packToZipFile = function () {
    var deferred = Q.defer();

    var zipName = manifest.name + '-' + manifest.version + '.zip';
    releasesDir.remove(zipName);

    gulpUtil.log('Packaging to .zip file...');

    // The following should work but doesn't:
    //return gulp.src('tmp/Ygor.app/**/*')
    //     .pipe(zip.dest('releases/Application.zip'));

    // Ugly hack until we can get the above to work (with symlinks being
    // stored correctly too):

    var stream = gulp.src('');
    stream = stream.pipe(shell([
        'zip -y -r <%= output %> <%= input %>'
        ], {
          quiet: true,
          cwd: tmpDir.cwd(),
          templateData: {
              output: "'" + releasesDir.path(zipName) + "'",
              input: "'" + manifest.productName + ".app'"
          }
        }));

    stream.on('finish', function() {
        gulpUtil.log('.zip file ready!', releasesDir.path(zipName));
        deferred.resolve();
    });

    return deferred.promise;

};

var packToDmgFile = function () {
    var deferred = Q.defer();

    var appdmg = require('appdmg');
    var dmgName = manifest.name + '-' + manifest.version + '.dmg';

    // Prepare appdmg config
    var dmgManifest = projectDir.read('resources/osx/appdmg.json');
    dmgManifest = utils.replace(dmgManifest, {
        productName: manifest.productName,
        appPath: finalAppDir.path(),
        dmgIcon: projectDir.path("resources/osx/dmg-icon.icns"),
        dmgBackground: projectDir.path("resources/osx/dmg-background.png")
    });
    tmpDir.write('appdmg.json', dmgManifest);

    // Delete DMG file with this name if already exists
    releasesDir.remove(dmgName);

    gulpUtil.log('Packaging to DMG file...');

    var readyDmgPath = releasesDir.path(dmgName);
    appdmg({
        source: tmpDir.path('appdmg.json'),
        target: readyDmgPath
    })
    .on('error', function (err) {
        console.error(err);
    })
    .on('finish', function () {
        gulpUtil.log('DMG file ready!', readyDmgPath);
        deferred.resolve();
    });

    return deferred.promise;
};

var cleanClutter = function () {
    return tmpDir.removeAsync('.');
};

module.exports = function () {
    return init()
    .then(copyRuntime)
    .then(packageBuiltApp)
    .then(finalize)
    .then(sign)
//    .then(packToZipFile)
//    .then(packToDmgFile)
    .then(function () { return Q.all([ packToZipFile(), packToDmgFile() ]); })
    .then(cleanClutter);
};
