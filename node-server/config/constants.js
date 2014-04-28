// constants.js
// ========
module.exports = 
{
	messages: 
	{
		databaseReadSuccess: { errorCode: 101, message: 'Read successful.' },
		databaseWriteSuccess: { errorCode: 102, message: 'Write successful.' },
		databaseDeleteSuccess: { errorCode: 103, message: 'Delete successful.' },
		userJoinChat: { notification: 'User Joined', message: 'Hey! Look who\s joined us: ' },
		userLeaveChat: { notification: 'User Left', message: 'See you later, ' }
	},

	errorMessages:
	{
		noIdSupplied: { errorCode: -1, message: 'No ID was supplied.' },
		noRowsReturned: { errorCode: -100, message: 'No rows were returned.' },
		databaseReadError: {errorCode: -101, message: 'Error occurred whilst attempting read.'},
		databaseWriteError: {errorCode: -102, message: 'Error occurred whilst attempting write.'},
		databaseDeleteError: {errorCode: -103, message: 'Error occurred whilst attempting delete.'},
		databaseConnectError: {errorCode: -104, message: 'Error occurred whilst attempting db connection.'}
	}
};