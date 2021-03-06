# Ygor Roadmap

## Short-term

  * Get auto-update working on Mac
    * https://github.com/atom/electron/blob/master/docs/api/auto-updater.md
    * post to stackoverflow about gulp-vinyl-zip problem: https://stackoverflow.com/questions/30521106/typeerror-when-creating-zip-file-with-gulp-vinyl-zip
  * Get auto-update working on Windows
    * add periodic auto-update check
    * Investigate: AppData/Local/Ygor/app-0.1.2 is not being removed on uninstall
    * https://github.com/atom/electron/issues/939
    * https://github.com/atom/electron/issues/1008
    * https://github.com/atom/electron/issues/1479
    * https://github.com/Squirrel/Squirrel.Windows/
    * https://github.com/atom/grunt-electron-installer
    * https://github.com/nuget/home
    * https://docs.nuget.org/create/nuspec-reference

    * Atom
      * https://github.com/atom/atom
      * Shortcut target: C:\Users\markmont\AppData\Local\atom\update.exe --processStart atom.exe
      * Start in: C:\Users\markmont\AppData\Local\atom\..\atom\app-0.207.0

  * Mac packaging
    https://github.com/atom/electron/blob/master/docs/tutorial/application-distribution.md
    * Submit codesign functionality to electron-boilerplate
    * Submit auto-update functionality to electron-boilerplate
  * Windows packaging
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

