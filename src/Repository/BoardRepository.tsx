import {AbstractRepository} from "./AbstractRepository";
import {BoardAccessedParticipantsEntity, BoardEntity} from "../Entity";

class BoardRepository extends AbstractRepository {
    // Either Empty should be create this assigned to Entity
    /// Custom Overwrite-able methods
    findAllWithAccessedParticipants(): Array<object>{

        const boards = this.getEntityManagerInterface().getRepository(BoardEntity.class()).findAll();
        return boards.map((board: BoardEntity) => {

            /**
             * By Single can get as object and serialize into set Method like setAnyMethod(myValue.serialize())
             * By Collection either json type or returned object should mapping and the result can serialize */
            const ap = this.getEntityManagerInterface().getRepository(BoardAccessedParticipantsEntity.class()).findBy({"board_id": board.getId()}, 'json')

            // @ts-ignore
            board.setAccessedParticipants(ap); // already by 'json' serialized
            return board.serialize()
        });

    }



}

export {BoardRepository}