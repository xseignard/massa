#define DEBUG 1

void setup() {
	Serial.begin(9600);
	Serial2.begin(19200);
}

void loop() {
	requestStatus();
	getStatus();
	delay(500);
}

void requestStatus() {
	byte arr[6];
	arr[0] = 170;
	arr[1] = 1;
	arr[2] = 3;
	arr[3] = 0;
	arr[4] = 0;
	arr[5] = (arr[0] + arr[1] + arr[2] + arr[3] + arr[4]) % 256;
	Serial2.write(arr, 6);
}

void getStatus() {
	int status[6];
	int i = 0;
	while (Serial2.available() > 0 && i < 6) {
		status[i] = Serial2.read();
		i++;
	}
	i = 0;
	int sensorID = status[0];
	int detection = bitRead(status[1], 3);
	int error = bitRead(status[1], 0);
	float temp = status[4] * 0.58651 - 50;
	if (DEBUG) {
		Serial.println("=====================");
		Serial.print("Sensor ID: ");
		Serial.println(sensorID);
		Serial.print("Error: ");
		Serial.println(error);
		Serial.print("Detection: ");
		Serial.println(detection);
		Serial.print("Temperature: ");
		Serial.println(temp);
	}
	if (!error && detection) {
		float inches = ((status[3] << 8) + status[2]) / 128;
		float cm = inches / 0.3937;
		if (DEBUG) {
			Serial.print("Distance: ");
			Serial.println(cm);
		}
	}
}
