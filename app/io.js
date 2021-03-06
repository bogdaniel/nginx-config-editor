var fs = require('fs');
var exec = require('child_process').exec;
var location = require('./config');

module.exports = function (io) {
  io.on('connection', function (client) {
    console.log("Client connected");
    fs.readdir(location, function(err, files) {
      io.emit('list-configs', files);
    });

    client.on('show-config', function(file) {
      fs.readFile(location + '/' + file, 'utf8', function(err, data) {
        var obj = {'file': file, 'data': data};
        io.emit('show-config', obj);
      });
    });

    client.on('save-config', function (obj) {
      fs.writeFile(location + '/' + obj.file, obj.data, function (err) {
        console.log("config saved");
        fs.readdir(location, function (err, files) {
          io.emit('list-configs', files);
        });
      });
    });

    client.on('delete-config', function (file) {
      fs.unlink(location + '/' + file, function() {
        console.log("config deleted");
        fs.readdir(location, function (err, files) {
          io.emit('list-configs', files);
        });
      });
    });

    client.on('reload-nginx', function (action) {
      var command = "nginx -s reload";
      exec(command, function (err, stdout, stderr) {
        if (err) {
          io.emit('error', err.toString());
        } else {
          io.emit('reload-success', stdout);
        }
      });
    });

    client.on('restart-nginx', function (action) {
      var command = "systemctl restart nginx";
      exec(command, function (err, stdout, stderr) {
        if (err) {
          io.emit('error', err.toString());
        } else {
          io.emit('restart-success', stdout);
        }
      });
    });

    client.on('check-syntax', function (action) {
      var command = "nginx -t";
      exec(command, function (err, stdout, stderr) {
        if (err) {
          io.emit('error', err.toString());
        } else {
          io.emit('syntax-success', stdout);
        }
      });
    });
  });
}