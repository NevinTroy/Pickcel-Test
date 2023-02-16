const mongoose=require('mongoose');

const NewsSchema=new mongoose.Schema({
    title:{
        type:String,
    },
    link:{
        type:String,
    },
    pubDate:{
        type:String,
    },
    image:{
        type:[String],
    },
    description:{
        type:String,
    },
})
module.exports= mongoose.model('News', NewsSchema);
