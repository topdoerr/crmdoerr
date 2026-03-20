var _validateReq = typeof(validateReq) != 'undefined' ? validateReq : '';
jQuery.validator.addMethod("validatePassword", function(value, element) {
	//var regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_?\W])(?=.{8,})/;
	return this.optional(element) || regularExpression.test(value);
}, "Fulfill all password requirement");
$(document).ready(function(){
	if($('body').hasClass('customers') && !$('body').hasClass('customers_login')){
		//client profile change password
		if($('body').hasClass('customers') && $('#newpassword').length){
			$('input[name="newpassword"]').PassRequirements(_validateReq);
			$('form').appFormValidator({
				rules:{
					newpassword:{
						required:true,
						'validatePassword':true,
						errorPlacement: function(error, element) {
							$(error).parent().parent().find('p').remove();
						}
					}
				}
			});
		}
		//client registration
		if($('body').hasClass('register')){
			var original_text = $('#register-form').find('[type="submit"]').html();
			$('input[name="password"]').PassRequirements(_validateReq);
			$('#register-form').appFormValidator({
				rules:{
					password:{
						required:true,
						'validatePassword':true,
						errorPlacement: function(error, element) {
							$(error).parent().parent().find('p').remove();
							$('#register-form').find('[type="submit"]').prop('disabled', false);
							$('#register-form').find('[type="submit"]').removeClass('disabled');
							$('#register-form').find('[type="submit"]').html(original_text);
						}
					}
				}
			});
		}
		//client reset password
		if($('body').hasClass('customers') && !$('body').hasClass('register') && $('#password').length && $('#passwordr').length){
			$('input[name="password"]').PassRequirements(_validateReq);
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
		}
	}
});