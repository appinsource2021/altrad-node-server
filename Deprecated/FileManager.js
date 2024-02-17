const fs = require('fs');


/**
 * @param {any} content
 * @return {"array"|"object"|null}
 * */
const contentIs = content => {
    let parsed = content;
    if( typeof content === "string" ){
        try{
            parsed = JSON.parse(content)
            if(Array.isArray(parsed)){
                return "array";
            }
            else if(typeof parsed === "object"){
                return "object"
            }
        } catch (e){
            console.error('Invalid File Content', e );
        }
    }
    console.error('Invalid File Content')
    return null;
}

/**
 * @param {any} data
 * @return boolean */
const validContent = data => {
    return ["array", "object"].indexOf(contentIs(data)) > -1
}

/**
 * @param {string} path
 * @return {Object|Array|null}
 * */
const readFileSync = path => {

    if( !fs.existsSync(path) ){
        fs.writeFileSync(path, JSON.stringify([]), {encoding: "utf8"});
    }

    const content = fs.readFileSync(path, {encoding: 'utf-8'});
    if( typeof content === "string" ){
        try{
            return JSON.parse( content );
        } catch (e){
            console.error('Error with readFileSync ' + path, e.message );
        }
    }
    return null;
}

/**
 * @param {string} path
 * @param {any} content
 * @return {boolean}
 * */
const writeFileSync = (path, content ) => {
    try{
        fs.writeFileSync( path, JSON.stringify(content), {encoding: "utf8"} );
        return true;
    } catch (e){
        console.error('Error by writeFileSync ' + path, e.message );
    }
    return false;
}

/**
 * @param {string} path
 * @param {"array"|"object"} contentType
 * @param {(err: ErrnoException|string|null, data: any) => void } callback
 * */
const read = (path, contentType, callback ) => {
    fs.readFile(path, {encoding: 'utf-8'}, (err, data) => {

        if( validContent(data) ){
            if( typeof data === "string" ){
                try{
                    const parsedData = JSON.parse(data);
                    console.log('validContent(data)',validContent(data), contentType, typeof parsedData, Array.isArray(parsedData) );
                    if( contentType === "array" && !Array.isArray(parsedData)){
                        write(path, [], () => {
                            // Loop Method after create
                            read(path, contentType, callback );
                        });
                        return;
                    }
                    callback( err, parsedData );
                } catch (e){
                    console.error('Error with EntityManager read file', e.message );
                }
            }
            return;
        }

        // Create with
        write(path, contentType === "array" ? [] : {}, () => {
            // Loop Method after create
            read(path, contentType, callback );

        });


        // callback("No Valid file content", null );

    })
}



/**
 * @param {string} path
 * @param {any} content
 * @param {() => void? } callback
 * */
const write = (path, content, callback ) => {

    console.log('JSON.stringify(content)', JSON.stringify(content));
    // File does not exist, so create it
    // Write content to the file or update if it exists
    fs.writeFile(path, JSON.stringify(content), { flag: 'w+' }, (err) => {
        if (err) {
            console.error('Error write file:', err);
        } else {
            if( undefined !== callback && typeof callback === "function" ){
                callback();
            }
            console.log('File updated or created successfully!');
        }
    });

    // fs.access(path, fs.constants.F_OK, (err) => {
    //     if (err) {
    //
    //     } else {
    //         // File exists, do not overwrite
    //         console.log('File already exists, skipping creation.');
    //     }
    // });
}

const fileManager = {
    write,
    read,

    readFileSync,
    writeFileSync
}


module.exports = {
    fileManager
}