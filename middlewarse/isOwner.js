const isOwner = (req, res, next) => {
    console.log(req.user); // For debugging
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user logged in" });
    }
    if (req.user.role !== 'Owner') {
        return res.status(403).json({ success: false, message: "Unauthorized: Not an Owner" });
    }
    next();
};

module.exports = isOwner;
