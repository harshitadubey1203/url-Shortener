const jwt = require("jsonwebtoken");
const secret="Harshita$1203@$"

function setUser(user){
    return jwt.sign({
        _id:user._id,
        email:user.email,
        },
        secret);

}

function getUser(token){
    if(!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        // Handle the error (e.g., token is malformed or expired)
        console.error("Error verifying JWT:", error.message);
        return null;
    }
}

module.exports ={
    setUser,
    getUser,
}