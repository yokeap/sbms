'use strict'

const Serialport = require('serialport')
const Readline = Serialport.parsers.Readline; // make instance of Readline parser
const port = new Serialport('/dev/ttyS0', {
  baudRate: 115200,
  Parity: 'none',
  stopBits: 1,
  dataBits: 8
})

const exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , path = require('path')
  , io = require('socket.io-client')
  , EventEmitter = require('events');
const measuringService = new EventEmitter();

//let socket = io.connect("http://192.168.1.10:9011",{
// reconnection: true,
// reconnectionDelay: 1000,
// reconnetionDelayMax: 5000,
//reconnectionAttempts: Infinity,
//});

let socket = io.connect();


let jsonData = {
    gasHF_1: 0
  , gasHF_2: 0
  , gasHF_3: 0
  , gasCO_1: 0
  , gasCO_2: 0
  , gasCO_3: 0
  , temperature_1: 0
  , temperature_2: 0
  , temperature_3: 0
  , voltString_1 : 0
  , voltString_2 : 0
  , voltString_3 : 0
  , amptring_1 : 0
  , amptString_2 : 0
  , amptString_3 : 0
  , wattString_1 : 0
  , wattString_2 : 0
  , wattString_3 : 0
  , rpmPort : 0
  , rpmStarboard : 0
  , input_1: 0
  , input_2: 0
  , input_3: 0
  , input_4: 0
}

//set delimiter
// const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

const parser = new Readline({delimiter: '\r\n'}); // make a new parser to read ASCII lines
port.pipe(parser)

// port.write(':S00,1111\r');

//let readInterValFunc;

//function readInterval(){
//  port.write(':M00\r');
//}

parser.on('data', function (data) {
 console.log(data); 
let strIn = data.toString();
  if(strIn[1] == 'A') {
    console.log("MCU string received have been problems")
    return 0;
  }
  let strSplit = strIn.split(',');
  //console.log(strSplit);
  jsonData.gasHF_1 = parseInt(strSplit[0], 10);
  jsonData.gasHF_2 = parseInt(strSplit[1], 10);
  jsonData.gasHF_3 = parseInt(strSplit[2], 10);
  jsonData.gasCO_1 = parseInt(strSplit[3], 10);
  jsonData.gasCO_2 = parseInt(strSplit[4], 10);
  jsonData.gasCO_3 = parseInt(strSplit[5], 10);
  jsonData.temperature_1 = parseInt(strSplit[6], 10) / 100.0;
  jsonData.temperature_2 = parseInt(strSplit[7], 10) / 100.0;
  jsonData.temperature_3 = parseInt(strSplit[8], 10) / 100.0;
  jsonData.voltString_1 = parseInt(strSplit[9], 10);
  jsonData.voltString_2 = parseInt(strSplit[10], 10);
  jsonData.voltString_3 = parseInt(strSplit[11], 10);
  jsonData.ampString_1 = parseInt(strSplit[12], 10);
  jsonData.ampString_2 = parseInt(strSplit[13], 10);
  jsonData.ampString_3 = parseInt(strSplit[14], 10);
  jsonData.wattString_1 = parseInt(strSplit[15], 10);
  jsonData.wattString_2 = parseInt(strSplit[16], 10);
  jsonData.wattString_3 = parseInt(strSplit[17], 10);
  jsonData.rpmPort = parseInt(strSplit[18]);
  jsonData.rpmStarboard = parseInt(strSplit[19]);
  jsonData.input_1 = parseInt(strSplit[20], 10);
  jsonData.input_2 = parseInt(strSplit[21], 10);
  jsonData.input_3 = parseInt(strSplit[22], 10);
  jsonData.input_4 = parseInt(strSplit[23], 10);

  socket.emit('measure-data', jsonData);

});

port.on('open', function (){
  port.flush();
  console.log('port open. Data rate: ' + port.baudRate);
});

port.on('close', function (){
  port.flush();
  console.log('port close');
});


socket.on('connect', function (data) {
  socket.emit('message', 'Measuring node 1 has been connected.');
  //readInterValFunc = setInterval(readInterval, 1000);
});

socket.on('disconnect', function () {
  console.log('Server down.');
  //clearInterval(readInterValFunc);
  // port.close(function (err) {
  //   console.log('port closed', err);
  // });
});

socket.on("io-control", function(data){
    if(data == "charge") setTimeout(writeIO(':S00,1111\r'), 3000);
    if(data == "discharge") setTimeout(writeIO(':S00,0000\r'), 3000);
});

socket.on('reconnect', function () {
  console.log('server is now online');
  // port.open();
  //readInterValFunc = setInterval(readInterval, 1000);
});

socket.on('reconnect_attempt', function(attemptNumber){
  console.log('reconnecting : ' + attemptNumber);
});

function writeIO(strinInput){
    port.write(':S00,1111\r');
}

