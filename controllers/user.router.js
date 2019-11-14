const express = require('express');
const router = express.Router();


const { USER_MODEL } = require('../models/user.model');
const POST_MODEL = require('../models/post.model')
const { TOKEN_CONFIRM_MODEL } = require('../models/token.confirm')
const validateRegisterInput = require('../validation/register.validate');
const validateLoginInput = require('../validation/login.validate');
const { signPromise, verifyPromise } = require('../utils/jwt')
const nodemailer = require('nodemailer');

const multer = require('multer');
const path = require('path');
// const fs = require('fs');
const UPLOAD_CONFIG = require('../utils/multer.config')
const fs = require('fs')


router.get('/delete_all_database', async (req, res) => {
    await USER_MODEL.remove({})
    await TOKEN_CONFIRM_MODEL.remove({})
    await POST_MODEL.deleteAllPosts()
})


router.get('/get-token/:token_register', async (req, res) => {
    const { token_register } = req.params;
    // console.log(token_register);

    let isMatch = await TOKEN_CONFIRM_MODEL.findOne({
        _userId: token_register
    })
    if (!isMatch) return res.json(`Something wrong`)
    let infoUserAfterUpdate = await USER_MODEL.findByIdAndUpdate(token_register, {
        $set: {
            comfirmed: true
        }
    }, { new: true });

    res.json(`awjdkajdkawjdkawjdkawd`)

})

router.route('/register')
    // .get((req, res) => {
    //     res.render('demodangki')
    // })
    .post(async (req, res) => {
        const data = req.body;
        const { username, password, fullname, email } = data;


        const { errors, isValid } = validateRegisterInput(data);
        // console.log(errors);

        await USER_MODEL.findOne({ username }).then(user => {
            if (user) {
                // errors.exist= "Username is Exist";
                errors.unshift("Username is Exist");
            }
        })

        if (errors.length > 0) {
            res.status(200).send(errors);
        }
        else {
            const newUser = new USER_MODEL({
                username,
                email,
                fullname,
                password
            })
            await newUser
                .save()
                .then(() => console.log('Done'))
                .catch(err => console.log(err));
            res.status(201).send()

            /**Create TOKEN */
            let userCurr = await USER_MODEL.findOne({
                username: username
            })

            var token = new TOKEN_CONFIRM_MODEL({ _userId: userCurr._id, token: Math.random().toString(36).substring(7) });
            console.log('----------');


            await token.save();


            /**Send Email  */
            var transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "thanhandp147@gmail.com",
                    pass: "an0556274329"
                }
            });
            const mailOptions = {
                from: 'sender@email.com', // sender address
                to: email, // list of receivers
                subject: 'Subject of your email', // Subject line
                // html: `<a>http://localhost:3000/get-token/${token._userId}</a>`// plain text body
                html: `<a>https://server-project-1.herokuapp.com/get-token/${token._userId}</a>`// plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });
        }

    })


router.route('/login')
    .post(async (req, res) => {
        const data = req.body;
        // console.log(req.body.usernameLogin);



        const { errors, isValid } = validateLoginInput(data);
        const { usernameLogin: username, passwordLogin: password } = data;

        if (errors.length > 0) {
            // res.status(203).send(errors);
            return res.send({
                text: 'login_fail',
                errors
            });
        }

        let isExistUser = await USER_MODEL.findOne({ username });

        if (!isExistUser) {
            errors.push('Sai tên đăng nhập');
            return res.send({
                text: 'login_fail',
                errors
            });
        }
        const { password: hashPwd } = isExistUser;
        let isMatch = password == hashPwd;

        if (!isMatch) {
            errors.push('Sai mật khẩu, vui lòng nhập lại');
            // return res.status(201).send(errors);
            // return res.send(errors);
            return res.send({
                text: 'login_fail',
                errors
            });
        }


        // res.status(202).send();
        if (!isExistUser.comfirmed) {
            errors.push('Your email is not confirmed');
            return res.send({
                text: 'login_fail',
                errors

            })
        } else {

            const { email, fullname, birthday, phone, avatar } = isExistUser;



            let resultExistUsername = {
                username: isExistUser.username,
                _id: isExistUser._id
            }
            let signalSignToken = await signPromise(resultExistUsername);
            if (signalSignToken.error) return res.json({ error: true, message: 'something wrong' });
            const { token } = signalSignToken;
            // console.log({ token });
            let listPosts = await POST_MODEL.getListPosts();
            // return res.send(listPosts)


            return res.send({
                text: 'login_success',
                data: {
                    username: isExistUser.username,
                    token: token,
                    email,
                    fullname,
                    birthday,
                    phone,
                    avatar,
                    listPosts
                }
            })
        }

    })

