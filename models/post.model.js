let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    content: { type: String },
    hashtag: { type: String },
    images: { type: Array },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comments: [
        {
            content: { type: String },
            comment_author: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ]
})

let PostModel = mongoose.model('post', postSchema);

class Post extends PostModel {
    static getListPosts() {
        return new Promise(async (resolve) => {
            let listPosts = await Post.find({}).sort({_id:-1}) 
            .populate ('author')
            if (!listPosts) return resolve({ error: true, message: 'Cannot_get_list' })
            return resolve(listPosts)
        })
    }

    static insert({ _idUser, content, hashtag, originalName }) {
        return new Promise(async (resolve) => {
            try {
                let newPost = new Post({ author: _idUser, content: content, hashtag: hashtag, images: originalName })
                let infoNewPost = await newPost.save(function(err, post){
                    post.populate('author', function(err,post){
                        return resolve({ error: false, data: post })
                    })
                })
            //    let post= await infoNewPost.populate('author')
                // let newPost1= await Post.findOne({author:_idUser})
                // .populate('author')
                // if (!infoNewPost) return resolve({ error: true, message: 'Cannot_Insert_post' })
                // return resolve({ error: false, data: infoNewPost })
            }
            catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    static getAllPostsByID({ _idAuthor }) {
        return new Promise(async (resolve) => {
            try {
                let listPostsOfUser = await Post.find({ author: _idAuthor })
                if (!listPostsOfUser) return resolve({ error: true, message: 'Cannot_get_list' })
                return resolve({ error: false, data: listPostsOfUser })
            }
            catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    static updatePostByID({ _idPost, content, hashtag }) {
        return new Promise(async (resolve) => {
            try {
                let updatePost = await Post.findByIdAndUpdate(_idPost, {
                    
                        content: content,
                        hashtag: hashtag
                    
                }, { new: true })
                if(!updatePost) return resolve({error: true,message:'Cannot_Update_post'})
                return resolve({error: false, data:updatePost})
            }
            catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    static deletePostByID({_idPost}){
        return new Promise(async(resolve)=>{
            try{
                // let findPostID= await Post.findById({_idPost})
                // if(!findPostID)return resolve({error: true, message:"Your_post_is_not_valid"})
                let signalDelete= await Post.findByIdAndRemove(_idPost)
                
                
                if(!signalDelete) return resolve({error:true, message:"Cannot_delete_post"})
                return resolve({error: false, data:signalDelete})
            }
            catch(error){
                return resolve({ error: true, message: error.message })
            }
        })
    }
    static deleteAllPosts(){
        return new Promise(async(resolve)=>{
            try{
                await Post.remove({})
                return resolve({error: false, message: "deleted_all_posts"})
            }
            catch(error){
                return resolve({ error: true, message: error.message })
            }
        })
    }
}


module.exports = Post;