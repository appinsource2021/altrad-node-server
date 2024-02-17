const helpers = require("../../Deprecated/helpers");
const { dashboardIO, warningIO, monitorIO, boardIO } = require("../Server/namespaces");
const listener = () => {

    warningIO.on('connection', (socket) => {

            // Dashboard/Warining den gelen Signal
            socket.on('warning_fired', data => {
                // Update the Data JSON File
                helpers.setWarningFired( data, () => {

                    // Read Updated JSON File
                    helpers.getWarningFired( data => {
                        console.log('Warning Fired', data );
                        warningIO.emit('warning_fired', data );
                        boardIO.emit('warning_fired', data );

                        // 1245 - Send Signal To Monitoring
                        monitorIO.emit('warning_fired', data );


                        dashboardIO.emit('warning_fired', data );
                    })
                });
        });
    });
}

module.exports = {
    listener
}