router.post('/refresh-page', async (req, res) => {
    let { token } = req.body;
    let infoUserVerify = await verifyPromise(token);
    let usernameToken = infoUserVerify.data.username;
    //check token
    let infoUserDB = await USER_MODEL.findOne({
        username: usernameToken
    })
    if (infoUserDB) {
        const { fullname, email, birthday, phone, avatar } = infoUserDB;
        let signalSignToken = await signPromise(infoUserVerify);
        if (infoUserVerify.error) return res.json({ error: true, message: 'something_wrong' });
        let listPosts = await POST_MODEL.getListPosts();
        const { token } = signalSignToken;
        return res.json({
            error: false, data: {
                username: infoUserVerify.data.username,
                token: token,
                fullname,
                email,
                birthday,
                phone,
                avatar,
                listPosts
            }
        })
    }
})

router.post('/update_password', async (req, res) => {
    const { password1, password2, token } = req.body;


    let infoUserVerify = await verifyPromise(token);

    let infoUserCurr = await USER_MODEL.findOne({
        username: infoUserVerify.data.username
    })

    let isMatch = infoUserCurr.password == password1;
    if (!isMatch) {

        return res.send({
            flag: 'not_match_DB',
            data: ['Mật khẩu hiện tại không trùng khớp']
        })
    } else {
        console.log('-------------');

        await USER_MODEL.findOneAndUpdate(
            { username: infoUserVerify.data.username },
            { $set: { password: password2 } },
            { new: true },
            function (err, doc) {
            }
        )
        return res.send({
            flag: 'success',
            data: 'Cập nhật mật khẩu thành công'
        })
    }
})

router.post('/update_info', async (req, res) => {
    let { birthday, phone, token } = req.body;

    let infoUserVerify = await verifyPromise(token);

    let infoUserCurr = await USER_MODEL.findOne({
        username: infoUserVerify.data.username
    })

    if (birthday == '') {
        birthday = infoUserCurr.birthday
    }
    if (phone == '') {
        phone = infoUserCurr.phone
    }
    // console.log({ birthday, phone });


    // console.log(infoUserCurr);
    let infoUserAfterUpdate = await USER_MODEL.findOneAndUpdate(
        { username: infoUserVerify.data.username },
        {
            $set: {
                birthday: birthday,
                phone: phone
            }
        }, { new: true }
    )
    // console.log(infoUserAfterUpdate);

    return res.send({
        flag: 'success',
        data: {
            birthday: infoUserAfterUpdate.birthday,
            phone: infoUserAfterUpdate.phone
        }
    })
})



router.post('/update_avatar', UPLOAD_CONFIG.single('avatar'), async (req, res) => {
    let originalname = req.file.originalname;

    let infoUserVerify = await verifyPromise(req.body.token);

    let infoUserCurr = await USER_MODEL.findOne({
        username: infoUserVerify.data.username
    })


    let pathOfAvatar = path.resolve(__dirname, `../public/upload/${infoUserCurr.avatar}`);
    if (pathOfAvatar != `${path.resolve(__dirname, `../public/upload/undefined`)}`) {
        fs.readFile(pathOfAvatar, (err, data) => {

            if (data) {
                fs.unlinkSync(pathOfAvatar)
            }
        })

    }


    let x = await USER_MODEL.findOneAndUpdate(
        { username: infoUserVerify.data.username },
        {
            $set: {
                avatar: req.file.originalname
            }
        }, { new: true }
    )

    res.send(originalname)

})

router.get('/get_avatar/:name', async (req, res) => {
    const fileName = req.params.name;


    // console.log(fileName)
    if (!fileName) {
        return res.send({
            status: false,
            message: 'no filename specified',
        })
    }
    let pathOfAvatar = path.resolve(__dirname, `../public/upload/${fileName}`);
    let undefinePath = path.resolve(__dirname, `../public/upload/undefined`)

    if (pathOfAvatar == undefinePath) {
        return
    } else {
        res.sendFile(pathOfAvatar)
    }
    // if(pathOfAvatar)
    // res.sendFile(pathOfAvatar)

})


