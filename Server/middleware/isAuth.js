import jwt from 'jsonwebtoken';

const isAuth = (req, res, next) => {
    try {
        let {token} = req.cookies

        if(!token) {
            return res.status(401).json({
                message: "User have not valid token"
            });
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if(!verifyToken) {
            return res.status(401).json({
                message: "User does not have valid token"
            });
        }

        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Is Auth error"
        });
    }
}

export default isAuth;