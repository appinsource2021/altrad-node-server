import {ParticipantRepository} from "../Repository/ParticipantRepository";
import {BoardRepository} from "../Repository/BoardRepository";
import {BoardAccessedParticipantsRepository} from "../Repository/BoardAccessedParticipantsRepository";
import {BoardAccessedParticipantsEntity, BoardEntity, ParticipantEntity, ParticipantNavigatorEntity} from "../Entity";
import {ParticipantNavigatorRepository} from "../Repository/ParticipantNavigatorRepository";

export const registeredRepositories = {
    'BoardRepository': BoardRepository,
    'ParticipantRepository': ParticipantRepository,
    'BoardAccessedParticipantsRepository': BoardAccessedParticipantsRepository,
    'ParticipantNavigatorRepository': ParticipantNavigatorRepository
}
export const registeredEntities = {
    'BoardEntity': BoardEntity,
    'ParticipantEntity': ParticipantEntity,
    'BoardAccessedParticipantsEntity': BoardAccessedParticipantsEntity,
    'ParticipantNavigatorEntity': ParticipantNavigatorEntity
}


