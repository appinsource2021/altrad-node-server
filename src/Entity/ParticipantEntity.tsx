import AbstractEntity from "./AbstractEntity";
import {BoardEntity} from "./BoardEntity";
import {ParticipantNavigatorEntity} from "./ParticipantNavigatorEntity";
import {IParticipantNavigateItem} from "../Types/Types";

class ParticipantEntity extends AbstractEntity{

    private _birthday: string = '';
    private _card_id: string = '';
    private _name: string = '';
    private _surname: string = '';
    private _accessed_boards: Array<BoardEntity> = [];
    // private _last_navigate: IParticipantNavigateItem = null;
    private _last_navigate: ParticipantNavigatorEntity = null;
    private _profession: string = null;

    setAccessedBoards(accessedBoards: Array<BoardEntity> ): this{
        this._accessed_boards = accessedBoards
        return this;
    }
    getAccessedBoards(): Array<BoardEntity>{
        return this._accessed_boards;
    }

    public setName(name: string): this {
        this._name = name;
        return this;
    }
    public getName(): string {
        return this._name;
    }

    public setSurname(surname: string): this {
        this._surname = surname;
        return this;
    }
    public getSurname(): string {
        return this._surname;
    }

    public setBirthday(birthday: string): this {
        this._birthday = birthday;
        return this;
    }

    public getBirthday(): string {
        return this._birthday;
    }

    public setCardId(_card_id: string): this {
        this._card_id = _card_id;
        return this;
    }

    public getCardId(): string {
        return this._card_id;
    }

    public setLastNavigate( lastNavigate: ParticipantNavigatorEntity ): this {
        this._last_navigate = lastNavigate;
        return this;
    }

    public getLastNavigate(): ParticipantNavigatorEntity {
        return this._last_navigate;
    }

    setProfession(profession: string ): this{
        this._profession = profession
        return this;
    }
    getProfession(): string{
        return this._profession;
    }



}

export {ParticipantEntity}