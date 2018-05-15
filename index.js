const program = require('commander');
const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');

program
	.version('0.0.1')
	.option('-p, --port <required>', 'Serial port of the sensor')
	.option('-i, --interval [optional]', 'Measurement interval (in ms), defaults to 1000ms')
	.parse(process.argv);

const port = new SerialPort(program.port, {
	baudRate: 19200,
});
const parser = port.pipe(new ByteLength({ length: 6 }));
port.on('open', () => {
	const arr = new Uint8Array(6);
	arr[0] = 170;
	arr[1] = 1;
	arr[2] = 3;
	arr[3] = 0;
	arr[4] = 0;
	arr[5] = (arr[0] + arr[1] + arr[2] + arr[3] + arr[4]) % 256;

	const buf = Buffer.from(arr.buffer);
	port.write(buf);
	setInterval(() => {
		port.write(buf);
	}, program.interval || 1000);
});
parser.on('data', data => {
	console.log('=====================');
	const sum =
		data.slice(0, 5).reduce((accumulator, currentValue) => accumulator + currentValue) % 256;
	if (data[5] === sum) {
		// sensor ID (byte 0)
		console.log(`Sensor ID: ${data[0]}`);
		// response code (byte 1)
		const responseCode = data[1]
			.toString(2)
			.split('')
			.reverse()
			.map(i => parseInt(i, 10));
		console.log(`Response code: ${responseCode}`);
		// error (bit 0)
		console.log(`Error: ${responseCode[0] === 0 ? 'No error' : 'Error'}`);
		// mode (bit 2)
		const mode = responseCode[2];
		console.log(`VOut operating mode: ${mode === 0 ? 'Linear' : 'Switch'}`);
		// mode opertation (bit 1)
		let modeOperation = '0 Vout';
		if (mode === 0) modeOperation = 'Linear';
		else if (responseCode[1] === 1) modeOperation = '10 Vout';
		console.log(`Mode operation: ${modeOperation}`);
		// target detected (bit 3)
		const detection = responseCode[3] === 1;
		console.log(`Detection: ${detection ? 'Yes' : 'No'}`);
		if (detection) {
			// detection strength (bits 4 to 7)
			const code = parseInt(responseCode.slice(4).join(''), 2);
			const strength = code * 25;
			console.log(`Target strength: ${strength}%`);
			// range to target (bytes 2 and 3)
			const lsb = data[2];
			const msb = data[3];
			const inches = ((msb << 8) + lsb) / 128;
			const cm = inches / 0.3937;
			console.log(`Range to target: ${cm.toFixed(2)}cm, ${inches.toFixed(2)}in`);
		}
		// temperature (byte 4)
		console.log(`Temp: ${(data[4] * 0.58651 - 50).toFixed(2)}°C`);
	} else {
		console.log('Checksum failed!!');
	}
});
