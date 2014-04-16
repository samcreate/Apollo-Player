/*! search class
 * Put javascript plugin depedencies below (see main.js for an exmaple)
 * 
 */
var apollo = apollo || {};
apollo.search = function () {
	// =================================================
	// = Private variables (example: var _foo = bar; ) =
	// =================================================

	
	
	// =================================================
	// = public functions                              =
	// =================================================
	var self = {
		
		init : function () {

			debug.group("# [search.js]");

				debug.log('[search.js] - initialized'); 

				//--> sof private functions

				//--> eof private functions

			debug.groupEnd();

		},
		query : function (p_term, p_page, p_callback) {
			$.ajax({ 
			    type: 'GET', 
			    url: '/search/'+p_term+"/"+p_page, 
			    dataType: 'json',
			    success: function (data) { 
			        p_callback(data);
			    }
			});
		}
		
	};
	
	return self;

	
	
	// ================================================
	// = Private functionse (function _private () {}) =
	// ================================================
	function _setupBinds () {
		

	}

	
}();


