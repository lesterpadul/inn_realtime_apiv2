/**
 * - this file will contain the socket events
 * to and from the signaling server
 * - function list for the signaling actions
 */
module.exports = {
	broadcaster: require('./handler.broadcaster.js'),
	viewer: require('./handler.viewer.js'),
	common: require('./handler.common.js')
};