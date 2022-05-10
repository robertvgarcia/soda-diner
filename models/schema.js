const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SodaSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: String,
	fizziness: Number,
	rating: Number,
	diners: [{ type: Schema.Types.ObjectId, ref: 'Diner' }]	
})

const DinerSchema = new Schema({
	name: String,
	location: String,
	sodas: [{ type: Schema.Types.ObjectId, ref: 'Soda' }]
})

const Soda = mongoose.model('Soda', SodaSchema)
const Diner = mongoose.model('Diner', DinerSchema)

module.exports = { Diner, Soda }