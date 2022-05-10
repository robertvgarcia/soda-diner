// Add diner and display page using json
$('#addDiner').submit(e => {
	e.preventDefault()
	$.post('/diners', {
		name: $('#name').val().trim(),
		location: $('#location').val().trim()
	})
	$.getJSON('/dinerDb', diners => {
		location.replace('/diners/' + diners[diners.length - 1]._id)
	})
})

// Add soda and display page using json
$('#addSoda').submit(e => {
	e.preventDefault()
	$.post('/sodas', {
		name: $('#sodaName').val().trim(),
		fizziness: $('#fizziness').val(),
		rating: $('#rating').val()
	})
	$.getJSON('/sodaDb', sodas => {
		location.replace('/sodas/' + sodas[sodas.length - 1]._id)
	})
})

// Add soda to diner
$('.addToDiner').click(function () {
	let dinerId = $('.thisDiner').data('dinerid')
	let sodaId = $(this).data('sodaid')
	let soda = {
		_id: sodaId
	}
	$.ajax('/diners/' + dinerId + '/sodas', {
		type: 'PUT',
		data: soda
	})
	location.replace('/diners/' + dinerId)
})

// Remove soda from diner
$('.removeFromDiner').click(function () {
	let id = $('.thisDiner').data('dinerid')
	let sodaId = $(this).data('soda')
	let soda = {
		_id: sodaId
	}
	$.ajax('/diners/' + id, {
		type: 'PUT',
		data: soda
	})
	location.reload()
})

//Delete diner and return to diners page
$('#delDiner').click(function () {
	$.ajax('/diners/' + $(this).data('_id'), {
		type: 'DELETE'
	})
	location.replace('/diners')
})

// Delete soda and return to sodas page
$('#delSoda').click(function () {
	$.ajax('/sodas/' + $(this).data('_id'), {
		type: 'DELETE'
	})
	location.replace('/sodas')
})