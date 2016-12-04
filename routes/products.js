exports.home = function(res, req, next){
	res.render('home');
};
exports.roomMonitor = function(res, req, next){
	res.render('gatheredInfo');
};
