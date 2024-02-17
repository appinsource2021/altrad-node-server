const fileManager = require("../../Deprecated/FileManager");
const helpers = require("../../Deprecated/helpers");
const {monitorIO, dashboardIO, boardIO} = require("../Server/namespaces")

const {
    BoardEntity,
    EntityManagerInterface,
    ParticipantEntity,
    BoardAccessedParticipantsEntity,
    ParticipantNavigatorEntity
} = require("../../dist/Entity");

const monitorListener = require("./monitorListener");




// const {board} = require("./index");

const fetchBoards = ( callbackFn ) => {
    const em = new EntityManagerInterface();
    // const boards = entityManagerInterface.getRepository(BoardEntity.class()).findAll('json');

    // With Related Entity
    // const boards = em.getRepository(BoardEntity.class()).findAll();
    // const serialized = boards.map(board => {
    //     const ap = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({"board_id": board.getId()}, 'json')
    //     board.setAccessedParticipants(ap);
    //     return board.serialize()
    // });
    /**type {BoardRepository} repo*/
    const repo = em.getRepository(BoardEntity.class());
    const serialized = repo.findAllWithAccessedParticipants();
    console.log('fetch_boards', serialized);
    callbackFn(serialized);


}

const boardUnregister = () => {

}

const fetchParticipants = ( callbackFn ) => {

    const em = new EntityManagerInterface();
    // const participants = em.getRepository(ParticipantEntity.class()).findAll();
    // const serialized = participants.map( participant => {
    //     const ab = em.getRepository(BoardEntity.class()).findBy({participant_id: participant.getId()}, 'json')
    //     participant.setAccessedBoards(ab);
    //
    //     // Update Last Navigate
    //     const last_navigate = em.getRepository(ParticipantNavigatorEntity.class()).last({participant_id: participant.getId()})
    //     if( last_navigate.getId() ){
    //         participant.setLastNavigate(last_navigate.serialize());
    //     }
    //
    //
    //     return participant.serialize()
    // })
    const repo = em.getRepository(ParticipantEntity.class());
    const serialized = repo.findAllWithAccessedBoardsAndLastNavigate();
    console.log('fetchParticipants', serialized);
    callbackFn(serialized);

}

const navigateParticipant = ( data, callbackFn ) => {

    console.log('participant_navigate', data );
    const em = new EntityManagerInterface();

    const status = {
        status: true,
        message: "Accessed"
    }

    const board = em.getRepository(BoardEntity.class()).findId(data.board_id);
    console.log('navigateParticipant_GetBoardBoard', board);
    if(!board?.getLocked()){

        // Open Navigated item
        const oldNavigate = em.getRepository(ParticipantNavigatorEntity.class()).findOneBy({participant_id: data.participant_id, navigate_out: null });

        console.log('oldNavigate',oldNavigate);

        // Close Old
        if( oldNavigate.getId() ){
            oldNavigate
                .setNavigateOut(new Date().toLocaleDateString('DE-de', {year: "numeric", month: "2-digit", day: "2-digit", hour:"2-digit", minute: "2-digit"}))
            em.persist(oldNavigate);
            em.flush();
        }

        if( oldNavigate.getBoardId() !== data.board_id ){

            // Check have a access??
            const boardAccessedParticipant = em.getRepository(BoardAccessedParticipantsEntity.class()).findOneBy({board_id: data.board_id, participant_id: data.participant_id})
            console.error('Participant havve no access!!!!', boardAccessedParticipant);
            if( boardAccessedParticipant.getId() === null ){
                status.status = false;
                status.message = 'Participant have no Access'
            }
            else{
                const navigator = new ParticipantNavigatorEntity();
                navigator
                    .setBoardId(data.board_id)
                    .setParticipantId(data.participant_id)
                    .setNavigateIn(new Date().toLocaleDateString('DE-de', {year: "numeric", month: "2-digit", day: "2-digit", hour:"2-digit", minute: "2-digit"}));
                em.persist(navigator).flush();
            }

        }

    }
    else {
        status.message = "OutHors Service";
        status.status = false;
    }



    callbackFn( status );

}

