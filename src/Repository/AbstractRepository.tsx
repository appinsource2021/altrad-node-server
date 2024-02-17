import SchemaManager from "../ORM/SchemaManager"
import AbstractEntity from "../Entity/AbstractEntity";
import {EntityManagerInterface} from "../ORM/EntityManagerInterface";
import {IEntityResponse} from "../Types/Types";
import {checkEntity, registeredEntities} from "../ORM/EntityRepositoryInspector";

class AbstractRepository {

    getEntityManagerInterface(): EntityManagerInterface {
        return this._entityManagerInterface;
    }

    getEntity(): AbstractEntity{
        return this._entity;
    }

    private readonly _schemaManager: SchemaManager;
    private readonly _storeName: string = null;
    private readonly _entity: AbstractEntity;
    private readonly _entityManagerInterface: EntityManagerInterface;
    constructor(entityManagerInterface: EntityManagerInterface, entity: AbstractEntity) {
        // const repositoryName = this.constructor.name;
        this._entity = entity;
        this._entityManagerInterface = entityManagerInterface;
        // const regex = /^(.+)Repository$/;
        // if (!regex.test(repositoryName)) {
        //     throw new Error("String does not match the pattern");
        // }
        // // Replace Entity to Repository
        // this._storeName = repositoryName.replace(/Repository/, "Store");
        this._schemaManager = new SchemaManager(entity);
    }

    public getContent(): any{
        return this._schemaManager.getData();
    }

