const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
const expressSession = require('express-session');
var cors = require('cors');
const { verifyPromise } = require('./utils/jwt')
const { USER_MODEL } = require('./models/user.model')
/**
 * Import Internal
 */
/**Set view EJS */
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public/'))
// server.use(express.static(path.resolve(__dirname, '../public/')));
// server.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.options('*', cors());



/**
 * Setup express-session
 */
app.use(expressSession({
    secret: 'MERN_STACK_1508',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000
    }
}));
/**Set body-parser */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

const { USER_ROUTER } = require('./controllers/user.router');
app.use('/', USER_ROUTER);
const { POST_ROUTER } = require('./controllers/post.router');
app.use('/', POST_ROUTER);

/**Set default Route */
app.get('/', (req, res) => res.json({ message: 'Hello Word!' }))
app.get('*', (req, res) => res.json({ error: 'Not Found!' }))



/**Connect MongoDB & Start Server */
const uri = `mongodb+srv://thanhandp147:0556274329@cluster0-ybhcl.azure.mongodb.net/test?retryWrites=true&w=majority`;
// const uri = 'mongodb://localhost:27017/MongoDB-Social-Network';
mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`MongoDB connected`);
    server.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
})

let listUserisOnline = []
io.on('connection', function (socket) {
    console.log(socket.id + ': connected');

    socket.on('send_token', async (token) => {
        if (token) {
            let infoUserVerify = await verifyPromise(token);
            let newUserConnect = await USER_MODEL.findByIdAndUpdate(infoUserVerify.data._id, {
                socketID: socket.id,
                isOnline: true
            }, { new: true })
            console.log({ newUserConnect });
            socket.broadcast.emit('send_user_online', newUserConnect);

            let getFriends = await USER_MODEL.findOne({
                _id: infoUserVerify.data._id
            })
                .populate({ path: 'friends', match: { isOnline: { $in: true } } })
            const { friends } = getFriends
            console.log({ friends });

            listUserisOnline = await USER_MODEL.find({
                isOnline: true,
                _id: { $ne: infoUserVerify.data._id }
            })
            socket.emit('send_list_user_is_online', listUserisOnline)
        }
    })

    socket.on('remove_socketid_in_database', async token => {
        if (token) {
            let infoUserVerify = await verifyPromise(token);
            let infoUserLogout = await USER_MODEL.findByIdAndUpdate(infoUserVerify.data._id, {
                $set: {
                    socketID: null
                },
                isOnline: false
            }, { new: true })
            console.log({ infoUserLogout });
            socket.broadcast.emit('send_user_has_logout', infoUserLogout)
        }
    })

    socket.on('disconnect', async () => {
        console.log(socket.id + ': disconnected')
        let infoUserDisconnected = await USER_MODEL.findOneAndUpdate(
            { socketID: socket.id },
            {
                $set: {
                    socketID: null
                },
                isOnline: false
            },
            { new: true }
        )
        console.log({ infoUserDisconnected });
        if (infoUserDisconnected) {
            socket.broadcast.emit('send_user_has_logout', infoUserDisconnected)
        }

    })

});