// API FRIENDS
router.get('/get_all_users/:tokenUserCurr', async (req, res) => {
    const { tokenUserCurr } = req.params;
    // console.log({tokenUserCurr});

    let infoUserVerify = await verifyPromise(tokenUserCurr);
    // console.log({ infoUserVerify });

    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let listUsers = await USER_MODEL.find({
        username: { $ne: infoUserVerify.data.username },
        friends: { $ne: infoUserVerify.data._id },
        guestsRequest: { $ne: infoUserVerify.data._id },
        usersRequest: { $ne: infoUserVerify.data._id }
    })
    let infoFriendsOfUser = await USER_MODEL.findOne({
        username: infoUserVerify.data.username
    }).populate('guestsRequest')
        .populate('usersRequest')
        .populate('friends')
    const { guestsRequest, usersRequest, friends } = infoFriendsOfUser

    res.send({ data: { guestsRequest, usersRequest, friends, listUsers } })
})

router.post('/request_add_friend', async (req, res) => {
    const { token, _idReceiver } = req.body;
    let infoUserVerify = await verifyPromise(token);
    // console.log({ infoUserVerify });

    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let _idSender = infoUserVerify.data._id;
    // console.log({ _idSender, _idReceiver });
    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idSender, {
        $addToSet: {
            usersRequest: _idReceiver
        }
    }, { new: true })

    let infoUserReceiverAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idReceiver, {
        $addToSet: {
            guestsRequest: _idSender
        }
    }, { new: true })

    res.send({ error: false, data: infoUserReceiverAfterUpdated })
})

// CHinh Sua: Hoan Tac yeu Cau Ket Ban
router.post('/request_remove_friend', async (req, res) => {
    const { token, _idReceiver } = req.body;
    let infoUserVerify = await verifyPromise(token);
    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let _idSender = infoUserVerify.data._id;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idSender, {
        $pull: {
            usersRequest: _idReceiver
        }
    }, { new: true })

    let infoUserReceiverAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idReceiver, {
        $pull: {
            guestsRequest: _idSender
        }
    }, { new: true })
    res.send({ error: false, data: infoUserReceiverAfterUpdated })
})

// CHap nhan loi moi ket ban
router.post('/resolve_friend', async (req, res) => {
    const { token, _idReceiver } = req.body;
    let infoUserVerify = await verifyPromise(token);
    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let _idSender = infoUserVerify.data._id;

    
    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idSender, {
        $addToSet: {
            friends: _idReceiver
        },
        $pull: {
            guestsRequest: _idReceiver
        }
    }, { new: true })

    let infoUserReceiverAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idReceiver, {
        $addToSet: {
            friends: _idSender
        },
        $pull: {
            usersRequest: _idSender
        }
    }, { new: true })

    res.send({ error: false, data: infoUserReceiverAfterUpdated })
})

// Chinh sua: Khong chap nhan loi moi ket ban
router.post('/reject_friend', async (req, res) => {
    const { token, _idReceiver } = req.body;
    let infoUserVerify = await verifyPromise(token);
    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let _idSender = infoUserVerify.data._id;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idSender, {
        $pull: {
            guestsRequest: _idReceiver
        }
    }, { new: true })

    let infoUserReceiverAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idReceiver, {
        $pull: {
            usersRequest: _idSender
        }
    }, { new: true })

    res.send({ error: false, data: infoUserReceiverAfterUpdated })
})

// CHinh sua: Huy ban be
router.post('/un_friend', async (req, res) => {
    const { token, _idReceiver } = req.body;
    let infoUserVerify = await verifyPromise(token);
    if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
    let _idSender = infoUserVerify.data._id;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idSender, {
        $pull: {
            friends: _idReceiver
        }
    }, { new: true })

    let infoUserReceiverAfterUpdated = await USER_MODEL.findByIdAndUpdate(_idReceiver, {
        $pull: {
            friends: _idSender
        }
    }, { new: true })

    res.send({ error: false, data:infoUserReceiverAfterUpdated })
})

exports.USER_ROUTER = router;