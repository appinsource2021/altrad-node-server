const fs = require("fs");
const licencePath = 'Schemas/licence.json';
const streamOptions = {
    flags: 'a',         // Append data to the file
    encoding: 'utf8',   // Use UTF-8 encoding
    mode: 0o666,        // Read/write permissions for everyone
    autoClose: true,    // Automatically close the file when the stream ends
    start: undefined,   // Start writing at the beginning of the file
    highWaterMark: 16 * 1024 // Use a 16KB internal buffer
};

const listening = ( stream, callbackFn, fallbackFn ) => {
    stream.on('open', () => {
        stream.write(`{"key": "A7C7", "expiryAt": "2024-02-22", "maxDevices": 5}`);
        stream.end();
    });
    stream.on('finish', () => {
        console.log('Initial holders file has been prepared for first usage!');
        callbackFn();
    })
    stream.on('error', (err) => {
        console.error('Error creating file:', err);
        fallbackFn('Error with creating file:', err.toString() )
    });
}

const writeStream = ( callbackFn, fallbackFn ) => {
    const writeStream = fs.createWriteStream(licencePath, streamOptions );
    listening( writeStream, callbackFn, fallbackFn );
}

const read = ( userData, callbackFn, fallbackFn ) => {
    fs.readFile( licencePath, 'utf8', ( err, streamData )=>{
        // if (err) throw err;
        if( err ){
            fallbackFn(err.message);
            return;
        }

        try{
            const parsed = JSON.parse(streamData);
            callbackFn(parsed);

            if( parsed.key === userData.key ){
                const expiryAt = new Date(parsed.expiryAt)
                const status = !( new Date() > expiryAt );
                callbackFn({
                    status: status ,
                    key: parsed.key,
                    message: status ? `Valid until ${expiryAt.toLocaleDateString('De-de', {year: "numeric", month: "2-digit", day: "2-digit"})}`
                        : `Licence expired at ${expiryAt.toLocaleDateString('De-de', {year: "numeric", month: "2-digit", day: "2-digit"})}`,
                    expiryAt: expiryAt,
                })
                // return {
                //     status: status ,
                //     key: parsed.key,
                //     message: status ? `Valid until ${parsed.expiryAt.toLocaleDateString('De-de', {year: "numeric", month: "2-digit", day: "2-digit"})}`
                //         : `Licence expired at ${parsed.expiryAt.toLocaleDateString('De-de', {year: "numeric", month: "2-digit", day: "2-digit"})}`,
                //     expiryAt: parsed.expiryAt,
                // };
                return;
            }
            fallbackFn({...userData, status: false, message: 'Licence key not more exits!'})

        } catch (e){
            console.log('Licence File Ready error', e.message);
            // writeStream(()=>{
            //     read( callbackFn, fallbackFn );
            // }, fallbackFn )
        }
        console.log('Licence Without parsed data', streamData );
    });
}
const check = ( callbackFn, fallbackFn ) => {

    if( !fs.existsSync(licencePath) ){
        writeStream(callbackFn, fallbackFn );
    }
    else {
        callbackFn();
    }
}
const checkLicence = ( data, callbackFn, fallbackFn ) => {
    check(()=>{
        read( data, callbackFn, fallbackFn );
    }, message => {
        fallbackFn('checkLicence Fallback ' + message)
    })
}

module.exports = {
    checkLicence
}
// exports.fetchHolders = fetchHolders;