var net = require('net')
var fs = require('fs')
var colors = require('colors')
var server = net.createServer()
var rsvpList = JSON.parse(fs.readFileSync('./rsvp.json'))
var topicList = JSON.parse(fs.readFileSync('./topic.json'))

server.on('connection', function(client) {
	console.log('client connected')
	client.write(colors.rainbow('Welcome to RSVP!'))
	client.write("\n")
	client.write(colors.blue('\n' + 'Topic: ' + topicList[0].topic + '\n' + 'Date: ' + topicList[0].date + '\n'))
	client.setEncoding('utf8')
	client.on('data', function(stringFromClient) {
		var clientRequestArray = stringFromClient.split(" ")

		function reserveSpot() {
			var nameToAdd = clientRequestArray[1].trim()
			var emailToAdd = clientRequestArray[2].trim()
			rsvpList.push({
				name: nameToAdd,
				email: emailToAdd
			})
			fs.writeFile('./rsvp.json', JSON.stringify(rsvpList), function(err) {
				if (err) console.log(err)
			})
			client.write(colors.green("RSVP added\n"))
			client.end()
		}

		function listNumberOfDevs() {
			client.write(colors.red('Developers attending: ' + rsvpList.length + '\n'))
			client.end()
		}

		function adminListRSVP(login, pass) {

			if (login === 'admin' && pass === 'pass') {
				for (var i = 0; i < rsvpList.length; i++) {
					client.write('\n' + colors.blue('RSVP: ' + String(i + 1) + '\n'))
					client.write(colors.red(rsvpList[i].name + '\n'))
					client.write(colors.green(rsvpList[i].email + '\n'))
				}
			}
			client.end()
		}

		function changeTopic(login, pass) {
			topicToChange = clientRequestArray[3].trim()
			dateToChange = clientRequestArray[4].trim()
			var newTopicData = ([{
				topic: topicToChange,
				date: dateToChange
			}])
			if (login === 'admin' && pass === 'pass') {
				topicList.splice(0, 1)
				topicList.push(newTopicData)
			}
			fs.writeFile('./topic.json', JSON.stringify(newTopicData), function(err) {
				if (err) console.log(err)
			})
			client.write(colors.red('Topic and date changed'))
			client.end()
		}

		function removeRSVP(login, pass) {
			if (login === 'admin' && pass === 'pass') {
				for (var i = 0; i <= rsvpList.length; i++) {
					rsvpList.splice(0, 1)
				}
			}
			fs.writeFile('./rsvp.json', JSON.stringify(rsvpList), function(err) {
				if (err) console.log(err)
			})
			client.end()

		}

		switch (clientRequestArray[0].trim()) {
			case 'rsvp':
				reserveSpot()
				break
			case 'list':
				listNumberOfDevs()
				break
			case 'aList':
				var login = clientRequestArray[1].trim()
				var pass = clientRequestArray[2].trim()
				adminListRSVP(login, pass)
				break
			case 'change':
				changeTopic(login, pass)
				break
			case 'remove':
				var login = clientRequestArray[1].trim()
				var pass = clientRequestArray[2].trim()
				removeRSVP(login, pass)
				break
		}

	})
})


server.listen(8124, function() {
	console.log(colors.rainbow('Listening on port 8124'));
})