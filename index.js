const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { User } = require('./Models/User');


app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected...")
}).catch( err => {
    console.log(err);
})


app.get('/', (req, res) => res.send("Hello World!!"));

app.post('/register', (req, res) => {
    //회원 가입 할때 필요한 정보들을 client에서 가져오면
    //데이터베이스에 인서트 해준다.
    const user = new User(req.body);

    user.save((err, userInfo) => {
        if(err) {
            return res.json({ success: false, err});
        } else {
            return res.status(200).json({
                success: true
            });
        }
    });
})

app.post('/login',(req,res,next) => {
    //요청된 이메일을 데이터베이스에서 있는지 확인
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) 
        {
            return res.json({
                loginSuccess: false,
                message: "입력하신 이메일은 등록되지 않은 이메일입니다."
            })
        }else
        {
            //데이터베이스에 있다면 비밀번호가 맞는지 확인
            //내가 정의한 함수 위치는 User.js
            user.comparePassword(req.body.password, (err, isMatch) => {
                if(!isMatch)
                {
                    return res.json({
                        loginSuccess: false,
                        message: "비밀번호가 틀렸다 이말이야~"
                    })
                }
                else
                {
                    //비밀번호 까지 맞다면 토큰을 생성하기.
                    user.generateToken((err, user) => {
                        if(err)
                        {
                            return res.status(400).send(err);
                        }
                        //토큰을 저장한다. 어디에?  쿠키, 로컬스토리지
                        res.cookie("x_auth", user.token).status(200).json({
                            loginSuccess: true,
                            message: "로그인 성공이란 이말이야~",
                            userId: user._id
                        })
                    })
                }
            })
        }
    })
    

    
})

app.listen(port, () => console.log (`Example app listening on port ${port}!`));