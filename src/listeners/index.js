const board = require('./boardListener');
const monitor = require('./monitorListener');
const warning = require('./warningListener');
const dashboard = require('./dashboardListener');

module.exports = {
    board, monitor, warning, dashboard
}