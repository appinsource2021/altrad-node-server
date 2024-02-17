const {io} = require("./Main")
const boardIO = io.of('/board');
const monitorIO = io.of('/monitor');
const warningIO = io.of('/warning');
const dashboardIO = io.of('/dashboard');
module.exports = {
    boardIO, monitorIO, warningIO, dashboardIO
}