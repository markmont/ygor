
# Building Ygor under MacOS X

The following are instructions for setting up the Ygor desktop application development environment and toolchain under MacOS X.

This has only been tested under MacOS 10.10 (Yosemite) so far.

## XCode

Install XCode from the Apple App Store, then install the command line tools:

```bash
xcode-select --install
```

## Ygor code

Get the Ygor code from GitHub.  You can put it in a different location other than `/opt`, if you like.

```bash
cd /opt
sudo mkdir ygor
sudo chown $USER ygor
git clone https://github.com/markmont/ygor.git
```

## Environment

The environment needs to be set up in each new shell you start, before doing any development on the Ygor application.  You may want to put the following commands in your `~/.bashrc` or some other file.

Set up the environment to be make sure that no Homebrew or XQuartz stuff gets built in to what we're doing, as these things won't be on the systems the app gets installed on.

```bash
unset DYLD_LIBRARY_PATH
unset LD_LIBRARY_PATH
export TOOLCHAIN=/opt/ygor/desktop/toolchain
export PATH=${TOOLCHAIN}/bin:${PATH}
```


## Set up code signing:

  * About code signing:
    https://developer.apple.com/library/mac/documentation/Security/Conceptual/CodeSigningGuide/Introduction/Introduction.html
    https://developer.apple.com/library/mac/technotes/tn2206/_index.html
  * Distributing applications outside the Mac App Store:
    https://developer.apple.com/library/mac/documentation/IDEs/Conceptual/AppDistributionGuide/DistributingApplicationsOutside/DistributingApplicationsOutside.html
  * Managing your team:
    https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/ManagingYourTeam/ManagingYourTeam.html
  * Official U-M developer licenses and code signing identities:
    http://mobileapps.umich.edu/release
    * Office of Technology Transfer contact: Jessica Soulliere <jdsoul@umich.edu>, "responsible for releasing the app through the app store itself."
    * ITS contact: Tom Amerman <tamerman@umich.edu>, "Tom manages developer licensing / distribution."

NOTE: right now, we're signing Ygor as independent developers, since apparently Developer IT certificates are not available under the U-M Enterprise Agreement with Apple.

```bash
mkdir ~/ygor-signing-identity
```

  * Start XCode
  * Go to XCode -> Preferences -> Accounts
    * Add Apple ID account

  * File -> New -> Project -> OS X -> Application -> Cocoa Application -> Next
    Note: using OS X -> Other -> External Build System below does not give us the necessary options.
    * Product name: Ygor
    * Organization name: University of Michigan
    * Organization identifier: edu.umich
    * Language: Objective C
    * UNCHECK "Use Storyboards"
    * Click Next
    * UNCHECK "Source Control"
    * When saving...
      * Navigate to `~/ygor-signing-identity`
      * Create

  * General -> Identity
    * Signing: Developer ID
    * Team: None
    * IGNORE any "Fix issue" button

  * Go to XCode -> Preferences -> Accounts
    * Select the account, click on the name in the right pane, click View Details
    * Click Refresh button in lower left
    * Uncheck all but the two Developer ID checkboxes
    * Click Request
    * Two signing identities should appear
    * Select Developer ID Application signing identity
    * Click gear icon -> Export
    * save file as `~/ygor-signing-identity/ygor-signing-identity` and protect it with a passphrase
      * DO NOT save the exported identity under the Ygor code directory, it must not wind up in git

Run the following commands:

```bash
openssl pkcs12 -in ygor-signing-identity.p12 -out ygor-signing-identity.pem -clcerts -nokeys
openssl x509 -in ygor-signing-identity.pem -noout -text
openssl x509 -in ygor-signing-identity.pem -noout -text | perl -n -e '/UID=([^,]+)/ && print "{ \"identity\": \"$1\" }\n";' > sign.json
cat sign.json
chmod 600 ygor-signing-identity* sign.json
cd /opt/ygor/desktop/resources/osx
rm -f sign.json
ln -s ~/ygor-signing-identity/sign.json
```

  * In the XCode project, go to Build Settings -> Code Signing
    * For Code Signing Identity, select the Developer ID Application (not Installer) identity.


## Install io.js

The build instructions for Electron say that it requires Node.js, but the prebuilt Electron releases from Github are actually currently using io.js.

Determine the version of io.js to install by looking at
https://github.com/atom/node/blob/atom-iojs/src/node_version.h

Currently, we're using a prebuilt release of io.js, but will switch to compiling from source if/when there is an advantage to doing so.

```bash
cd ${TOOLCHAIN}/src
wget https://iojs.org/dist/v2.2.1/iojs-v2.2.1-darwin-x64.tar.gz
cd ..
tar zxf src/iojs-v2.2.1-darwin-x64.tar.gz
cp -a iojs-v2.2.1-darwin-x64/{bin,include,lib,share} .
rm -rf iojs-v2.2.1-darwin-x64
```


## Install Electron

Refer to the the [Electon Mac build instructions](https://github.com/atom/electron/blob/master/docs/development/build-instructions-mac.md)

Here are the commands to build Electron from source.  We're currently not doing this.
```bash
cd /opt/ygor/desktop/toolchain/src
#git clone https://github.com/atom/electron.git
#cd electron
#./script/bootstrap.py -v 2>&1 | tee log.bootstrap
#./script/build.py 2>&1 | tee log.build
#./script/test.py 2>&1 | tee log.test   # wait for it to reach 100%, then press Command-Q
```

Instead, we're currently using [electron-boilerplate](https://github.com/szwacz/electron-boilerplate):

```bash
cd /opt/ygor/desktop/toolchain/src
git clone https://github.com/markmont/electron-boilerplate.git
```


# Building the Ygor application

To clean everything:

```bash
cd /opt/ygor/desktop
rm -rf node_modules app/node_modules build/* releases/* tmp
```

To install dependencies after cloning or cleaning:

```bash
cd /opt/ygor/desktop
npm install
```

To run the unpackaged application when doing development:

```bash
cd /opt/ygor/desktop
npm start
```

## Packaging the Ygor application

```bash
cd /opt/ygor/desktop
npm run release
ls -l releases

scp releases/Ygor-*.zip schrodingers.lsa.umich.edu:.
```

This will produce a `.dmg` file in the `releases/` directory which should be distruted to users who want to install Ygor.

It will also produce a `.zip` file in the `releases/` directory.  The `.zip` file is used by the auto-updater and should be uploaded to `schrodingers.lsa.umich.edu:/var/www/miflux.lsa.umich.edu/html-ssl/mac/updates/`.  Be sure to set the SELinux context correctly after uploading so that the web server can read the file:

```bash
# On schrodingers.lsa.umich.edu:
cd /var/www/miflux.lsa.umich.edu/html-ssl/mac/updates
mv ~/Ygor-*.zip .
chcon -t httpd_sys_content_t Ygor-*
```

Note that the auto-updater depends on a CGI script, `update-server/check-for-update`.  This is installed at `/var/www/miflux.lsa.umich.edu/cgi-bin-ssl/check-for-update`.
