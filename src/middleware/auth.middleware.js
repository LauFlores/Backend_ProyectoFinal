const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
};

const isUser = (req, res, next) => {
    if (req.session.user && (req.session.user.role === "user" || req.session.user.role === "premium")) {
        next();
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
};

const isPremium = (req, res, next) => {
    if (req.session.user && req.session.user.role === "premium") {
        next();
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
};

const isAdminOrPremium = (req, res, next) => {
    if (req.session.user && (req.session.user.role === "admin" || req.session.user.role === "premium")) {
        next();
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
};

const isAuthenticated = (req, res, next) => {
    res.locals.isAuthenticated = req.session.user ? true : false;
    next();
};

module.exports = { isAdmin, isUser, isAuthenticated, isPremium, isAdminOrPremium };
