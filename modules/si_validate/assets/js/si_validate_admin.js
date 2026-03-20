$(function(){
	var _validateReq = typeof(validateReq) != 'undefined' ? validateReq : '';	   
	jQuery.validator.addMethod("validatePassword", function(value, element) {
		//var regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_?\W])(?=.{8,})/;
		if($('#password-error').length > 0)
			$(element).parent().parent().find('#password-error').remove();
		return this.optional(element) ||  regularExpression.test(value);
	}, "Fulfill all password requirement");	   
	//add staff
	if($('body').hasClass('member')) {
		$('input[name="password"]').PassRequirements(_validateReq);
		setTimeout(function(){
			$("body").find('input[name="password"]').rules('add', {
				'validatePassword':true,
				errorPlacement: function(error, element) {
					$(error).parent().parent().find('p').remove();
				}
			});
		}, 500);
	}
	//reset admin side password
	if($('body').hasClass('reset-password')) {
		$('input[name="password"]').PassRequirements(_validateReq);
		setTimeout(function(){
			$('form').appFormValidator({
				rules:{
					password:{
						required:true,
						'validatePassword':true,
						errorPlacement: function(error, element) {
							$(error).parent().parent().find('p').remove();
						}
					}
				}
			});
		}, 500);
	}
	//admin side edit profile
	if($('body').hasClass('edit_profile') ) {
		$('input[name="newpassword"]').PassRequirements(_validateReq);
		setTimeout(function(){
			$("body").find('input[name="newpassword"]').rules('add', {
				'validatePassword':true,
				errorPlacement: function(error, element) {
					$(error).parent().parent().find('p').remove();
				}
			});
		}, 500);
	}
	//lead convert to customer
	if($('body').hasClass('leads')) {
		$('#lead_convert_to_customer').on('shown.bs.modal',function(){
			$('input[name="password"]').PassRequirements(_validateReq);
			setTimeout(function(){
				$("body").find('input[name="password"]').rules('add', {
					'validatePassword':true,
					errorPlacement: function(error, element) {
						$(error).parent().parent().find('p').remove();
					}
				});
			}, 500);
		});
	}
	//new client contact by admin
	if($('body').hasClass('customer-profile')) {
		$('#contact_data').on('shown.bs.modal',function(){
			$('input[name="password"]').PassRequirements(_validateReq);
			setTimeout(function(){
				$("body").find('input[name="password"]').rules('add', {
					'validatePassword':true,
				});
			}, 500);
		});
	}
});