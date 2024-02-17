import AbstractEntity from "./AbstractEntity";

class BoardAccessedParticipantsEntity extends AbstractEntity{
    constructor() {
        super();
    }
    getParticipantId(): number {
        return this._participant_id;
    }

    setParticipantId(value: number): this {
        this._participant_id = value;
        return this;
    }

    getBoardId(): number {
        return this._board_id;
    }

    setBoardId(value: number): this {
        this._board_id = value;
        return this;
    }

    private _participant_id: number = null;
    private _board_id: number = null;
}

export {BoardAccessedParticipantsEntity}