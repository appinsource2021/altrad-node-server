import SchemaManager from "./SchemaManager";
// import {BoardRepository,} from "../Repository/BoardRepository";
// import {ParticipantRepository,} from "../Repository/ParticipantRepository";
import AbstractEntity from "../Entity/AbstractEntity";
import {AbstractRepository} from "../Repository/AbstractRepository";
import {IEntityResponse} from "../Types/Types";
import {checkRepository, registeredRepositories} from "./EntityRepositoryInspector"

class EntityManagerInterface {
    setFormData(value: { [p: string]: any }) {
        this._formData = value;
    }
    setPersistedEntity(value: AbstractEntity) {
        this._persistedEntity = value;
    }

    private _schemaManager:SchemaManager = null;
    private _formData: {[k: string]: any } = null;


    // id: number;
    private _persistedEntity: AbstractEntity = null;

    private _repositoryName: string = null;

    // private registeredRepositories = {
    //     'BoardRepository': BoardRepository,
    //     'ParticipantRepository': ParticipantRepository
    // }

    private autoIncrement = (collection: Array<any>) => {

        let increment = 0;
        try{
            increment = collection.slice().sort((a, b) => b.id - a.id)?.[0].id;
        } catch (e) {
            console.warn('Warning by increment', e.message);
        }
        return increment + 1;
    }

    // private isRepositoryRegistered = (): boolean => {
    //     const keys = Object.keys(this.registeredRepositories);
    //     return keys.indexOf( this._repositoryName ) > -1;
    // }

    private getRepositoryClass = (entity: AbstractEntity): AbstractRepository => {
        const entityName = entity.constructor.name;

        const regex = /^(.+)Entity$/;

        if (!regex.test(entityName)) {
            throw new Error("1. String does not match the pattern");
        }

        // Replace Entity to Repository
        this._repositoryName = entityName.replace(/Entity/, "Repository");

        const repositoryStatus = checkRepository(entityName);

        if(!repositoryStatus.registered){
            console.error(`Repository ${repositoryStatus.repositoryName} has not been registered`, repositoryStatus )
            throw new Error('Repository ' + repositoryStatus.repositoryName + ' has not been registered');
        }

        try{
            return new registeredRepositories[repositoryStatus.repositoryName](this, entity)
        } catch (e){
            console.error('Error with getRepository', e.message );
        }

    }

     getRepository = (entity: AbstractEntity): AbstractRepository => {
        // console.log('getRepository_entity', (entity instanceof AbstractEntity), entity.constructor.name);
        if( !(entity instanceof AbstractEntity) ){
            throw new Error('EntityManagerInterface by getRepository Invalid parameter, parameter should be instance Of AbstractEntity,')
        }
        // Either Here on inside persist,  see comment line
        // this.setPersistedEntity(entity);
        return this.getRepositoryClass(entity);
    }

    persist( entity: AbstractEntity ): this {
        console.log('Persist this._persistedEntity.constructor.name', this._formData, typeof entity, entity?.constructor.name );

        if( !(entity instanceof AbstractEntity) ){
            throw new Error('EntityManagerInterface by persist Invalid parameter, parameter should be instance Of AbstractEntity,')
        }

        if( this._formData !== null ){
            throw new Error('Form Data has been declared, Persist can\'t use for this operation please remove it ans call direct flush if necessary!')
        }

        // Either Here on inside getRepository, see comment line
        this.setPersistedEntity(entity);
        return this;
    }

    flush(): IEntityResponse {

        // console.log('Flush this._persistedEntity.constructor.name', this._persistedEntity, this._persistedEntity.constructor.name);
        this._schemaManager = new SchemaManager(this._persistedEntity);
        const content = this.getRepositoryClass(this._persistedEntity).getContent();

        const _cloned = [...content];
        console.log('Before, manageableBoardItem', _cloned, this._persistedEntity.serialize(), this._persistedEntity?.getId() );
        let managedItem = null;

        if( !this._persistedEntity?.getId() ){
            this._persistedEntity.setId(this.autoIncrement(_cloned));
            console.log('manageableBoardItem by Add', _cloned, this._persistedEntity.serialize() );
            managedItem = this._persistedEntity.serialize()
            _cloned.push(managedItem);
        }
        else {
            const foundedIndex = content.findIndex( (item: {[k:string]: any}) => item.id === this._persistedEntity.getId() )
            if( foundedIndex > -1 ){
                console.log('manageableBoardItem by Edit', foundedIndex, this._persistedEntity.serialize() );
                managedItem = {..._cloned[foundedIndex], ...this._persistedEntity.serialize() }
                _cloned.splice( foundedIndex, 1, managedItem );
            }
        }
        try{
            this._schemaManager.writeFileSync(_cloned);
            return {
                status: true,
                error: null,
                item: managedItem,
                items: _cloned
            };
        } catch (e){
            return {
                status: false,
                error: e.message,
                item: null,
                items: content
            };
        }
    }

    remove( entity: AbstractEntity ): IEntityResponse {
        this._schemaManager = new SchemaManager(entity);
        const content = this.getRepositoryClass(entity).findAll('json');
        let removedItem = null;

        const _cloned: Array<{[k: string]: any}> = [...content];
        console.log('remove_entity', entity, _cloned, entity.getId());
        const foundedItem = _cloned.findIndex( item => item.id === entity.getId() );
        if( foundedItem > -1 ){
            removedItem = _cloned[foundedItem]
            _cloned.splice(foundedItem, 1);
            this._schemaManager.writeFileSync(_cloned);
            return {
                status: true,
                error: null,
                item: removedItem,
                items: _cloned
            }
        }
        return {
            status: false,
            error: "No removeable item found!",
            item: null,
            items: _cloned
        }

        try{
            const _cloned: Array<{[k: string]: any}> = [...content];
            console.log('remove_entity', entity, _cloned, entity.getId());
            const foundedItem = _cloned.findIndex( item => item.id === entity.getId() );
            if( foundedItem > -1 ){
                removedItem = _cloned[foundedItem]
                _cloned.splice(foundedItem, 1);
                this._schemaManager.writeFileSync(_cloned);
                return {
                    status: true,
                    error: null,
                    item: removedItem,
                    items: _cloned
                }
            }
            return {
                status: false,
                error: "No removeable item found!",
                item: null,
                items: _cloned
            }
        } catch (e){
            console.error('Error by remove', e.message);
            return {
                status: true,
                error: "Removed successfully",
                item: null,
                items: content
            }
        }
    }

    lastInsertId = (): number => {
        return this.autoIncrement(this.getRepositoryClass(this._persistedEntity).getContent()) - 1;
    }

    // formData( data: any ): this {
    //     this._formData = data;
    //     return this;
    // }
}

export {EntityManagerInterface}
