'use strict';

const Processor = function(path, folder, filename, code, configuration) {
  this.path = path;
  this.folder = folder;
  this.filename = filename;
  this.code = code;
  this.configuration = configuration;
}

Processor.prototype.update = function(success) {
  const processor = this;
  this.prepare(function() {
    processor.execute(success);
  });
}

Processor.prototype.prepare = function(success) {
  const exec = require('child_process').exec;
  const fs = require('fs');
  const path = require('path');
  const processor = this;

  const work_dir = path.join(this.path, this.folder);
  const cmd = ['mkdir', work_dir, '&&', 'chmod', '777', work_dir];
  exec(cmd.join(' '), function(error) {
    if (error) {
      console.log(error);
    } else {
      fs.writeFile(path.join(processor.path, processor.folder, processor.filename), processor.code, function(error) {
        if (error) {
          console.log(error);
        } else {
          fs.writeFile(path.join(processor.path, processor.folder, 'swiftfmt.json'), processor.configuration, function(error) {
            if (error) {
              console.log(error);
            } else {
              success();
            }
          });
        }
      });
    }
  });
}

Processor.prototype.execute = function(success) {
  const exec = require('child_process').exec;
  const fs = require('fs');
  const path = require('path');
  const processor = this;
  const swiftFile = path.join(processor.path, processor.folder, processor.filename)
  const configFile = path.join(processor.path, processor.folder, 'swiftfmt.json')

  const cmd = ['bin/swiftfmt', swiftFile, '--configuration', configFile];
  exec(cmd.join(' '), function(error) {
    fs.readFile(swiftFile, 'utf8', function(error, data) {
      success(data, '');
      exec("rm -r " + path.join(processor.path, processor.folder));
    });
  });
}

module.exports = Processor;
