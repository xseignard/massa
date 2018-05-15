# CLI tool to get data from Massa sensor

Tested with http://www.massa.com/industrial/ultrasonic-sensors/pulstar/

## Install

*   Install node.js: https://nodejs.org/en/
*   Clone or download the repository: `git clone https://github.com/xseignard/massa.git` OR download https://github.com/xseignard/massa/archive/master.zip
*   cd into the folder: `cd massa`
*   Install the dependencies: `npm install`

If something goes wrong during `npm install` please check https://github.com/node-serialport/node-serialport#installation-instructions

## Usage

*   `node index -h`for the help
*   `-p` is required
*   `-i` is optional

Example:
`node index -p COM3 -i 500` will try to open the `COM3` port and request the status every 500ms.
