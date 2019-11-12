const express= require('express')
const server= express();
const bodyParser= require('body-parser');
const mongoose= require('mongoose');
const PORT= process.env.PORT || 3000;
const path= require('path')
// const PORT= 3000;
const expressSession= require('express-session');
var cors = require('cors');
/**
 * Import Internal
 */
/**Set view EJS */
server.set('view engine', 'ejs');
server.set('views', './views');
// server.use( express.static('./public/'))
server.use(express.static(path.resolve(__dirname, './public/')));
// server.use(express.static(path.join(__dirname, 'public')));
server.use(cors());


/**
 * Setup express-session
 */
server.use(expressSession({
    secret: 'MERN_STACK_1508',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000
    } 
}));
/**Set body-parser */
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({}));

const { USER_ROUTER }= require('./controllers/user.router');
server.use('/', USER_ROUTER);
const { POST_ROUTER }= require('./controllers/post.router');
server.use('/', POST_ROUTER );

/**Set default Route */
server.get('/', (req, res) => res.json({ message: 'Hello Word!' }))
server.get('*', (req, res) => res.json({ error: 'Not Found!' }))

/**Connect MongoDB & Start Server */
const uri=`mongodb+srv://thanhandp147:0556274329@cluster0-ybhcl.azure.mongodb.net/test?retryWrites=true&w=majority`;
mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`MongoDB connected`);
    server.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
})