const listener = () => {

    const filePath = "data/dummy_boards.json";

    // const boards = entityManager.setEntity(Schema.DUMMY_BOARDS ).findBy("name", "Jazzy" );

    // console.log('Dikkat et', boards );



    // let board = new entityManagerInterface.getRepository(BoardEntity.class()).findId(1);
    //
    // entityManagerInterface.remove(board);

    const entityManagerInterface = new EntityManagerInterface();
    /*
    // Direct with form data
    const boardEntity = new BoardEntity();
    const response = entityManagerInterface.getRepository(BoardEntity.class())
        .formData({
            name: "Mercedes",
            location: "Stuttgart"
        })
        .flush()*/
    /**
     * New Object direct persist */
    // const board = new BoardEntity()
    // board.setName('Tesla');
    // board.setId(100);
    // const response = entityManagerInterface.persist(board).flush();

    // const board= entityManagerInterface.getRepository(BoardEntity.class()).findId(27);
    // board.setName('Lexus')
    // const response = entityManagerInterface.persist(board).flush();
    // const participantEntity = new ParticipantEntity();
    // participantEntity.setName('Suleyman')
    // entityManagerInterface.persist(participantEntity).flush();


    /*const em = new EntityManagerInterface();

    // const board = em.getRepository(BoardEntity.class()).findId(1) as BoardEntity;
    const boards = em.getRepository(BoardEntity.class()).findAll();
    boards.map(board => {
        const ap = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({"board_id": board.getId()}, 'json')
        board.setAccessedParticipants(ap);
        return board.serialize()
    })



    console.log('Fetched Accessed Participants from Data' , boards );
    // accessedData.accessedParticipants.map( accessedParticipantId => {
    //     // Add if not exits
    //     if( fetchAccessed.findIndex( item => item.getParticipantId() === accessedParticipantId) < 0 ){
    //         const boardAccessedParticipant = new BoardAccessedParticipantsEntity();
    //         console.log('Not found Participant' , fetchAccessed.findIndex( item => item.getParticipantId() === accessedParticipantId), accessedParticipantId );
    //         boardAccessedParticipant
    //             .setParticipantId(accessedParticipantId)
    //             .setBoardId(1)
    //         // Reverse
    //         em.persist(boardAccessedParticipant)
    //         em.flush()
    //     }
    // });
    return;*/





    dashboardIO.on('connection', (socket) => {

        console.log('Dashboard_Client_Connected_with_socket_id', socket.id);

        // Completed
        socket.on('fetch_boards', () => {
            fetchBoards( serialized => {
                socket.emit('fetched_boards',  serialized );
            });
        });

        // Completed
        socket.on('board_register', managingBoardData => {
            const entityManagerInterface = new EntityManagerInterface();
            const response = entityManagerInterface.getRepository(BoardEntity.class())
                .formData(managingBoardData)
                .flush();
            socket.emit('board_registered', response );
        });
        // Deregister
        socket.on('board_deregister', managingBoardData => {

            try{
                const em = new EntityManagerInterface();
                let board = em.getRepository(BoardEntity.class()).findId(managingBoardData.id);
                const removeResponse = em.remove(board);
                console.log('removing Board', board);

                // Accessed Participant's remove too
                const accessedParticipants = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({board_id: managingBoardData.id});
                accessedParticipants.map( accessedParticipant => {
                    em.remove(accessedParticipant);
                });

                //socket.emit('board_deregistered', removeResponse );
                fetchBoards( serialized => {
                    socket.emit('board_deregistered', serialized );
                })



            } catch (e){
                console.error('Erroy by board_deregister event', e.message);
            }
        });



        socket.on('fetch_participants', () => {
            // const entityManagerInterface = new EntityManagerInterface();
            // const participants = entityManagerInterface.getRepository(ParticipantEntity.class()).findAll('json');
            // console.log('fetched_participants', participants);
            // socket.emit('fetched_participants', participants );
            fetchParticipants( serialized => {
                socket.emit('fetched_participants', serialized );
            })

        });
        socket.on('accessed_participants_to_board', accessedData => {

            const em = new EntityManagerInterface();

            const fetchAccessed = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({"board_id": accessedData.boardItem.id} );

            console.log('Fetched Accessed Participants from Data' , accessedData, fetchAccessed );

            accessedData.accessedParticipants.map( accessedParticipantId => {
                // Add if not exits
                if( fetchAccessed.findIndex( item => item.getParticipantId() === accessedParticipantId) < 0 ){
                    const boardAccessedParticipant = new BoardAccessedParticipantsEntity();
                    console.log('Not found Participant' , fetchAccessed.findIndex( item => item.getParticipantId() === accessedParticipantId), accessedParticipantId );
                    boardAccessedParticipant
                        .setParticipantId(accessedParticipantId)
                        .setBoardId(accessedData.boardItem.id)
                    // Reverse
                    em.persist(boardAccessedParticipant)
                    em.flush()
                }
            });

            // Already selected but on finally list not show than remove
            fetchAccessed.map( item => {

                if(accessedData.accessedParticipants.indexOf( item.getParticipantId() ) < 0 ){

                    try{
                        const obj = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({
                            participant_id: item.getParticipantId(),
                            board_id: accessedData.boardItem.id
                        }).map( item => {
                            console.log('Removing_obj',item);
                            const em = new EntityManagerInterface();
                            em.remove(item)
                            em.flush()
                        })
                    } catch (err){
                        console.error('Error by removing accessing from board...', err.message)
                    }


                }

            })

            // const boards = em.getRepository(BoardAccessedParticipantsEntity.class()).findBy({"board_id": accessedData.boardItem.id} );

            // socket.emit('accessed_participants_to_board_response', finallyFetchAccessed );

            fetchBoards( serialized => {
                console.log('fetchBoards_serialized',serialized);
                socket.emit('fetched_boards',  serialized );
            });





        });
        socket.on('participant_register', managedParticipantData => {
            const entityManagerInterface = new EntityManagerInterface();
            const reponse = entityManagerInterface
                .getRepository(ParticipantEntity.class())
                .formData(managedParticipantData)
                .flush();
            socket.emit('participant_registered', reponse );
        });
        socket.on('participant_deregister', managingParticipantData => {
            console.error('managingParticipantData', managingParticipantData );
            try{
                const entityManagerInterface = new EntityManagerInterface();
                let participant = entityManagerInterface.getRepository(ParticipantEntity.class()).findId(managingParticipantData.id);
                const removeResponse = entityManagerInterface.remove(participant);
                socket.emit('participant_deregistered', removeResponse );
            } catch (e){
                console.error('Erroy by board_deregister event', e.message);
            }
        });



        // S I M U L A T I O N
        socket.on('participant_navigate', data => {

            navigateParticipant( data, status => {

                fetchParticipants( serialized => {
                    socket.emit('participant_navigated', {
                        status: status.status,
                        message: status.message,
                        participants: serialized
                    } );
                })

                // S I M U L A T I O N
                // if( managingBoardData.is_online ){
                // fetchBoards in MonitorListener Module (it's already filtered)
                monitorListener.fetchBoards( serialized => {
                    monitorIO.emit('board_joined', serialized );
                })

            })


        })

        // Lock/Unlock - R E A L -
        // On/Offline   - S I M U L A T I O N -
        socket.on('change_board_status', managingBoardData => {
            const entityManagerInterface = new EntityManagerInterface();
            const response = entityManagerInterface.getRepository(BoardEntity.class())
                .formData(managingBoardData)
                .flush();
            fetchBoards( serialized => {
                socket.emit('changed_board_status', {
                    items: serialized
                });
                // S I M U L A T I O N
                // if( managingBoardData.is_online ){
                // fetchBoards in MonitorListener Module (it's already filtered)
                monitorListener.fetchBoards( serialized => {
                    monitorIO.emit('board_joined', serialized );
                })
                // }
            });




        })







        // console.log('manager',board);
        // return;
        // const added = entityManagerInterface
        //     .getRepository(boardEntity)
        //     .formData({
        //         "key": 30,
        //         "name": "Vuural",
        //         "location": "Bobenheim",
        //         "locked": false,
        //         "role": "assembly_point",
        //         "disabled": false,
        //         "socketId": "123456",
        //         "isOnline": false,
        //         "favorite_color": "Yesil"
        //     })
        // added.persist(boardEntity).flush()
        // .persist(boardEntity)
        // .flush()

        /*const entityManagerInterface = new EntityManagerInterface();
        let boardEntity = new BoardEntity();
        const added = entityManagerInterface
            .getRepository(boardEntity)
            .formData({
                "key": 30,
                "name": "Vuural",
                "location": "Bobenheim",
                "locked": false,
                "role": "assembly_point",
                "disabled": false,
                "socketId": "123456",
                "isOnline": false,
                "favorite_color": "Yesil"
            });
            //;.persist(boardEntity).flush()
            // .persist(boardEntity)
            // .flush()
        //if( !boardEntity ){
            // boardEntity = new BoardEntity()
        // }

        // boardEntity.setName('New Item ...')


        // return;*/

        // console.log('_board',boardEntity );

        // boardEntity
        //     .setName("Osman")
        //     .setIsOnline(true)
        //     .setKey('123')
        //     .setRole('No-Role')
        //     .setDisabled(true)
        //     .setLocked(true);

        // entityManagerInterface.persist(boardEntity);
        // entityManagerInterface.flush();

        // .formData({
        //     name: 'Osman'
        // }).transformer();//findId(2);
        // return;


        // monitorIO.emit('sync_me')

        // allData.name = 'Changed';


            // console.log('allData',allData);
            //
            //
            // console.log('Entity Ola', boardEntity.id);
        /**
         * If actually Connected socket doesn't match with stored Monitors (File) Remove others */
        // syncConnectedMonitors(socket);

        // Fetch Joined Monitors to Dashboard monitor view
        // helpers.getMonitorsCollection( data => {
        //     // 1. Dashboard in System
        //     socket.emit('fetch_monitor_joined', data );
        // });

        // Dashboard asked for
        // socket.on('fetch_monitor_joined', () => {
        socket.on('sync_monitors', () => {
            // syncConnectedMonitors(socket);
            monitorIO.emit('sync_me' )
        });

        // Warn Manager
        // Send Signal To DashBoard
        socket.on('check_warning_fired', () => {
            helpers.getWarningFired( data => {
                console.log('check_warning_fired', typeof data, data );
                socket.emit('warning_fired', data );
            })
        })




        // Monitor Manager
        socket.on('reload_monitor', invisibleSocketId => {
            monitorIO.to(invisibleSocketId).emit('reload_monitor');
        });

        // New
        socket.on('update_monitor_state', changedMonitor => {
            helpers.setMonitorState( changedMonitor, ( monitor, monitors ) => {
                socket.emit('updated_monitor_state', monitors );
                console.log('set_monitor_state_', monitor, monitors );
                monitorIO.to(changedMonitor.socketId).emit('updated_monitor_state', monitor );
            })
        })









        // Board Manager
        // Register
        /**
         * @deprecated
         * */
        // socket.on('_board_register', managingBoardData => {
        //
        //     const _entityBoard = entityManager.setEntity(Schema.DUMMY_BOARDS).findId(managingBoardData?.id);
        //     if( managingBoardData?.id && !_entityBoard ){
        //         // Requested Not found
        //         socket.emit('board_registered', {
        //             status: false,
        //             message: "Requested board not more exists!"
        //         });
        //         return;
        //     }
        //     if( !managingBoardData?.id ){
        //         const manageableBoardItem = {...managingBoardData,
        //             // id: generate Auto by Entity
        //             // key: ... sent by user
        //             disabled: false,
        //             socketId: "",
        //             // role: ... sent by user
        //             isOnline: false,
        //             locked: false,
        //             favorite_color: "" // Not necessary
        //         };
        //
        //         entityManager.persist(manageableBoardItem);
        //     }
        //     else {
        //         entityManager.persist(managingBoardData);
        //     }
        //
        //     const added = entityManager.flush();
        //     console.log('added',added, entityManager.findAll() );
        //     if( added ){
        //         socket.emit('board_registered', {
        //             status: true,
        //             message: managingBoardData?.id ? "Updated Successfully" : "Already successfully" ,
        //             currentItem: entityManager.persistedItem(),
        //             currentCollection: entityManager.findAll()
        //         });
        //     }
        //
        // });







    });
}

module.exports = {
    listener
}