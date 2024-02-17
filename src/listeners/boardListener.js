const licence = require("../../Deprecated/Licence");
const listener = (io, boardsCollection, holdersCollection, boardIO, monitorIO) => {

    const holderIndexInBoard = ( board, cardId ) => {
        if( board.holders !== undefined ){
            return board.holders.findIndex( holder => {
                return holder.cardId === cardId;
            })
        }
        return -1;
    };

    const boardIndexWhereHolderFound = async (cardId) => {
        let foundedIndex = -1;
        boardsCollection.map( (board, index) => {
            if( board.holders !== undefined ){
                const holderInBoardIndex = board.holders.findIndex( holder => {
                    return holder.cardId === cardId;
                });
                if( holderInBoardIndex > -1 ){
                    // set board index
                    foundedIndex = index;
                }
            }
        });

        return foundedIndex;
    };

    const licenceControl = ( data, callbackFn, fallbackFn  ) => {
        licence.checkLicence(data, callbackFn, fallbackFn );
    };

    const test = false;
    /**@description Test is Work*/
    if( test ){

        licenceControl({key: 'A7C7'}, successData => {
            console.log('successData',successData);
        }, fallbackData => {
            console.log('fallbackData', fallbackData );
        })
    }

    function SyncBoards( holders ){
        // console.log('SyncBoards',boardsCollection);
        boardsCollection.map( ( board, index ) => {
            const boardHolders = board.holders;
            if( undefined !== boardHolders ){
                boardHolders.map( (boardHolder, boardHolderIndex ) => {
                    const boardHolderItemInHoldersCollection =  holders.findIndex( holder => holder.cardId === boardHolder.cardId);
                    console.log('boardHolderItemInHoldersCollection', boardHolder.first_name, boardHolderItemInHoldersCollection);
                    /**
                     * If not found in new collection than remove it
                     */
                    if( boardHolderItemInHoldersCollection < 0 ){
                        board.holders.splice(boardHolderIndex, 1);
                    }
                });
            }
            console.log('Finally Boards', boardsCollection );
        });
        // Emit Actually Holders Collection In Boards to All Monitoring
        monitorIO.emit('board_joined_member', boardsCollection );
    }

    boardIO.on('connection', (socket) => {





        console.log('Board Connected', socket.id );

        // fetch licence data from client
        socket.emit('sync_licence' );

        socket.on('licence_check', data => {
            console.log('Licence checking with data', data );
            licenceControl( data, successData => {
                socket.emit('checked_licence', successData )
            }, fallbackData => {
                socket.emit('checked_licence', fallbackData )
            })
        });

        // Connected Board to Store
        socket.on('board_join', data =>  {

            try{
                const foundedBoard = boardsCollection.findIndex( item => item.boardName === data.boardName );
                if( foundedBoard < 0 ){
                    data.socketId = socket.id;
                    boardsCollection.push(data);
                } else {
                    boardsCollection.splice(foundedBoard, 1, data );
                }

                console.log('joined_board data', boardsCollection, data);

                // console.log('Joined Board', data );
                console.log('Connected boardsCollection', boardsCollection.map( board => board.boardName ) );
                monitorIO.emit('board_joined', boardsCollection );
                socket.emit('board_joined', {
                    status: true,
                    socketId: socket.id
                });

            } catch (e) {

                console.error('Server error by device login', e.message);

            }
        });
        // Logout board remove from Boards
        socket.on('board_leaved', data => {
            // return;
            console.log('Board leaved on Board namespace', JSON.stringify(data) );
            try{
                const foundedBoard = boardsCollection.findIndex( item => item.boardName === data.boardName );

                if( foundedBoard > -1 ){
                    boardsCollection.splice(foundedBoard, 1);
                }

                console.log('Last status after leaved board', JSON.stringify(boardsCollection));

                monitorIO.emit('leaved_board', boardsCollection );

            } catch (e) {

                console.error('Server error by device login', e.message);

            }
        });
        // socket.on('login_holder', data => {
        socket.on('board_joined_member', data => {
            console.log('board_joined_member', data);
            (async () => {
                try{
                    // Holder Exists ?
                    const holderIndexFromPool = holdersCollection.findIndex( item => item.cardId === data.cardId );
                    if( holderIndexFromPool < 0 ){
                        socket.emit('board_joined_member_response', {
                            exists: false,
                            message: 'Member not found'
                        });
                        return;
                    }
                    // !!! Holder inside of another Container 'Board'
                    const holderFoundedBoardIndex = await boardIndexWhereHolderFound(data.cardId);
                    // member herhangi bi yerde bulundu ise
                    if( holderFoundedBoardIndex > -1 ){
                        // Remove holder from wrapped container
                        const sourceBoard = boardsCollection[ holderFoundedBoardIndex ];
                        const holderFoundedIndexInBoard = holderIndexInBoard( sourceBoard, data.cardId );
                        // console.log(`
                        //     Holder in source board found
                        //     Holder from: ${sourceBoard.boardName} --> ${data.boardName}
                        //     Holder founded Board-Index:${holderFoundedBoardIndex}
                        //     Holder Index in Founded Board:${holderFoundedIndexInBoard}
                        //     Holder CardId:${data.cardId}
                        // `);
                        // Founded holder in same Board, remove it and stop
                        if( sourceBoard.boardName === data.boardName ){
                            // Remove from Same board
                            console.log('Holder in same board, removing from ', data.boardName );
                            sourceBoard.holders.splice(holderFoundedIndexInBoard, 1);

                            // Update processed new board item for boardsCollection
                            boardsCollection.splice(holderFoundedBoardIndex, 1, sourceBoard);
                            monitorIO.emit('board_joined_member', boardsCollection );

                            socket.emit('board_joined_member_response', {
                                exists: true,
                                message: 'Member logged out',
                                currentBoardHolders: sourceBoard.holders
                            });
                            // Stop all
                            return;
                        }
                        // Holder in different Board
                        // Remove holder from founded Board
                        sourceBoard.holders.splice( holderFoundedIndexInBoard, 1 );
                        // Update removed holder source board
                        boardsCollection.splice( holderFoundedBoardIndex, 1, sourceBoard );
                        // add holder to new board
                        // Find target holder index from pool
                        const targetHolderIndex = holdersCollection.findIndex( item => item.cardId === data.cardId );
                        // Find target board index from pool
                        const targetBoardIndex = boardsCollection.findIndex( item => item.boardName === data.boardName );
                        // if all exists
                        if( targetHolderIndex > -1 && targetBoardIndex > -1 ){
                            // define target board
                            const targetBoard = boardsCollection[targetBoardIndex];
                            // No holders prop in board prop, than append
                            if( undefined === targetBoard.holders ){
                                targetBoard.holders = [];
                            }

                            const dt = new Date();
                            const h = holdersCollection[targetHolderIndex ];
                            h.loginTime = dt.toLocaleTimeString('DE-de', { hour12: true, hour: "2-digit", minute: "2-digit"});
                            h.loginDate = dt.toLocaleDateString('DE-de', {day: "2-digit", month: "2-digit", year: "numeric"});

                            targetBoard.holders.push(h);

                            // Update updated holders for board
                            boardsCollection.splice( targetBoardIndex, 1, targetBoard );

                            // Send to monitors
                            monitorIO.emit('board_joined_member', boardsCollection );

                            socket.emit('board_joined_member_response', {
                                exists: true,
                                message: `Member ${holdersCollection[holderIndexFromPool].first_name} joined to ${data.boardName}`,
                                currentBoardHolders: targetBoard.holders
                            });

                            return ;

                        }
                    }
                    // console.log(`
                    //     Holder founded in board Index
                    //     HolderFoundedBoardIndex:${holderFoundedBoardIndex}
                    //     HolderFoundedBoardName:${ holderFoundedBoardIndex > -1 ? boardsCollection[holderFoundedBoardIndex].boardName : 'Not found'}
                    // ` );
                    const boardIndex    = boardsCollection.findIndex( item => item.boardName === data.boardName );
                    const board         = boardsCollection[boardIndex];
                    try{
                        if( board.holders === undefined ){
                            board.holders = [];
                        }
                    } catch (e) {
                        console.log('Error Board Joined member', e.message);
                    }
                    //     console.log(`
                    //     Holders: ${holders}
                    //     Holder founded in board Index
                    //     HolderFoundedBoardIndex:${holderFoundedBoardIndex}
                    //     HolderFoundedBoardName:${ holderFoundedBoardIndex > -1 ? boardsCollection[holderFoundedBoardIndex].boardName : 'Not found'}
                    //     HolderFoundedInGlobal:${ holderIndexFromPool}
                    // ` );
                    if( holderIndexFromPool > -1 ){
                        try{
                            const dt = new Date();
                            const h = holdersCollection[holderIndexFromPool];
                            h.loginTime = dt.toLocaleTimeString('DE-de', { hour12: true, hour: "2-digit", minute: "2-digit"});
                            h.loginDate = dt.toLocaleDateString('DE-de', {day: "2-digit", month: "2-digit", year: "numeric"});
                            board.holders.push(h);
                            // Update updated holders for board
                            boardsCollection.splice( boardIndex, 1, board );
                            // Send to monitors
                            monitorIO.emit('board_joined_member', boardsCollection );
                            // Store all holder to device
                            // socket.emit('login_holder_response', {
                            //     status: 'Logged In'
                            // } );
                            console.log('board.holders',board.holders);
                            socket.emit('board_joined_member_response', {
                                exists: true,
                                message: `Member ${holdersCollection[holderIndexFromPool].first_name} joined to ${data.boardName}`,
                                currentBoardHolders: board.holders
                            });
                        } catch (e) {
                            console.log('Error', e.message);
                            socket.emit('board_joined_member_response', {
                                exists: false,
                                message: e.message
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error on listener board_joined_member', e.message );
                }
            })();
        });
        // Clear All Boards
        /**
         * @deprecated */
        socket.on('clear_server_connected_boards', data => {

            boardsCollection = [];

            io.of('/monitor').emit('leaved_boards', boardsCollection );

        });
        socket.emit('server-status', {
            socketId: socket.id,
            status: true
        });
        monitorIO.emit('all_boards', boardsCollection );
        /**
         * @deprecated */
        socket.on('server-status', data => {
            console.log('Client request status', data);
            socket.emit('server-status', {
                socketId: socket.id,
                status: true
            });
        });
        // If Client Disconnected
        socket.on('disconnect', () => {
            try{
                boardsCollection.map( (item, index ) => {
                    if( item.socketId === socket.id ){
                        boardsCollection.splice(index, 1);
                    }
                });

                console.log('Board leaved from server', boardsCollection.map( board => {
                    return board.boardName
                }) );

                monitorIO.emit('leaved_board', boardsCollection );
            } catch (e) {
                console.error('Error on listener disconnect', e.message );
            }
        })
    });

}

module.exports = {
    listener
}