    findAll(format?: 'json'|'object'): Array<AbstractEntity|object>|null{
        // return this.getContent();
        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findId entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }
        return this.getContent().map ( item => {
            const instance = new registeredEntities[this._entity.constructor.name]; // new (eval(this._entity.constructor.name))();
            if( format === 'json'){
                return instance.parse(item).serialize();
            }
            return instance.parse(item);
        })


    }

    findId( id: number|string, format?: 'json'|'object' ): AbstractEntity|object|null{
        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findId entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }
        try{
            let _id = id;
            if( typeof id === "string" ){
                _id = parseInt(id);
            }
            // @ts-ignore

            const dataFromRepo = this.getContent().filter( (item: { [k:string]: any }) => item?.id === _id )?.[0] ?? null ;
            // console.log('this._entity',this._entity.constructor.name);
            if( format === 'json'){
                return this._entity.parse(dataFromRepo).serialize();
            }
            return this._entity.parse(dataFromRepo);

        } catch (e){
            console.info(`Info with findId, ${e.message}`);
        }
        return null;
    }

    findOneBy( criteria: {[k: string]: any }, format?: 'json'|'object'): AbstractEntity|object {

        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findByOne entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }

        try{
            // return this.getContent().filter( (item: { [k:string]: any }) => item[column] === value )?.[0] ?? null
            const filterString = Object.entries(criteria)
                .map(([key, value]) => `item.${key} === ${this.convertValueToRealType(key, value)}`)
                .join(" && ");

            // console.info(`Query info for findOneBy [${filterString}]`)

            const data = this.getContent().filter( (item: any) => {
                return eval(filterString); // Using eval to dynamically evaluate the filter string
            })?.[0];



            const instance = new registeredEntities[this._entity.constructor.name]; // new (eval(this._entity.constructor.name))();
            if( format === 'json'){
                return instance.parse(data).serialize();
            }
            return instance.parse(data);

        } catch (e){
            throw new Error(`Error with findOneBy, ${e.message}`);
        }
    }

    /*findBy = ( column: string, value: any ) => {
        try{
            return this.getContent().filter( (item: { [k:string]: any }) => {

                return item[column] === value

            } ) ?? [];
        } catch (e){
            throw new Error(`Error with findOneBy, ${e.message}`);
        }
    }*/
    findBy = ( criteria: {[k: string]: any }, format?: 'json'|'object' ): Array<AbstractEntity|object>|[] => {
        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findBy entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }
        try{
            const filterString = Object.entries(criteria)
                .map(([key, value]) => `item.${key} === ${this.convertValueToRealType(key, value)}`)
                .join(" && ");

            // console.info(`Query info for findBy [${filterString}]`)

            return this.getContent().filter( (item: any) => {
                return eval(filterString); // Using eval to dynamically evaluate the filter string
            }).map ( item => {
                const instance = new registeredEntities[this._entity.constructor.name]; // new (eval(this._entity.constructor.name))();
                if( format === 'json'){
                    return instance.parse(item).serialize();
                }
                return instance.parse(item);
            })
        } catch (e){
            console.error(`Error with findBy, ${e.message}`, this._entity.constructor.name)
        }
        return [];
    }

    first = (criteria?: {[k: string]: any }, format?: 'json'|'object'): AbstractEntity|object|null => {
        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findByOne entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }
        try{
            let content = this.getContent();
            if( criteria  ){
                const filterString = Object.entries(criteria)
                    .map(([key, value]) => `item.${key} === ${this.convertValueToRealType(key, value)}`)
                    .join(" && ");

                // console.info(`Query info for first [${filterString}]`)

                content = this.getContent().filter( (item: any) => {
                    return eval(filterString); // Using eval to dynamically evaluate the filter string
                })
            }

            const data = content.slice().sort((a: {[k:string]: any}, b: {[k:string]: any}) => a.id - b.id)?.[0]

            const instance = new registeredEntities[this._entity.constructor.name];
            if( format === 'json'){
                return instance.parse(data).serialize();
            }
            return instance.parse(data);

        } catch (e){
            console.error(`Error by findByOne entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            // throw new Error(`Error with findOneBy, ${e.message}`);
        }
        return null
    }
    last = (criteria?: {[k: string]: any }, format?: 'json'|'object'): AbstractEntity|object|null => {
        if(!checkEntity(this._entity.constructor.name).registered){
            console.error(`Error by findByOne entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            throw new Error("Error by findByOne")
        }
        try{
            let content = this.getContent()
            if( criteria ){
                const filterString = Object.entries(criteria)
                    .map(([key, value]) => `item.${key} === ${this.convertValueToRealType(key, value)}`)
                    .join(" && ");

                // console.info(`Query info for last [${filterString}]`)

                content = this.getContent().filter( (item: any) => {
                    return eval(filterString); // Using eval to dynamically evaluate the filter string
                })
            }

            const data = content.slice().sort((a: {[k:string]: any}, b: {[k:string]: any}) => b.id - a.id)?.[0]

            const instance = new registeredEntities[this._entity.constructor.name];
            if( format === 'json'){
                return instance.parse(data).serialize();
            }
            return instance.parse(data);

        } catch (e){
            console.error(`Error by findByOne entity with name [${this._entity.constructor.name}] in Config has not been registered`)
            // throw new Error(`Error with findOneBy, ${e.message}`);
        }
        return null
    }
    formData( data: any ): EntityManagerInterface {
        console.log('FormData',data, this._entity.constructor.name);
        this._entityManagerInterface.setFormData(data);
        this._entity.parse(data);
        this._entityManagerInterface.setPersistedEntity(this._entity);
        // this._entityManagerInterface.persist(this._entity);
        return this._entityManagerInterface;

        /**
         * Work this operation but not recommended
         * While
         * From user action
         * After formData(...).persist() <- Not pretty and simple
         * should be formData(...).flush()
         * in EntityManagerInterface/persist
         * have a access barrier
         * if formData and persist same time use got en Error
         * either formData(...).flush or without formData ... set(...).persist(EntityInstance).flush()
         * */

        /*console.log('FormData',data, this._entity.constructor.name);
        this._entityManagerInterface.setFormData(data);
        this._entity.parse(data);
        this._entityManagerInterface.persist(this._entity);
        // this._entityManagerInterface.persist(this._entity);
        return this._entityManagerInterface;*/
    }

    convertValueToRealType = (key: string, value?: any ): any => {
        let output: any = value;
        // console.log('input for ', value );
        if( null !== value ){
            if (typeof value === "boolean") {
                // Boolean için dönüşüm mantığı
                output = value;
            } else if (typeof value === "number") {
                // Sayı için dönüşüm mantığı
                output = value;
            } else if (typeof value === "string" && !isNaN(parseFloat(value))) {
                // Sayısal dize için dönüşüm mantığı
                output = value;
            } else if (typeof value === "string" && (value.toLowerCase() === "true" || value.toLowerCase() === "false")) {
                // Boolean temsil eden dize için dönüşüm mantığı
                output = value;
            } else {
                // Diğer durumlar için dönüşüm mantığı
                output = `"${value}"`;
            }

            return output;

        }
        return output;
    }
}

export {AbstractRepository};