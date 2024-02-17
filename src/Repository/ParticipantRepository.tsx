import {AbstractRepository} from "./AbstractRepository";
import {BoardEntity, ParticipantEntity, ParticipantNavigatorEntity} from "../Entity";


class ParticipantRepository extends AbstractRepository{

    findAllWithAccessedBoardsAndLastNavigate(){

        const participants = this.getEntityManagerInterface().getRepository(this.getEntity()).findAll();

        return  participants.map( (participant: ParticipantEntity ) => {

            // @ts-ignore
            const ab = this.getEntityManagerInterface().getRepository(BoardEntity.class()).findBy({participant_id: participant.getId()}, 'json')
            // @ts-ignore
            participant.setAccessedBoards(ab);

            // Update Last Navigate
            // @ts-ignore
            const last_navigate = this.getEntityManagerInterface().getRepository(ParticipantNavigatorEntity.class()).last({participant_id: participant.getId()})
            // @ts-ignore
            if( last_navigate.getId() ){
                // @ts-ignore
                // This is a object and single value can serialize
                participant.setLastNavigate(last_navigate.serialize());
            }


            return participant.serialize()
        })
    }


}

export {ParticipantRepository}