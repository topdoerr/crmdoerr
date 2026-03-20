function waitForElementAndExecute(selector, callback) {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if ($(node).is(selector) || $(node).find(selector).length) {
                    callback();
                    observer.disconnect();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

$(document).ready(function() {
    // Espera pelo botão de edição na página de proposta e executa a função
    waitForElementAndExecute('.proposal_buttons > a:nth-child(1)', function() {
        var whatsappButton  = $('.whatsappSendButton').clone();
        $('.proposal_buttons > a:nth-child(1)').before(whatsappButton);
    });

    // Espera pelo botão de edição na página de orçamento e executa a função
    waitForElementAndExecute('.pull-right._buttons > a:nth-child(1)', function() {
        var whatsappButton  = $('.whatsappSendButton').clone();
        $('.pull-right._buttons > a:nth-child(1)').before(whatsappButton);
    });
});



$(document).ready(function() {
    // Color Picker Tool Js 1
    const dynamicInputs = document.querySelectorAll('input.input-color-picker');
    const handleThemeUpdate = (cssVars) => {
        const root = document.querySelector(':root');
            const keys = Object.keys(cssVars);
            keys.forEach(key => {
            root.style.setProperty(key, cssVars[key]);
        });
    }

    dynamicInputs.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName = `--primary-color`;
            console.log(cssPropName)
            handleThemeUpdate({
            [cssPropName]: e.target.value
            });
        });
    });
});

$(document).ready(function() {
    // Color Picker Tool Js 2
    const dynamicInputs2 = document.querySelectorAll('input.input-color-picker2');
    const handleThemeUpdate = (cssVars) => {
        const root = document.querySelector(':root');
            const keys = Object.keys(cssVars);
            keys.forEach(key => {
            root.style.setProperty(key, cssVars[key]);
        });
    }

    dynamicInputs2.forEach((item) => {
        item.addEventListener('input', (e) => {
            const cssPropName = `--secondary-color`;
            console.log(cssPropName)
            handleThemeUpdate({
            [cssPropName]: e.target.value
            });
        });
    });
});


$(document).ready(function() {
    var checkIframe = setInterval(function() {
        var iframe = document.querySelector('.tox-edit-area iframe');
        if (iframe && iframe.contentDocument && iframe.contentDocument.querySelector('body.mce-content-body')) {
            console.log('Encontrou o iframe e o body.mce-content-body.');
            clearInterval(checkIframe);
            var style = iframe.contentDocument.createElement('style');
            style.textContent = 'body.mce-content-body { color: #fff !important;}';
            iframe.contentDocument.head.appendChild(style);
        } else {
        }
    }, 1000);
});