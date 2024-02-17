import {registeredEntities, registeredRepositories} from "./EntityRepositoryRegistry";
export {registeredRepositories, registeredEntities}
export const checkRepository = ( repositoryNameFromEntity: string ): { registered: boolean, repositoryName: string } => {

    // Replace Entity to Repository
    const repositoryName = repositoryNameFromEntity.replace(/Entity/, "Repository");

    const keys = Object.keys(registeredRepositories);
    return {
        registered: keys.indexOf( repositoryName ) > -1,
        repositoryName: repositoryName
    }
}

export const checkEntity = ( entityName: string ): { registered: boolean, entityName: string } => {
    const keys = Object.keys(registeredEntities);
    return {
        registered: keys.indexOf( entityName ) > -1,
        entityName: entityName
    }
}