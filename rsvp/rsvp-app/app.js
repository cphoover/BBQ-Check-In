var app = require('express').createServer(),
	io = require('socket.io').listen(app),
	Db = require('mongodb').Db,
	Server = require('mongodb').Server,
	Connection = require('mongodb').Connection,
	debug = require('util').debug;

var port = Connection.DEFAULT_PORT;

var user = 'nodeuser';
var password = '070jvptpMMTKib3tzC6HN6fx6ExKpA71';
var host = 'rsvp-cphoover-data-0.dotcloud.com';  

var port = 28290;



var db = new Db('rsvp', new Server(host, port, {auto_connect:true}));
var ObjectID = db.bson_serializer.ObjectID;

var listAllData = function (err, collection)
	{
		collection.find().toArray(function (err, results)
		{
			console.log(results);
		});
	}


	app.listen(8080);

app.get('/', function (req, res)
{
	res.send('Hi There!!');
});

//i hate how I have to wrap the entire app in this...
db.open(function (err, pClient)
{

	pClient.authenticate(user, password, function (err, data)
	{

		if (data)
		{
			var changeState = function (data)
				{

					db.collection('members', function (error, collection)
					{
						collection.update(
						{
							member: data.member
						}, {
							member: data.member,
							state: data.state
						}, {
							upsert: true
						});
						//db.close();     
					});
				}


			var getMemberData = function (socket)
				{
					db.collection('members', function (error, collection)
					{
						memberData = collection.find(
						{
							'state': "1"
						}, {
							'fields': {
								'member': 1,
								'state': 1,
								'_id': 0
							}
						}).toArray(

						function (err, results)
						{
							socket.emit('loadMemberData', results);
						}); //end function
					}); //end toArray
				}





			io.sockets.on('connection', function (socket)
			{
				getMemberData(socket);


				socket.on('rsvp', function (data)
				{
					if (data.state == 1)
					{
						socket.emit('checkIn', data);
						socket.broadcast.emit('checkIn', data);
						changeState(data);

					}
					else if (data.state == 0)
					{
						socket.emit('checkOut', data);
						socket.broadcast.emit('checkOut', data);
						changeState(data);

					}

				});

			});

		}
		else
		{
			console.log(err);
		}

	});


});