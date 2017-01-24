var Service, Characteristic;
var exec = require("child_process").exec;
var net = require('net');
var fs = require('fs');

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-cmd", "CMD", CmdAccessory);
}


function CmdAccessory(log, config) {
	this.log = log;

	// url info
	this.on_cmd   = config["on_cmd"];
	this.off_cmd  = config["off_cmd"];
	this.socket	  = config["UNIXSocket"];
	this.name = config["name"];
}

CmdAccessory.prototype = {

	cmdRequest: function(cmd, callback) {
		exec(cmd,function(error, stdout, stderr) {
				callback(error, stdout, stderr)
			})
	},

	setPowerState: function(powerOn, callback) {
		var cmd;

		if (powerOn) {
			cmd = this.on_cmd;
			this.log("Setting power state to on");
		} else {
			cmd = this.off_cmd;
			this.log("Setting power state to off");
		}

		this.cmdRequest(cmd, function(error, stdout, stderr) {
			if (error) {
				this.log('power function failed: %s', stderr);
				callback(error);
			} else {
				this.log('power function succeeded!');
				callback();
				this.log(stdout);
			}
		}.bind(this));
	},

	identify: function(callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "cmd Manufacturer")
			.setCharacteristic(Characteristic.Model, "cmd Model")
			.setCharacteristic(Characteristic.SerialNumber, "cmd Serial Number");

		var switchService = new Service.Switch(this.name);

		switchService
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));

		if (this.socket) {
			// open a unix socket at the given path
			var that = this;
			this.myServer = net.createServer(function(socket) {
				that.log('UNIX socket: connection to socket: ' + that.socket);
				socket.on('end', () => {
					that.log('UNIX socket: connection to socket closed: ' + that.socket);
				});
				socket.on('data', (chunk) => {
					//that.log('UNIX socket: data chunk "' + chunk + '"');
					that.log('UNIX socket: ' + that.socket + ', data: "' + parseInt(chunk)===1 + '"');
					switchService.getCharacteristic(Characteristic.On).
					  updateValue(parseInt(chunk)===1);
				});
			});
			this.myServer.on('listening', () => {
				that.log('UNIX socket: listening: ' + '/tmp/' + that.socket);
			});
			this.myServer.on('error', (e) => {
				that.log('UNIX socket: error');
				if (e.code == 'EADDRINUSE') {
					that.log('UNIX socket: was in use, freeing');
					fs.unlinkSync('/tmp/' + that.socket);
					that.myServer.listen('/tmp/' + that.socket);
				} else {
					throw(e); // re-raise
				}
			})
			myServer.listen('/tmp/'+this.socket);
		}

		return [switchService];
	}
};
