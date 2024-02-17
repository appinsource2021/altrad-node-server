const helpers = require("../../Deprecated/helpers");
const { monitorIO, dashboardIO } = require("../Server/namespaces")


const {EntityManagerInterface} = require("../../dist/ORM/EntityManagerInterface");
const {BoardEntity, ParticipantNavigatorEntity, ParticipantEntity} = require("../../dist/Entity");



const fetchBoards = ( callbackFn ) => {


    const em = new EntityManagerInterface();
    // 1. Fetch Boards
    const boards = em.getRepository(BoardEntity.class()).findBy({is_online: true, role: "work_place"});
    // 2. Each Boards wth new param
    const serializedBoards = boards.map( board => {

        // Set Online users
        // 3. Fetch Board Online Participants
        const boardActiveNavigatedParticipants = em.getRepository(ParticipantNavigatorEntity.class()).findBy({
            board_id: board.getId(),
            navigate_out: null
        }).map( navigatedParticipant => {

            // 4. Each of Navigated Participant Fetch own Info(data)
            const participantFromEntity = em.getRepository(ParticipantEntity.class()).findId( navigatedParticipant.getParticipantId(), 'json' )

            navigatedParticipant.setParticipantInfo(participantFromEntity);

            // 5. Serialize Participant Info-Data
            return navigatedParticipant.serialize();
        });

        // 6. Serialized Participants collection add into board object
        board.setOnlineParticipants(boardActiveNavigatedParticipants);

        // 7. Serialize board
        return board.serialize();

    });

    // 8. Finally Serialized boards collection
    callbackFn(serializedBoards);

}

const listener = () => {




    monitorIO.on('connection', (socket) => {

        console.log('Monitor_Client_Connected_with_socket_id', socket.id);

        socket.on('fetch_boards', () => {
            fetchBoards( (serialized) => {
                socket.emit('fetched_boards', serialized )
            })
        });



        // Monitor connected Notify to Dashboard
        // helpers.monitorRegister(socket.id, "add",data => {
        //     dashboardIO.emit( helpers.SocketEvents.MONITOR_JOINED, data );
        // });
        dashboardIO.emit( helpers.SocketEvents.MONITOR_JOINED, {
            socketId: socket.id,
            warned: false,
            locked: false,
        })

        // Monitor Disconnect
        socket.on('disconnect', () => {
            console.log('MONOTOR_DISCONNECTED', socket.id)
            dashboardIO.emit( 'monitor_leaved', {
                socketId: socket.id
            })
            // helpers.monitorRegister(socket.id, "remove",data => {
            // });
        });

        socket.on('sync_me', monitorData => {
            console.log('SYNC_ME_MONITOR_LISTENER_monitorData', monitorData)
            dashboardIO.emit( helpers.SocketEvents.MONITOR_JOINED, monitorData )
            // helpers.monitorRegister(socket.id, "sync", monitorData, data => {
            //
            // });
        });


        // Send Signal To Monitoring
        socket.on('check_warning_fired', () => {
            helpers.getWarningFired( data => {
                socket.emit('warning_fired', data )
            })
        });
        /**
         * use Monitor Status Change
         * Monitor become Warning signal and Say to Dashboard i'm accepted
         * */
        socket.on('alarm_notification_accepted_by_the_monitor_dashboard_has_been_acknowledged', (socketId) => {
            // To Dashboard FE
            // dashboardIO.emit('alarm_notification_accepted_by_the_monitor_dashboard_has_been_acknowledged', socketId )

            socket.on('update_monitor_state', changedMonitor => {
                helpers.setMonitorState( changedMonitor, ( monitor, monitors ) => {
                    socket.emit('updated_monitor_state', monitors );
                    console.log('set_monitor_state_', monitor, monitors );
                    monitorIO.to(changedMonitor.socketId).emit('updated_monitor_state', monitor );
                })
            })


        })



        // Send data to connected monitor
        // socket.emit('monitor_joined', socket.id );





        // // If Board Joined
        // socket.on('board_joined', data => {
        //     // Send data to monitors
        //     console.error('Board Joined', data.length);
        //     socket.emit('board_joined', data );
        // });
        //
        // // If Board Leaved
        // socket.on('leaved_board', data => {
        //     // Send data to monitors
        //     console.error('Board Leaved', data.length);
        //     socket.emit('leaved_board', data );
        // });
        //
        // // If Member joined to Board
        // socket.on('board_joined_member', data => {
        //     // Send data to monitors
        //     socket.emit('board_joined_member', data );
        // });





    });

    // monitorIO.on('disconnect', (socket) => {
    //     dashboardIO.emit('monitor_leaved', socket.id )
    // });
    //
    // monitorIO.on('error', (error) => {
    //     console.error('Socket error:', error);
    // });

}

module.exports = {
    listener,
    fetchBoards
}