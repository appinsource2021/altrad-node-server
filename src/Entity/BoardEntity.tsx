import AbstractEntity from "./AbstractEntity";
import {BoardAccessedParticipantsEntity} from "./BoardAccessedParticipantsEntity";
import {ParticipantNavigatorEntity} from "./ParticipantNavigatorEntity";

class BoardEntity extends AbstractEntity{
    constructor() {
        super();
    }

    getName(): string {
        return this._name;
    }

    setName(value: string): this {
        this._name = value;
        return this;
    }

    getKey(): string {
        return this._key;
    }

    setKey(value: string): this {
        this._key = value;
        return this;
    }

    getLocation(): string {
        return this._location;
    }

    setLocation(value: string): this {
        this._location = value;
        return this;
    }

    getLocked(): boolean {
        return this._locked;
    }

    setLocked(value: boolean): this {
        this._locked = value;
        return this;
    }

    getRole(): string {
        return this._role;
    }

    setRole(value: string): this {
        this._role = value;
        return this;
    }

    getDisabled(): boolean {
        return this._disabled;
    }

    setDisabled(value: boolean): this {
        this._disabled = value;
        return this;
    }

    getSocketId(): string {
        return this._socket_id;
    }

    setSocketId(value: string): this {
        this._socket_id = value;
        return this;
    }

    getIsOnline(): boolean {
        return this._is_online;
    }

    setIsOnline(value: boolean): this {
        this._is_online = value;
        return this;
    }

    getFavoriteColor(): string {
        return this._favorite_color;
    }

    setFavoriteColor(value: string): this {
        this._favorite_color = value;
        return this;
    }

    setAccessedParticipants( participants: Array<BoardAccessedParticipantsEntity> ): this {
        this._accessed_participants = participants;
        return this;
    }
    getAccessedParticipants(): Array<BoardAccessedParticipantsEntity> {
        return this._accessed_participants;
    }

    setOnlineParticipants( participants: Array<ParticipantNavigatorEntity> ): this {
        this._online_participants = participants;
        return this;
    }
    getOnlineParticipants(): Array<ParticipantNavigatorEntity> {
        return this._online_participants;
    }

    private _name?: string = null;
    private _key?: string = null;
    private _location?: string = null;
    private _locked: boolean = false;
    private _role?: string = null;
    private _disabled: boolean = false;
    private _socket_id?: string = null;
    private _is_online: boolean = false;
    private _favorite_color?: string = null;
    private _accessed_participants?: Array<BoardAccessedParticipantsEntity|null> = null;
    private _online_participants?: Array<ParticipantNavigatorEntity|null> = null;

}

export {BoardEntity}