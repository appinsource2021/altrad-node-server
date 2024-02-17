const manager = require("./FileManager")
const fs = require("fs");
const {monitorIO} = require("../src/Server/namespaces");
const {entityManager, Schema} = require("./Entity");
/**
 * @typedef {socketId: string, visible: boolean} TMonitiorItemType
 * @typedef {Array<TMonitiorItemType>} TMonitiorCollectionType
 * @typedef {"add"|"remove"|"sync"} StreamOption
 *
 * @typedef {warning: boolean, message: string} TWarningType
 ****************************************/

/**
 *
 * @param {string} socketId
 * @param {(monitor: object, monitors: Array<TMonitiorItemType>) => void } callbackFn
 *
 */

const SocketEvents = {
    MONITOR_JOINED: 'monitor_joined',
    MONITOR_LEAVED: 'monitor_leaved',
    MONITOR_SYNCED: 'monitor_synced'
};

// const syncConnectedMonitors = (socketId, streamMonitorsCollection, callbackFn ) => {
//     const activeSockets = Array.from( monitorIO.sockets.keys() );
//     console.log('syncConnectedMonitors', activeSockets )
//     // Create a Set to store seen socketIds
//     const seenSocketIds = new Set();
//     // Filter the data array
//     const activeMonitors = streamMonitorsCollection.filter(item => {
//         // Check if the socketId is in activeSockets and not already seen
//         if (activeSockets.includes(item.socketId) && !seenSocketIds.has(item.socketId)) {
//             seenSocketIds.add(item.socketId); // Add the socketId to seenSocketIds
//             return true; // Keep this item
//         }
//         return false; // Filter out this item
//     });
//     callbackFn(activeMonitors);
//     return activeMonitors;
// }


const syncMonitors = ( monitorData, streamMonitorsCollection, callbackFn ) => {
    const activeSockets                     = Array.from( monitorIO.sockets.keys() );
    const _clonedStreamMonitorsCollection = [...streamMonitorsCollection];

    // Eger dosyada monitor socket yoksa onu ekle
    if( activeSockets.indexOf(monitorData.socketId) > -1  ){
        _clonedStreamMonitorsCollection.push(monitorData);
    }

    // Eger dosyada Monitorslar arasinda monitor socket yoksa onu cikar
    _clonedStreamMonitorsCollection.map( (_monitorInCollection, index) => {
        if( activeSockets.indexOf(_monitorInCollection.socketId) < 0  ){
            _clonedStreamMonitorsCollection.splice(index, 1);
        }
    });



    console.log('syncConnectedMonitors', activeSockets.indexOf(monitorData.socketId), monitorData, activeSockets, _clonedStreamMonitorsCollection );
    callbackFn(_clonedStreamMonitorsCollection);
    return _clonedStreamMonitorsCollection;
}

/**
 * @param {string} socketId
 * @param {StreamOption} register
 * @param {TMonitiorItemType?} monitorData
 * @param { (collection: TMonitiorCollectionType) => void? } callbackFn
 */
const monitorRegister = (socketId, register, monitorData,  callbackFn ) => {


    const filePath = 'data/monitors.json';
    manager.entity.read(filePath, 'array', (err, data) => {

        if(register === "sync"){
            // Remove Clusters
            const synced = syncMonitors( monitorData, data, syncedCollection => {
                console.log('worker Me!', data);
                manager.entity.write('data/monitors.json', syncedCollection );
                callbackFn( syncedCollection );
            });
            console.log('ONLY SYNCED', synced, monitorData, data, typeof data);
            return;
        }



        console.log('setMonitorsCollection_data',data, typeof data);
        const _cloned = [...data];
        const foundedMonitor = data.findIndex( monitorItem => monitorItem.socketId === socketId);
        switch (register) {
            case "add":
                if (foundedMonitor < 0) {
                    _cloned.push({socketId: socketId, locked: false });
                }
                break;
            case "remove":
                _cloned.splice(foundedMonitor, 1)
                break;
        }
        manager.entity.write('data/monitors.json', _cloned );
        callbackFn( _cloned );




    });


}

/**
 * @param {TMonitiorCollectionType} content
 * @param { (collection: TMonitiorCollectionType) => void? } callbackFn
 */
// const monitorsSync = ( content, callbackFn ) => {
//     const filePath = 'data/monitors.json';
//     manager.entity.write( filePath, content, () => {
//         manager.entity.read( filePath, "array", (err, data) => {
//             if(!err){
//                 callbackFn(data);
//                 return;
//             }
//             console.error('Error with monitorsSync', err );
//         });
//     });
// }


const setMonitorState = ( monitor, callbackFn ) => {
    const filePath = 'data/monitors.json';
    manager.entity.read(filePath, 'array', ( err, monitorsCollection ) => {
        if(!err){
            const _clonedMonitors = [...monitorsCollection];
            const foundedMonitor = monitorsCollection.findIndex( monitorItem => monitorItem.socketId === monitor.socketId );
            if (foundedMonitor > -1) {
                _clonedMonitors.splice(foundedMonitor, 1, monitor )
                callbackFn( _clonedMonitors[foundedMonitor], _clonedMonitors );
            }
            manager.entity.write('data/monitors.json', _clonedMonitors );
        }
    });
}


/**
 * @param { (collection: TMonitiorCollectionType) => void } callbackFn
 * */
const getMonitorsCollection = ( callbackFn ) => {
    const filePath = 'data/monitors.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
        } else {
            console.log('File contents:', data);
            try{
                callbackFn(JSON.parse(data));
            } catch (err){
                console.error('Parse Content file:', err);
            }
        }
    });
    return null;
}



 /**
 * @param {TWarningType} data
 * @param {(data: TWarningType) => void} callbackFn
 * */
const setWarningFired = ( data, callbackFn ) => {
    const filePath = 'data/warning.json';
    getWarningFired(fileContent => {
        const _cloned = {...fileContent, ...data }
        manager.entity.write(filePath, _cloned, (err, data) => {
            callbackFn( _cloned );
        });
    })
}

/**
 * @param {(data: TWarningType) => void} callbackFn
 * */
const getWarningFired = ( callbackFn ) => {

    const alarm = entityManager.setEntity(Schema.WARNING).last();
    console.log('getWarningFired', alarm);
    return;

    const filePath = 'data/warning.json';
    manager.entity.read(filePath, "object", (err, data) => {
        if(!err){
            callbackFn(data);
            return;
        }
        // Create With Content
        /**
         * @var {TWarningType} newData
         * Initial File with content
         * */
        const newData = {warning: false, message: ""}
        manager.entity.write(filePath, newData, () => {
            getWarningFired(callbackFn);
        })

    });
}


module.exports = {
    getMonitorsCollection,
    monitorRegister,
    getWarningFired,
    setWarningFired,

    setMonitorState,
   //  monitorsSync, // Sync The Monitors In File

    SocketEvents
}