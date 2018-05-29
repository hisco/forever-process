//This is the file to be forked
setInterval(()=>{
    console.log('sdf')
}  ,100)
setTimeout(()=>{
    process.exit(5)
},5000)