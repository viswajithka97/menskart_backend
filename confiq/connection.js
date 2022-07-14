const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://asifsaheer:asifsaheer@cluster0.kbyoi.mongodb.net/menscart?retryWrites=true&w=majority'
    const dbname='menscart'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
       
    })
    done()
}
module.exports.get=function(){
    return state.db
}