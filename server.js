const express = require("express")
const { urlencoded, json } = require("body-parser")
const exphbs = require("express-handlebars")
const path = require('path')
const mongoose = require('./database')
const { Diner, Soda } = require('./models/schema')

const app = express()
const PORT = 8000

app.use(urlencoded({ extended: true }))
app.use(json())

app.engine("hbs",
	exphbs({
		defaultLayout: "main",
		layoutsDir: path.join(__dirname, 'views/layouts')
	}))

app.set("view engine", "hbs")

app.use('/app/public', express.static('app/public'))

// Get routes for diner/soda jsons and index page
app.get("/dinerDb", (req, res) => {
	Diner.find({}, (err, data) => {
		if (err) {
			return res.status(500).end()
		}
		res.json(data)
	})
})
app.get("/sodaDb", (req, res) => {
	Soda.find({}, (err, data) => {
		if (err) {
			return res.status(500).end()
		}
		res.json(data)
	})
})
app.get('/', (req, res) => {
	res.render('index')
})

// Get route for diners page to display all diners names
app.get('/diners', (req, res) => {
	Diner.find({}, (err, diners) => {
		if (err) throw err
		let context = {
			diners: diners.map(diner => ({
				_id: diner._id,
				name: diner.name
			}))
		}
		res.render('diners', context)
	})
})

// Form page to add a new diner
app.get('/addDiner', (req, res) => {
	res.render('addDiner')
})

// Selected diner page that displays diner data and populates it's sodas data
app.get('/diners/:id', (req, res) => {
	Diner.find({ _id: req.params.id }, (err, diners) => {
		if (err) throw err
		let context = {
			diners: diners.map(diner => ({
				_id: diner._id,
				name: diner.name,
				location: diner.location,
				sodas: diner.sodas.map(soda => ({
					_id: soda._id,
					name: soda.name
				}))
			}))
		}
		res.render('diner', context)
	}).populate('sodas').exec(err => {
		if (err) return handleError(err);
	})
})

// Get route for sodas page to display all sodas names
app.get('/sodas', (req, res) => {
	Soda.find({}, (err, sodas) => {
		let context = {
			sodas: sodas.map(soda => ({
				_id: soda._id,
				name: soda.name
			}))
		}
		res.render('sodas', context)
	})
})

// Form page to add a new soda
app.get('/addSoda', (req, res) => {
	res.render('addSoda')
})

// Selected diner page displaying sodas not being served
app.get('/diners/:id/sodas', (req, res) => {
	Diner.findById(req.params.id, (err, diners) => {
		if (err) {
			return res.status(500).end()
		}
		Soda.find({ 'diners': { '$nin': [req.params.id] } }, (err, sodas) => {
			if (err) {
				return res.status(500).end()
			}
			let context = {
				diners: diners,
				sodas: sodas.map(soda => ({
					_id: soda._id,
					name: soda.name
				}))
			}
			res.render('addToDiner', context)
		})
	})
})

// Selected soda page that displays soda data and populates it's diners data
app.get('/sodas/:id', (req, res) => {
	Soda.find({ _id: req.params.id }, (err, sodas) => {
		let context = {
			sodas: sodas.map(soda => ({
				_id: soda._id,
				name: soda.name,
				fizziness: soda.fizziness,
				rating: soda.rating,
				diners: soda.diners.map(diner => ({
					_id: diner._id,
					name: diner.name,
					location: diner.location
				}))
			}))
		}
		res.render('soda', context)
	}).populate('diners').exec(err => {
		if (err) return handleError(err);
	})
})

// Post routes to create diners and sodas
app.post("/diners", (req, res) => {
	Diner.insertMany({ name: req.body.name, location: req.body.location }, (err, result) => {
		if (err) {
			return res.status(500).end()
		}
		res.json({ added: req.body.name })
		console.log({ added: req.body.name })
	})
})
app.post("/sodas", (req, res) => {
	Soda.insertMany({ name: req.body.name, fizziness: req.body.fizziness, rating: req.body.rating }, (err, result) => {
		if (err) {
			return res.status(500).end()
		}
		res.json({ added: req.body.name })
		console.log({ added: req.body.name })
	})
})

// Put routes to add soda to diner and diner to soda
app.put('/diners/:id/sodas', (req, res) => {
	Diner.findOneAndUpdate({ _id: req.params.id },
		{ $push: { sodas: { _id: req.body._id } } },
		{ useFindAndModify: false },
		(err, result) => {
			if (err) {
				return res.status(500).end()
			}
			else if (result.changedRows === 0) {
				return res.status(404).end()
			}
			res.status(200).end()
		})

	Soda.findOneAndUpdate({ _id: req.body._id },
		{ $push: { diners: { _id: req.params.id } } },
		{ useFindAndModify: false },
		(err, result) => {
			if (err) {
				return res.status(500).end()
			}
			else if (result.changedRows === 0) {
				return res.status(404).end()
			}
			res.status(200).end()
		})
})

// Put routes to remove soda from diner and diner from soda
app.put('/diners/:id', (req, res) => {
	Diner.findById(req.params.id, (err, diner) => {
		if (err) {
			return res.status(500).end()
		}
		diner.sodas.remove(req.body._id)
		diner.save(err => {
			if (err) {
				return res.status(500).end()
			}
			Soda.findById(req.body._id, (err, soda) => {
				if (err) {
					return res.status(500).end()
				}
				soda.diners.remove(req.params.id)
				soda.save(err => {
					if (err) {
						return res.status(500).end()
					}
				})
			})
		})
	})
	res.status(200).end()
})

// Delete routes to delete diners and sodas
app.delete("/diners/:id", (req, res) => {
	Diner.deleteOne({ _id: req.params.id }, (err, result) => {
		if (err) {
			return res.status(500).end()
		}
		else if (result.affectedRows === 0) {
			return res.status(404).end()
		}
		res.status(200).end()
		console.log({ deleted_id: req.params.id })
	})
})
app.delete("/sodas/:id", (req, res) => {
	Soda.deleteOne({ _id: req.params.id }, (err, result) => {
		if (err) {
			return res.status(500).end()
		}
		else if (result.affectedRows === 0) {
			return res.status(404).end()
		}
		res.status(200).end()
		console.log({ deleted_id: req.params.id })
	})
})

app.listen(PORT, () => {
	console.log("Server listening on: http://localhost:" + PORT)
})