import fs from "fs";
import {AbstractRepository} from "../Repository/AbstractRepository";
import AbstractEntity from "../Entity/AbstractEntity";

class SchemaManager {

    private readonly _schemaName: string = '';
    private _path: string = '';
    private _schemeExtension: string = 'json';

    constructor( entity: AbstractEntity ){
        const repositoryName = entity.constructor.name;
        // const regex = /^(.+)Repository$/;
        const regex = /^(.+)Entity/;
        if (!regex.test(repositoryName)) {
            console.error('repositoryName', repositoryName);
            throw new Error("2. String does not match the pattern");
        }
        // Replace Entity to Repository
        // this._schemaName = repositoryName.replace(/Repository/, "Store");
        this._schemaName = repositoryName.replace(/Entity/, "Store");
    }

    private getPath = () => {
        return 'Schemas/' + this._schemaName + '.' + this._schemeExtension;
    }

    private createSchema = () => {
        fs.writeFileSync( this.getPath(), JSON.stringify([]), {encoding: "utf8"});
    }

    private isSchemaExists = (): boolean => {
        return fs.existsSync(this.getPath());
    }

    getData = (): Array<any>|null => {
        if( !this.isSchemaExists() ){
            this.createSchema();
        }
        const content = fs.readFileSync(this.getPath(), {encoding: 'utf-8'});
        if( typeof content === "string" ){
            try{
                return JSON.parse( content );
            } catch (e){
                console.error('Error with readFileSync ' + this.getPath(), e.message );
            }
        }
        return null;
    }

    writeFileSync = (content: Array<any>|object ) => {
        try{
            if( !this.isSchemaExists() ){
                this.createSchema();
            }
            fs.writeFileSync( this.getPath(), JSON.stringify(content), {encoding: "utf8"} );
            console.error('File Updated successfully with writeFileSync ' + this.getPath() );
            return true;
        } catch (e){
            console.error('Error by writeFileSync ' + this.getPath(), e.message );
        }
        return false;
    }
}

export default SchemaManager;