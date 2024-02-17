import AbstractEntity from "./AbstractEntity";
import {ParticipantEntity} from "./ParticipantEntity";
import {IParticipantNavigateItem} from "../Types/Types";

class ParticipantNavigatorEntity extends AbstractEntity {
    getBoardId(): number {
        return this._board_id;
    }

    setBoardId(value: number): this {
        this._board_id = value;
        return this;
    }

    getParticipantId(): number {
        return this._participant_id;
    }

    setParticipantId(value: number): this {
        this._participant_id = value;
        return this;
    }

    getNavigateIn(): string {
        return this._navigate_in;
    }

    setNavigateIn(value: string): this {
        this._navigate_in = value;
        return this;
    }

    getNavigateOut(): string {
        return this._navigate_out;
    }

    setNavigateOut(value: string): this {
        this._navigate_out = value;
        return this;
    }

    getParticipantInfo(): any {
        return this._participant_info;
    }

    setParticipantInfo(participant: any): this {
        this._participant_info = participant;
        return this;
    }

    private _board_id: number = null;
    private _participant_id: number = null;
    private _navigate_in: string = null;
    private _navigate_out: string = null;
    private _participant_info: any = null;


}

export {ParticipantNavigatorEntity}