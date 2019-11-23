var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//multer
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});  
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if( file.mimetype=="image/bmp" || 
            file.mimetype=="image/png" ||
            file.mimetype=="image/jpg" ||
            file.mimetype=="image/gif" ||
            file.mimetype=="image/jpeg" 
        ){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("file-0");

io.on("connection", function(socket){
    console.log("New connection: " + socket.id);

    socket.on("client-send-hinh", function(data){
        io.sockets.emit("sever-send-hinh", data);
    });

    socket.on("disconnect", function(){
        console.log("Disconnected!");
    });
});

app.get("/", function(req, res){
    res.render("home");
});

app.post("/upload", function(req, res){
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            res.json({"kq":0, "msg":"A Multer error occurred when uploading."});
        } else if (err) {
            res.json({"kq":0, "msg":err});
        }else{
            res.json({"kq":1, "file": req.file.filename});
        }
    });
});