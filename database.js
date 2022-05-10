const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/sodaDiner', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

mongoose.connection.once('open', function () {
	console.log('Connection to database has been made!')
}).on('error', function (error) {
	console.log('Connection error:', error)
})