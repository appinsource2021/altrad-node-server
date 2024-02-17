// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const cors = require('cors');
// const {spawn, exec} = require('child_process');
// const formidable = require('formidable');
// const fs = require('fs');
const { io, app, cors, server } = require("./src/Server/Main");




const listeners = require('./src/listeners');

// const path = require('node:path');
// const {board} = require("./src/listeners");
// const io = new Server(server, {
//     cors:{
//         origin: [
//             'http://82.165.183.133:3010',
//             'http://17.21.0.22',
//             'http://0.0.0.0:3000',
//             'http://localhost:3000',
//             'http://0.0.0.0:3010',
//             'http://127.0.0.1:3010',
//             'http://127.0.0.1:3000',
//             'http://0.0.0.0:3001',
//             'http://192.168.2.100:3001',
//             'http://82.165.183.133:3010'
//         ]
//     }
// });

// /**
//  * Perform some operation with the monitors collection.
//  * @param {TMonitiorCollectionType} monitorsCollection - Collection of monitors.
//  */
// let monitorsCollection = [];
// let boardsCollection = [];
// let holdersCollection = [];
// let warningFired = {warning: false, message: ""};

// const accessToFile = (filePath, callbackFn) => {
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             console.error('File does not exist');
//
//         } else {
//             // console.log('File exists');
//             callbackFn(true);
//         }
//     });
// }
//
// const fileWriteManager = (path, content) => {
//
//     console.log('JSON.stringify(content)', JSON.stringify(content));
//     // File does not exist, so create it
//     // Write content to the file or update if it exists
//     fs.writeFile(path, JSON.stringify(content), { flag: 'w+' }, (err) => {
//         if (err) {
//             console.error('Error updating file:', err);
//         } else {
//             console.log('File updated or created successfully!');
//         }
//     });
//
//     // fs.access(path, fs.constants.F_OK, (err) => {
//     //     if (err) {
//     //
//     //     } else {
//     //         // File exists, do not overwrite
//     //         console.log('File already exists, skipping creation.');
//     //     }
//     // });
// }


// /**
//  * @param {string} socketId
//  * @param {"add"|"remove"} status
//  * @param { (collection: TMonitiorCollectionType) => void } callbackFn
//  *
//  * */
// const setMonitorsCollection = ( socketId, status, callbackFn ) => {
//     const _cloned = [...monitorsCollection];
//     const foundedMonitor = monitorsCollection.findIndex( monitorItem => monitorItem.socketId === socketId);
//     switch (status) {
//         case "add":
//             if (foundedMonitor < 0) {
//                 _cloned.push({socketId: socketId, visible: true });
//             }
//             break;
//         case "remove":
//             _cloned.splice(foundedMonitor, 1)
//             break;
//     }
//     monitorsCollection = _cloned;
//     console.log('worker Me!', monitorsCollection);
//     fileWriteManager('data/monitors.json', _cloned );
//     callbackFn( monitorsCollection );
// }
// /**
//  *
//  * @param {string} socketId
//  * @typedef {"add"|"remove"} status
//  * @param { (monitor: object, monitors: Array<TMonitiorItemType>) => void } callbackFn
//  *
//  * */
// const setToggleVisibleMonitor = ( socketId, callbackFn ) => {
//
//     const _cloned = [...monitorsCollection];
//     const foundedMonitor = monitorsCollection.findIndex( monitorItem => monitorItem.socketId === socketId);
//     if (foundedMonitor > -1) {
//         _cloned[foundedMonitor].visible = !_cloned[foundedMonitor].visible;
//         console.log('Asked socketId Me!', socketId, monitorsCollection);
//         // callbackFn( _cloned[foundedMonitor] );
//         callbackFn( _cloned[foundedMonitor], monitorsCollection );
//     }
//     // monitorsCollection = _cloned;
//     fileWriteManager('data/monitors.json', monitorsCollection );
// }
// const getMonitorsCollection = ( callbackFn ) => {
//     const filePath = 'data/monitors.json';
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//         } else {
//             console.log('File contents:', data);
//             try{
//                 callbackFn(JSON.parse(data));
//             } catch (err){
//                 console.error('Parse Content file:', err);
//             }
//         }
//     });
//     return monitorsCollection;
// }

// const setWarningFired = ( data, callbackFn ) => {
//     warningFired = {...warningFired,
//         warning: !getWarningFired().warning,
//         message: data.message
//     };
//     callbackFn();
// }
// const getWarningFired = () => {
//     return warningFired;
// }



// holders.fetchHolders( data => {
//     holdersCollection = data;
// }, message => {
//     console.log('Error Fetch-Holders', message);
// });
// console.log( 'Holders', holdersCollection );


// io.adapter(redisAdapter({ host: 'localhost', port: 3000 }));
// const redis = new Redis();





// const boardIO = io.of('/board');
// const monitorIO = io.of('/monitor');
// const warningIO = io.of('/warning');
// const dashboardIO = io.of('/dashboard');


listeners.dashboard.listener();
listeners.monitor.listener();
//listeners.warning.listener();
//// listeners.board.listener();

// io.on("connection", (socket) => {
//
//     console.log('U user disconnect', socket.id );
//
//     // listeners.board.listener(io, boardsCollection, holdersCollection, boardIO, monitorIO);
//     // listeners.monitor.listener({monitorIO, dashboardIO});
//     // listeners.dashboard.listener({dashboardIO, monitorIO});
//     // listeners.warning.listener({ dashboardIO, warningIO, monitorIO, boardIO });
//
//
// });

io.on("disconnect", (socket) => {
    console.log('a user disconnect', socket.id );
});

// Enable CORS for all routes
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});


app.get('/checker', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// app.post('/upload', (req, res) => {
//     console.log('Request Triged');
//     const form = new formidable.IncomingForm();
//     form.parse( req, function (err, fields, files) {
//         const file = files.file[0];
//         try{
//             if( file.mimetype === "application/json" ){
//                 const oldPath = file.filepath;
//                 const newPath = 'data/holders.json';// + file.originalFilename;
//                 try {
//                     (async () => {
//                         await fs.copyFile(oldPath, newPath, function (err) {
//                             if (err) throw err;
//                             // res.write('File uploaded and moved!');
//
//
//                             const response = [];
//
//                             response.push({
//                                 "message": 'File uploaded successfully',
//                                 "severity": "success"
//                             });
//                             // await fs.renameSync(oldPath, newPath);
//                             fetchHolders( data => {
//                                 // console.log('File uploaded and moved', data);
//                                 console.log('New Holders', data);
//                                 holdersCollection = data;
//                                 response.push({
//                                     "message": 'Server has been syncronised',
//                                     "severity": "success"
//                                 });
//                                 res.json( response );
//                                 SyncBoards( data );
//                                 res.end();
//                             });
//
//
//                         });
//
//                     })();
//                 } catch (error) {
//                     res.json({
//                         "message": e.message,
//                         "severity": "error"
//                     });
//                 }
//             }
//         } catch (e) {
//             res.json({
//                 "message": 'Extension should be json file and valid content!',
//                 "severity": "error"
//             });
//         }
//     });
// });

server.listen(3000, () => {
    console.log('Server listening on *:3000');
});

