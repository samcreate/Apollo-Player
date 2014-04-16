var apollo = apollo || {};
apollo.home = function () {
	// =================================================
	// = Private variables (example: var _foo = bar; ) =
	// =================================================

	
	// =================================================
	// = public functions                              =
	// =================================================
	var self = {
		
		init : function (req, res) {

			console.log('[home.js] - initialized'); 

			res.render('index', { title: 'APOLLO home', page:"index" });

		}
		
	};
	
	return self;
	
	
}();

exports.index = apollo.home.init;
