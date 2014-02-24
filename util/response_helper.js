module.exports = exports = function(p_status){
	return {
		success : function(p_res,p_data){
			p_res.json({
				status:'success',
				data: p_data
			});

		},
		error : function(p_res,p_message){
			p_res.json({
				status:'error',
				message: p_message || 'Hey, an unknown error occurd. thanks.'
			});
		}
	}
}();