const isAuthenticated = (req, res, next) => {
    if (req.user) {
        req.id = req.user._id; // or whatever field contains the user ID
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthenticated;