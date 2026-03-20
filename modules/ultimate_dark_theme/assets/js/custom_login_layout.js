document.addEventListener('DOMContentLoaded', function() {
    var originalForm = document.querySelector('.tw-bg-white').innerHTML;
    var originalFormContainer = document.querySelector('.tw-max-w-md');
    if (originalFormContainer) {
        originalFormContainer.style.display = 'none';
    }
    var loginUrl = siteUrl + "/authentication/login";
    var forgotPasswordUrl = siteUrl + "/authentication/forgot_password";
    var customLoginFormHTML = `
        <div class="tw-flex tw-min-h-screen login-h-100" id="teste_aqui">
            <div class="login-column">
                <div class="tw-max-w-md tw-mx-auto" style="display: flex; flex-direction: column;">
                    <div class="company-logo text-center">
                        <img src="${logoUrl}" alt="Company Logo" style="max-width: 300px;">
                    </div>
                    <h1 class="tw-text-2xl tw-text-neutral-800 text-center tw-font-semibold tw-mb-5">${translations.login_heading}</h1>
                    ${originalForm}
                </div>
            </div>
            <div class="image-column" style="background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', customLoginFormHTML);
});
