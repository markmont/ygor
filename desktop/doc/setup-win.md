
# Building Ygor under Microsoft WIndows

## VM details

  * Windows 7 64-bit
  * 2 cores
  * 4 GB RAM
  * 100 GB disk (note: 80 GB was looking a bit tight when doing an earlier project)

Install VMWare tools.


## Install Internet Explorer 11

Internet Explorer 11 is needed for Microsoft Visual Studio.  (The LSA build of Windows 7 we're using comes only with IE 8).

http://windows.microsoft.com/en-US/internet-explorer/download-ie


## Install Microsoft Visual Studio

Notes:

  * Having multiple versions of Visual Studio installed will [prevent Electron from building](https://github.com/atom/electron/issues/1140).
  * gyp needs to support each version of Visual Studio.  Support for Visual Studio 2015 was not added to gyp until io.js 1.6.4, but we're using 1.6.3.

### Install Microsoft Visual Studio 2013 Community Edition

https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx

  * Download and install Visual Studio 2013 Community
    * accept all installer defaults

  * Important, be sure to do this after the installer finishes:
    * Start Menu -> Microsoft Visual Studio
    * Let it initialize
    * Quit


## Install NSIS 3

Notes:

  * version 3.x is required, version 2.x will not work.
  * the installer is not signed (unverified publisher)

Download and install from

  * http://nsis.sourceforge.net/Main_Page
  * Accept all defaults.

Start a `cmd` shell and run:

```batchfile
setx PATH "%PATH%;C:\Program Files (x86)\NSIS"
```


## Install Python 2.7

Download and run the Windows 64-bit installer from

https://www.python.org/download/releases/2.7/

  * Make sure it is the Windows x86-64 MSI Installer, not the Windows x86 one.
  * Accept all defaults, including installing for all users.

Start a `cmd` shell and run

```batchfile
setx PATH "%PATH%;C:\Python27"
```

Quit the `cmd` shell, start a new `cmd` shell, and verify that Python is runnable:

```batchfile
python -V
```


## Install git

git also includes bash, curl, and other useful tools

http://git-scm.com/download/win

Note that the installer is unsigned (unverfied publisher).

When running the install wizard, accept all defaults EXCEPT:

  * modifying PATH: choose "Use Git from Windows Command Prompt"

Open a new `cmd` shell and run the following, substituting your own name and email address:

```batchfile
git config --global user.name "John Doe"
git config --global user.email johndoe@example.com
git config --list
```


## Install io.js

The build instructions for Electron say that it requires Node.js, but the prebuilt Electron releases are actually currently using io.js.

Determine the version of io.js to install by looking at
https://github.com/atom/node/blob/atom-iojs/src/node_version.h

Currently, we're using a prebuilt release of io.js, but will switch to compiling from source if/when there is an advantage to doing so.

Download and run the installer from
https://iojs.org/dist/v1.6.3/iojs-v1.6.3-x64.msi

  * make sure it is the "-x64" installer, not the "-x86" one.


Accept all installer defaults.

Open a `cmd` shell and test:

```batchfile
npm help
```

[Work around a problem compiling native NPMs](https://stackoverflow.com/questions/14278417/cannot-install-node-modules-that-require-compilation-on-windows-7-x64-vs2012):

```batchfile
npm config set python C:\Python27\python.exe --global
npm config set msvs_version 2013 --global
```


## Install Electron

If you have not rebooted since installing the dependencies above, reboot now.

We're going to be using a prebuilt version of Electron, but let's make sure we can build it from source, too; this will be a good test of our development environment to make sure everything is working properly.

Follow the instructions at

https://github.com/atom/electron/blob/master/docs/development/build-instructions-windows.md

Open a PowerShell (not `cmd`, not `command`, not Git `bash`) window:

```powershell
cd $HOME
mkdir electron-build-test
cd electron-build-test
git clone https://github.com/atom/electron.git
cd electron
python script\bootstrap.py -v --target_arch=x64
python script\build.py
python script\test.py -R
```

Note if you run the test without -R ("release") three "runas" tests will fail -- the reason is unknown.  The following describes a similar error for a different native rpm:
https://github.com/atom/electron/issues/1140


## Building the Ygor application

```powershell
cd $HOME
git clone https://github.com/markmont/ygor.git
```

To install dependencies after cloning or cleaning:

```bash
cd $HOME\ygor\desktop
npm install
```

To run the unpackaged application when doing development:

```powershell
cd $HOME\ygor\desktop
npm start
```

## Packaging the Ygor application

```powershell
cd $HOME\ygor\desktop
npm run release
```

