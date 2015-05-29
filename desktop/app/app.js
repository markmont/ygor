
// Browser modules are imported through new ES6 syntax.
//import { greet } from './hello_world/hello_world';

var $ = require('jquery');
require('jquery-ui');
var packageJson = require('./package.json');
var remote = require('remote');

var SSHClient = require('ssh2').Client;

var username = '';
var clusterSession = new SSHClient();
var clusterSessionConnected = false;

var authCallback = undefined;

// window.env contains data from config/env_XXX.json file.
//var envName = window.env.name;


clusterSession.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish) {
    console.log('keyboard-interactive: name=' + name + ' instructions=' + instructions + ' instructionsLang=' + instructionsLang + ' prompts=' + JSON.stringify(prompts) + "\n");
    // TODO: prompt for ALL things in prompts, not just first one
    //   var answers = [];
    //   prompts.map(function(prompt) {
    //     answers.push(readlineSync.question(prompt.prompt))
    //   });
    // TODO: honor 'echo' value for each prompt
    authCallback = finish;
    var d = $( '#dialog' );
    d.dialog( 'option', 'title', prompts[0].prompt );
    d.dialog( 'open' );
});

clusterSession.on('banner', function(message, language) {
    $('#debug-output').append('Server banner: ' + message + "\n");
});

clusterSession.on('ready', function() {
    console.log('Client :: ready');
    clusterSessionConnected = true;
    $('#login-button').html("Disconnect\n");
    $('#debug-output').append("Connected to cluster\n");
});

clusterSession.on('end', function() {
    console.log('Client :: end');
    clusterSessionConnected = false;
    $('#login-button').html("Connect\n");
    $('#debug-output').append("Connection to cluster ended (socket disconnected)\n");
});

clusterSession.on('close', function(hadError) {
    console.log('Client :: close');
    clusterSessionConnected = false;
    $('#login-button').html("Connect\n");
    if (hadError) {
        $('#debug-output').append("Connection to cluster closed (with error)\n");
    } else {
        $('#debug-output').append("Connection to cluster closed (no error)\n");
    }
});

function clusterCommand(command) {
    clusterSession.exec(command, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        }).on('data', function(data) {
            console.log('STDOUT: ' + data);
            $('#debug-output').append('STDOUT: ' + data + "\n");
        }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
            $('#debug-output').append('STDERR: ' + data + "\n");
        });
    });
};

function sshDebug(s) {
    console.log(s);
};

$(document).ready(function() {

    $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        buttons: [ {
            text: 'Submit',
            icons: { primary: 'ui-icon-person' },
            click: function() {
                var response = $('#dialog-response').val();
                $('#dialog-response').val('');  // nuke the value
                $('#debug-output').append( "got dialog response\n" );
                $(this).dialog("close");
                authCallback( [response] );
                response = undefined;  // nuke the value
            }
        } ]
    });

    $('#login-button').on('click', function() {
        if (clusterSessionConnected) {
            clusterSession.end();
        } else {
            username = $('#login-username').val();
            $('#debug-output').append( "logging in as " + username + "\n" );
            clusterSession.connect({
                host: 'flux-build.engin.umich.edu',
                tryKeyboard: true,
                keepaliveInterval: 60000,
                username: username,
                debug: sshDebug
            });
        }
    });

    $('#command1-button').on('click', function() {
        clusterCommand('ls -l');
    });

    $('#command2-button').on('click', function() {
        clusterCommand('who');
    });

    $('#ygor-version').text(packageJson.version);
    $('#login-username').val(process.env['USER']);

    // F12 toggles dev tools, F5 reloads
    if ( window.env.name == 'development' ) {
        $(document).keydown(function (e) {
            if (e.which === 123) {
                remote.getCurrentWindow().toggleDevTools();
            } else if (e.which === 116) {
                location.reload();
            }
        });
    }

}); // $(document).ready()
