# Ygor Roadmap

## Short-term

  * Get auto-update working on Mac
    * https://github.com/atom/electron/blob/master/docs/api/auto-updater.md
    * post to stackoverflow about gulp-vinyl-zip problem: https://stackoverflow.com/questions/30521106/typeerror-when-creating-zip-file-with-gulp-vinyl-zip
    * make dmg read-only after creation to avoid breaking code signatures
  * Get auto-update working on Windows
    * There are problems, see https://github.com/atom/electron/issues/939
    * it apparently works under grunt-electron-installer, see
      * https://github.com/atom/electron/issues/1479
      * https://github.com/atom/grunt-electron-installer

  * Mac packaging
    https://github.com/atom/electron/blob/master/docs/tutorial/application-distribution.md
    * Get version to show up in Finder Command-I
    * Submit codesign functionality to electron-boilerplate
  * Windows packaging
    * codesign
    * when uninstalling, remove shortcut from Start menu
    * see if most installed files can be in a subdirectory (for neatness)

  * Get crash reporting working on Mac
  * Get crash reporting working on Windows

## Medium term

  * Get native npm (hello world) working on Mac
  * Get native npm (hello world) working on Windows
  * Write libssh2 npm unless it already exists (or is there a better native SSH library than libssh2?)

  * Decide on coffeescript versus not
  * Decide on MVC framework (React?  other?)
  * Decide on UI framework (Bootstrap?  JQuery-UI?  Other?)
  * rewrite check-for-update script properly and in JavaScript (io.js)
    * have update URL come from config file

## Long term

  * Write TurboVNC npm unless it already exists
  * Get TurboVNC fully working as demo app
  * Get high-level API working so researcher can create their own "mini-apps".
    * provide library of utilities and allow researchers to contribute to it
  * Add Stampede, Mavericks, and other XSEDE profile and support
  * Add Amazon AWS starcluster configuration profile and support

## Indefinite term

  * Mac packaging
    * Rename Ygor.app/Contents/MacOS/Electron to .../Ygor
    * Remove Ygor.app/Contents/Resources/default_app
    * other stuff from kitematic build
  * Windows packaging
    * rename electron.exe to ygor.exe
