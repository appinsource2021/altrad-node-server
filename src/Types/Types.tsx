
export interface IEntityCollectionItem{
    [k: string]: any
}

export type TEntityCollection = Array<IEntityCollectionItem>

export interface IEntityResponse  {
    status: boolean,
    error?: string,
    item?: IEntityCollectionItem
    items?: TEntityCollection

}

export interface IParticipantNavigateItem {
    board_id: number
    participant_id: number,
    navigate_in: string,
    navigate_out?: string
}
export type IParticipantNavigateCollection = Array<IParticipantNavigateItem>