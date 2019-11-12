const express = require('express');
const router = express.Router();

const { USER_MODEL } = require('../models/user.model');
const POST_MODEL = require('../models/post.model');
const { signPromise, verifyPromise } = require('../utils/jwt')
const UPLOAD_CONFIG = require('../utils/multer.config')
const path = require('path')
const fs =require('fs')

router.route('/posts')
    .get(async (req, res) => {
        let Posts = await POST_MODEL.getListPosts();
        res.json(Posts)
    })
    .post(UPLOAD_CONFIG.single('imagePost'), async (req, res) => {
        let originalName = req.file.originalname;
        let { token, content, hashtag } = req.body;
        console.log(originalName);
        
        let infoUserVerify = await verifyPromise(token);
        if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
        let { _id: _idUser } = infoUserVerify.data
        // let pathOfImagePost= path.resolve(__dirname, `../public/upload/${originalName}`);
        // res.send({_id, content,hashtag,pathOfImagePost})
        let newPost = await POST_MODEL.insert({ _idUser, content, hashtag, originalName });
        let listPosts = await POST_MODEL.getListPosts();
        res.send(listPosts);

    })

router.get('/get_imagePost/:name', async (req, res) => {
    const fileName = req.params.name;
    
    if (!fileName) {
        return res.send({
            status: false,
            message: 'no filename specified',
        })
    }
    let pathOfAvatar = path.resolve(__dirname, `../public/upload/${fileName}`);
    res.sendFile(pathOfAvatar)

})

router.route('/posts/:token')
    .get(async (req, res) => {
        let { token } = req.params;
        let infoUserVerify = await verifyPromise(token);
        if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
        let { _id: _idAuthor } = infoUserVerify.data
        let listPostOfUser = await POST_MODEL.getAllPostsByID({ _idAuthor })
        res.send(listPostOfUser)
    })
    .put(async (req, res) => {
        let { token } = req.params;
        console.log({token});
        
        let { _idPost, content, hashtag } = req.body;
        console.log( { _idPost, content, hashtag });
        
        let infoUserVerify = await verifyPromise(token);
        if (!infoUserVerify) return res.json({ error: true, message: 'Something Wrong!' })
        // let { _id: _idAuthor } = infoUserVerify.data;
        let infoPostAfterUpdated = await POST_MODEL.updatePostByID({ _idPost, content, hashtag });
        let listPostAfterEdit= await POST_MODEL.getListPosts();
        res.send(listPostAfterEdit)
    })
    .delete(async (req, res) => {
        let { token : _idPost } = req.params;
        console.log(_idPost);
        
        // let {postID}= req.body;
        // console.log({postID});
        
        // let { _idPost } = req.body;
        // console.log({ _idPost });
        // let pathOfAvatar = path.resolve(__dirname, `../public/upload/${fileName}`);
        // console.log(pathOfAvatar);
        
        let deleted = await POST_MODEL.deletePostByID({ _idPost })
        // let pathOfAvatar = path.resolve(__dirname, `../public/upload/${deleted.data.images[0]}`);
        // if(pathOfAvatar!=`${path.resolve(__dirname,`../public/upload/undefined`)}`){
        //     fs.readFile(pathOfAvatar,(err,data)=>{
        //         if(data){
        //             fs.unlinkSync(pathOfAvatar)
        //         }
        //     })
        // }
        // res.send(deleted)
        
        let listPostAfterDeleted= await POST_MODEL.getListPosts();
        res.send(listPostAfterDeleted)
    })
// router.get('/abc/:a/:b',(req, res)=>{
//     let a=req.params;
//     res.send(a)
// })

exports.POST_ROUTER = router;