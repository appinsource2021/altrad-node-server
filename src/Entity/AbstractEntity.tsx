// interface EntityParser<TProps extends { [k: string]: any }> {
//     (props: TProps): AbstractEntity<TProps>;
//     parse(data: any): any;
//     serialize(): {[k: string]: any };
//     [k: string]: Function
// }
//
// export type AbstractEntityType<TProps extends { [k: string]: any }> = EntityParser<TProps>;

class AbstractEntity {
    // constructor(public props?: TProps) {}

    protected _id?: number = null;
    public getId(): number {
        return this._id
    };
    public setId(id: number): void {
        this._id = id
    };

    static class() {
        return new this
    }

    parse (data: object|Array<any>|null): this{

        if (typeof data === "object") {

            const removeFirstUnderscore = (propName: string): string => {
                return propName.replace(/^_/, ''); // Removes the first underscore character
            }

            // Get all keys of the instance
            // this.constructor.prototype just class methods
            // this just Class props & private class methods
            const keys = Object.keys(this);

            // Filter out keys corresponding to methods
            const props = keys.filter(key => typeof this[key] !== 'function' );
            // const props = Object.getOwnPropertyNames(this.constructor.prototype).filter( prop => prop.startsWith('_') && typeof this.constructor.prototype[prop] !== "function");
            // console.log('parse_keys_props',keys, props)
            // const serializedData = {id: this.getId()};

            props.map( key => {
                this[key] = data[removeFirstUnderscore(key)] ?? null;
            });
        }
        return this;

    }

    serialize() {
        // Get all keys of the instance
        const keys = Object.keys(this);
        const getMethods = Object.getOwnPropertyNames(this.constructor.prototype).filter( prop => prop.startsWith('get') && typeof this.constructor.prototype[prop] === "function");
        // console.log('getMethods',getMethods, this.constructor.name);

        const transformMethodName = (methodName: string): string => {
            // Remove 'get' from the beginning of the method name
            const withoutGet = methodName.slice(3);
            // Split the method name into words based on capital letters
            const words = withoutGet.replace(/([A-Z])/g, '_$1').toLowerCase();
            // Replace the first underscore if it exists
            return words.replace(/^_/, '');
        }

        // Filter out keys corresponding to methods
        const props = keys.filter(key => key.startsWith('get') && typeof this[key] === 'function');
        // console.log('props',props)
        // Create a new object to hold the serialized data
        const serializedData = {id: this.getId()};

        // Iterate over properties
        getMethods.forEach(originalPropName => {
            // Call the getter method and store its value
            try{
                serializedData[transformMethodName(originalPropName)] = this[originalPropName]();
            } catch (e){
                console.log('Serialize by prop block serializedDat', originalPropName, e.message);
            }
        });
        /// console.log('Serialize', serializedData);
        // Return the serialized data
        return serializedData;
    }
}

export default AbstractEntity;