const {fileManager} = require("./FileManager");
let _entity = null;
let _persistedItem = null;
const setEntity = ( name ) => {
    _entity = name;
}
const getEntity = () => {
    return 'Schemas/' + _entity;
}

const getContent = () => {
    return fileManager.readFileSync(getEntity())
}

/**
 * @param {number|string} id
 * @return {Object|null}
 * */
const findId = ( id ) => {
    if( null === _entity ) throw new Error('No entity has been declared!');
    let _id = id;
    if( typeof id === "string" ){
        _id = parseInt(id);
    }
    return getContent().filter(item => item?.id === _id )?.[0] ?? null ;
}

/**
 * @param {string} column
 * @param {any} value
 * @return {Object|null}
 * */
const findOneBy = ( column, value  ) => {
    if( null === _entity ) throw new Error('No entity has been declared!');
    return getContent().filter(item => item[column] === value )?.[0] ?? null
}

/**
 * @param {string} column
 * @param {any} value
 * @return {Array<Object>}
 * */
const findBy = ( column, value ) => {
    if( null === _entity ) throw new Error('No entity has been declared!');
    return getContent().filter(item => item[column] === value ) ?? [];
}

const first = () => {
    return getContent().slice().sort((a, b) => a.id - b.id)?.[0]
}
const last = () => {
    return getContent().slice().sort((a, b) => b.id - a.id)?.[0]
}

const findAll = () => {
    return getContent();
}



/**
 * @param {Array} collection
 * @return number
 * */
const autoIncrement = ( collection) => {




    let increment = 0;
    try{
        increment = collection.slice().sort((a, b) => b.id - a.id)?.[0].id;
    } catch (e) {
        console.warn('Warning by increment', e.message);
    }
    return increment + 1;
}

const entityManager = {

    setEntity: (name) => {
        _entity = name;
        return entityManager;
    },
    findId,
    findBy,
    findOneBy,
    findAll,

    first,
    last,

    persist: (item) => {
        _persistedItem = item;
        return entityManager;
    },
    flush: () => {
        const _cloned = [...getContent()];
        if( !_persistedItem?.id ){
            _persistedItem.id = autoIncrement(_cloned);
            _cloned.push(_persistedItem);
        }
        else {
            const foundedIndex = _cloned.findIndex( item => item.id === _persistedItem.id )
            if( foundedIndex > -1 ){
                console.log('manageableBoardItem',_persistedItem);
                _cloned.splice(foundedIndex, 1, {..._cloned[foundedIndex], ..._persistedItem} );
            }
        }
        return fileManager.writeFileSync(getEntity(), _cloned);
    },
    persistedItem: () => {
        return _persistedItem;
    },
    /**
     * @param {{[k: string]: any }|Array<{[k: string]: any }>} object */
    remove: (object) => {
        try{
            if( typeof object === "object" ){
                const _cloned = [...getContent()];
                if( Array.isArray(object) ){
                    object.map( item => {
                        const fondedItem = _cloned.findIndex( item => item.id === object.id );
                        if( fondedItem > -1 ){
                            _cloned.splice(fondedItem, 1);
                        }
                    })
                    fileManager.writeFileSync(getEntity(), _cloned);
                } else {
                    const fondedItem = _cloned.findIndex( item => item.id === object.id );
                    if( fondedItem > -1 ){
                        _cloned.splice(fondedItem, 1);
                        fileManager.writeFileSync(getEntity(), _cloned);
                    }
                }
                return {
                    status: true,
                    message: "Removed successfully",
                    collection: entityManager.findAll()
                }
            }
        } catch (e){
            return {
                status: false,
                message: e.message,
                collection: entityManager.findAll()
            }
        }

    }
}

const Schema = {
    BOARDS: "boards.json",
    DUMMY_BOARDS: "DummyBoards.json",
    WARNING: "warning.json",
}

module.exports = {
    // autoIncrement,
    // findId,
    // findBy,
    // findOneBy,
    entityManager,
    Schema
}
