# homebridge-cmd

homebridge-plugin for Your PC Command with Apple-Homekit.(by node.js child_process.exec())

# Installation

1. Install homebridge using: sudo npm install -g homebridge
2. Install this plugin using: sudo npm install -g homebridge-cmd
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration

Configuration sample:

 ```
"accessories": [
        {
            "accessory": "CMD",
            "name": "PlayStation",
            "on_cmd": "ps4-waker",
            "off_cmd": "ps4-waker standby",
            "UNIXSocket": "ps4alive"
        }
    ]

```
`UNIXSocket` is optional, it allows you to simply change the state of the switch in homebridge/HomeKit by sending 0 or 1 to the local socket with the given name in /tmp/.  
You might want to use `socat` to do so in your script, like in  
`echo 1 | socat STDIN UNIX-CONNECT:/tmp/ps4alive`
 