const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //trim? 공백을 없애주는 역할을 한다
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: { //토큰의 유효기간?을 설정하기위함
        type: Number
    }
});

//save 하기전에 거치는곳
userSchema.pre('save', function(next) {
    let user = this;

    if(user.isModified('password'))
    {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) 
            {
                return next(err);
            }
            else 
            {
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if(err) 
                    {
                        return next(err);
                    }
                    else 
                    {
                        user.password = hash;
                        next();
                    }
                })
            }
        })
    }
    else
    {
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err)
        {
            return cb(err);
        }
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    let user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    let token = jwt.sign(user._id.toHexString(), 'secretToken');

    user.token = token;
    user.save(function(err, user) {
        if(err)
        {
            return cb(err);
        }
        cb(null, user);
    })
    
}

userSchema.statics.findByToken = function(token, cb) {
    let user = this;

    //토큰을 decode 한다.

    //user._id + '' + token

    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function (err, user) {
            if(err)
            {
                return cb(err);
            }
            else
            {
                cb(null, user);
            }
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User };