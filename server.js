var port = process.env.PORT || 3000,
  io = require('socket.io')(port),
  gameSocket = null

var moment = require('moment') // require

let clients = {}

gameSocket = io.on('connection', function (socket) {
  console.log('socket connected: ' + socket.id)
  clients[socket.id] = { room: null }

  socket.on('disconnect', function () {
    clients[socket.id] = null
    delete clients[socket.id];
    console.log('socket disconnected: ' + socket.id)
  })

  //JoinRoom
  socket.on('joinroom', (req, callback) => {
    const { room } = req
    socket.join(room)
    clients[socket.id].room = room

   // io.to(clients[socket.id].room).emit('updateClients', clients)

    callback({ joined: true })
  })

  //LeaveRoom
  socket.on('leaveroom', (data, callback) => {
    socket.leave(clients[socket.id].room)

    callback('Leave ' + clients[socket.id].room)
    clients[socket.id].room = null
  })
  socket.on('CheckCount', (req, callback) => {
    const { room } = clients[socket.id]
    let a = Object.values(clients)
    let objs = a.filter((x) => x.room === room)
    let result = { users: objs }

    callback(result)
    console.log(result);
  })

  //Login
  socket.on('login', (req, callback) => {
    const { username } = req
    clients[socket.id].username = username
    console.log('Login by' + username)

    callback({
      logined: true,
      error: false,
    })
  })

  //Play
  socket.on('playMusic', function (data) {
    const { room } = clients[socket.id]
    const { song, count } = data

    io.to(room).emit('playMusic', { song: song, count: count })
  })

  //Endsong
  socket.on('endSong', function (data) {
    const { room, username } = clients[socket.id]
    const { song, score, listPersanMissed } = data
    console.log(data)
    clients[socket.id].score = score
    data.username = username
    io.to(room).emit('endSong', data)

    console.log(
      'End Song ' + song + ' score ' + score + ' ' + moment().format(),
    )

   // io.to(clients[socket.id].room).emit('updateClients', clients)
  })
})

//example
/*socket.on('test-event1', function(){
        console.log('got test-event1');
    });

    socket.on('test-event2', function(data){
        console.log('got test-event2');
        console.log(data);

        socket.emit('test-event', {
            test:12345,
            test2: 'test emit event'
        });
    });

    socket.on('test-event3', function(data, callback){
        console.log('got test-event3');
        console.log(data);

        callback({
            test: 123456,
            test2: "test3"
        });
    });*/
