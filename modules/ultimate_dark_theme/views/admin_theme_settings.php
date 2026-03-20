<?php
    defined('BASEPATH') or exit('No direct script access allowed');
    $enabled = get_option('ultimate_dark_theme_customers');
    
    $csrfName = $this->security->get_csrf_token_name();
    $csrfHash = $this->security->get_csrf_hash();
?>

<?php
    $errors = array();
    $success = false;
    if (isset($_POST['submit'])) {
    if (empty($_FILES['login_background_image']['name'])) {
        $errors[] = 'Selecione uma imagem para upload.';
    } else {
        $file_name = $_FILES['login_background_image']['name'];
        $file_size = $_FILES['login_background_image']['size'];
        $file_tmp = $_FILES['login_background_image']['tmp_name'];
        $file_type = $_FILES['login_background_image']['type'];
        $file_ext = strtolower(end(explode('.', $file_name)));

        $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');

        if (!in_array($file_ext, $allowed_extensions)) {
        $errors[] = 'Formato de imagem inválido. Tipos permitidos: ' . implode(', ', $allowed_extensions);
        }

        if ($file_size > 2097152) { // 2MB
        $errors[] = 'Tamanho da imagem excede o limite de 2MB.';
        }
    }

    if (empty($errors)) {
        $new_file_name = uniqid() . '.' . $file_ext;
        $uploads_dir = 'uploads/';
        if (move_uploaded_file($file_tmp, $uploads_dir . $new_file_name)) {
        update_option('login_background_image', $new_file_name);
        $success = true;
        } else {
        $errors[] = 'Erro ao mover o arquivo para o servidor.';
        }
    }
    }
    $background_image_url = get_option('login_background_image');
?>

<script type="text/javascript">
    var csrfName = '<?= $csrfName; ?>';
    var csrfHash = '<?= $csrfHash; ?>';
</script>


<script src="https://cdn.jsdelivr.net/npm/@jaames/iro@5"></script>
<div class="form-group">
    <label for="ultimate_dark_theme_customers" class="control-label clearfix">
        <h5><?php echo _l('upt_enable_dark_theme_for_customers'); ?></h5>
    </label>
    <div class="radio radio-primary radio-inline">
        <input type="radio" id="y_opt_1_ultimate_dark_theme_customers_enabled" name="settings[ultimate_dark_theme_customers]" value="1" <?= ($enabled == '1') ?' checked' : '' ?>>
        <label for="y_opt_1_ultimate_dark_theme_customers_enabled"><?php echo _l('upt_yes'); ?></label>
    </div>
    <div class="radio radio-primary radio-inline">
        <input type="radio" id="y_opt_2_admin-dark_theme_enabled" name="settings[ultimate_dark_theme_customers]" value="0" <?= ($enabled == '0') ?' checked' : '' ?>>
        <label for="y_opt_2_admin-dark_theme_enabled"><?php echo _l('upt_no'); ?></label>
    </div>
</div>
<hr>
<div class="form-group" style="display: flow-root;">
    <label for="ultimate_dark_theme_customers_colors" class="control-label clearfix">
        <h5><?php echo _l('upt_choose_colors_of_your_theme'); ?></h5>
    </label>
    <input type="hidden" id="hidden_primary_color" name="settings[u_t_primary_color]" value="<?php echo get_option('u_t_primary_color'); ?>">
    <input type="hidden" id="hidden_secondary_color" name="settings[u_t_secondary_color]" value="<?php echo get_option('u_t_secondary_color'); ?>">
    <div class="col-md-12" style="min-height: 340px;">
        <div class="row">
            <div class="col-md-4" style="min-height: 320px;">
                <label class="t_s_color" for="favcolor"><?php echo _l('upt_primary_color'); ?></label>
                <div class="input-color-picker" data-id="u_t_primary_color" id="u_t_primary_color" value="<?php echo get_option('u_t_primary_color'); ?>"></div>
            </div>
            <div class="col-md-4" style="min-height: 320px;">
                <label class="t_s_color" for="favcolor"><?php echo _l('upt_secondary_color'); ?></label>
                <div class="input-color-picker2" data-id="u_t_secondary_color" id="u_t_secondary_color" value="<?php echo get_option('u_t_secondary_color'); ?>"></div>
            </div>
        </div>
    </div>
</div>
<hr>

<?php 
    $favIcon = get_option('favicon');
    if ($favIcon != '') {
        $favIconPath = 'uploads/company/' . $favIcon;
    }
    $company_name = get_option('companyname');
?>

<!-- Whatsapp -->
<div class="form-group">
    <label for="ultimate_dark_theme_whatsapp_proposal_btn" class="control-label clearfix">
        <h5><?php echo _l('upt_whatsapp_button_to_send_proposal'); ?></h5>
    </label>
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="whatsapp_greeting_text"><?php echo _l('upt_greeting_text_before_client_name'); ?></label>
                <input type="text" class="form-control" id="whatsapp_greeting_text" name="settings[whatsapp_greeting_text]" placeholder="<?php echo _l('upt_greeting_text_placeholder'); ?>" value="<?php echo get_option('whatsapp_greeting_text'); ?>" oninput="updatePreview('proposal')">
                <small class="form-text text-muted"><?php echo _l('upt_text_appear_greeting_whatsapp_message'); ?></small>
            </div>
            <div class="form-group">
                <label for="whatsapp_message_body"><?php echo _l('upt_body_of_whatsapp_message'); ?></label>
                <input type="text" class="form-control" id="whatsapp_message_body" name="settings[whatsapp_message_body]" placeholder="<?php echo _l('upt_whatsapp_message_body_placeholder'); ?>" value="<?php echo get_option('whatsapp_message_body'); ?>" oninput="updatePreview('proposal')">
                <small class="form-text text-muted"><?php echo _l('upt_the_body_of_whatsapp_message'); ?></small>
            </div>
            <div class="form-group">
                <label for="whatsapp_team_name"><?php echo _l('upt_team_name_on_whatsapp'); ?></label>
                <input type="text" class="form-control" id="whatsapp_team_name" name="settings[whatsapp_team_name]" placeholder="<?php echo _l('upt_team_name_placeholder'); ?>" value="<?php echo get_option('whatsapp_team_name'); ?>" oninput="updatePreview('proposal')">
                <small class="form-text text-muted"><?php echo _l('upt_team_name_appear_whatsapp_message'); ?></small>
            </div>
            <hr>
            <div class="form-group">
                <label for="whatsapp_button_text"><?php echo _l('upt_text_of_whatsapp_button'); ?></label>
                <input type="text" class="form-control" id="whatsapp_button_text" name="settings[whatsapp_button_text]" placeholder="<?php echo _l('upt_whatsapp_button_text_placeholder'); ?>" value="<?php echo get_option('whatsapp_button_text'); ?>" oninput="updatePreview('proposal')">
                <small class="form-text text-muted"><?php echo _l('upt_text_appear_on_whatsapp_button_proposal_page'); ?></small>
            </div>
        </div>
        <div class="col-md-1"></div>
        <div class="col-md-4">
        <div class="chat">
                <div class="chat-container">
                <div class="user-bar">
                    <div class="avatar">
                    <?php echo '<img src="' . base_url($favIconPath) . '" alt="Favicon">'; ?>
                    </div>
                    <div class="name">
                    <span><?php echo $company_name; ?></span>
                    <span class="status">online</span>
                    </div>
                </div>
                <div class="conversation">
                <div class="conversation-container">
                    <div id="whatsapp_preview" class="message sent">
                            <p id="preview_greeting_text"><b><?php echo get_option('whatsapp_greeting_text'); ?> {first_name},</b></p>
                            <p id="preview_message_body"><?php echo get_option('whatsapp_message_body'); ?></p>
                            <p id="preview_link">{proposal_link}</p>
                            <p id="preview_team_name"><b>{business_name}</b></p>
                        <span class="metadata">
                            <span class="time"></span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.365 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg></span>
                        </span>
                    </div>
                    </div>
                </div>
                </div>
            </div>

        </div>
    </div>
</div>
<hr>
<div class="form-group">
    <label for="ultimate_dark_theme_whatsapp_estimate_btn" class="control-label clearfix">
        <h5><?php echo _l('upt_whatsapp_button_to_send_estimates'); ?></h5>
    </label>
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="whatsapp_estimate_greeting_text"><?php echo _l('upt_greeting_text_before_client_name'); ?></label>
                <input type="text" class="form-control" id="whatsapp_estimate_greeting_text" name="settings[whatsapp_estimate_greeting_text]" placeholder="<?php echo _l('upt_greeting_text_placeholder'); ?>" value="<?php echo get_option('whatsapp_estimate_greeting_text'); ?>" oninput="updatePreview('estimate')">
                <small class="form-text text-muted"><?php echo _l('upt_text_appear_greeting_whatsapp_message_estimate'); ?></small>
            </div>
            <div class="form-group">
                <label for="whatsapp_estimate_message_body"><?php echo _l('upt_body_of_whatsapp_message'); ?></label>
                <input type="text" class="form-control" id="whatsapp_estimate_message_body" name="settings[whatsapp_estimate_message_body]" placeholder="<?php echo _l('upt_whatsapp_message_body_placeholder_estimate'); ?>" value="<?php echo get_option('whatsapp_estimate_message_body'); ?>" oninput="updatePreview('estimate')">
                <small class="form-text text-muted"><?php echo _l('upt_the_body_of_whatsapp_message_estimate'); ?></small>
            </div>
            <div class="form-group">
                <label for="whatsapp_estimate_team_name"><?php echo _l('upt_team_name_on_whatsapp'); ?></label>
                <input type="text" class="form-control" id="whatsapp_estimate_team_name" name="settings[whatsapp_estimate_team_name]" placeholder="<?php echo _l('upt_team_name_placeholder'); ?>" value="<?php echo get_option('whatsapp_estimate_team_name'); ?>" oninput="updatePreview('estimate')">
                <small class="form-text text-muted"><?php echo _l('upt_team_name_appear_whatsapp_message_estimate'); ?></small>
            </div>
            <hr>
            <div class="form-group">
                <label for="whatsapp_estimate_button_text"><?php echo _l('upt_text_of_whatsapp_button'); ?></label>
                <input type="text" class="form-control" id="whatsapp_estimate_button_text" name="settings[whatsapp_estimate_button_text]" placeholder="<?php echo _l('upt_whatsapp_button_text_placeholder'); ?>" value="<?php echo get_option('whatsapp_estimate_button_text'); ?>" oninput="updatePreview('estimate')">
                <small class="form-text text-muted"><?php echo _l('upt_text_appear_on_whatsapp_button_estimate_page'); ?></small>
            </div>
        </div>
        <div class="col-md-1"></div>
        <div class="col-md-4">
            <div class="chat">
                <div class="chat-container">
                <div class="user-bar">
                    <div class="avatar">
                    <?php echo '<img src="' . base_url($favIconPath) . '" alt="Favicon">'; ?>
                    </div>
                    <div class="name">
                    <span><?php echo $company_name; ?></span>
                    <span class="status">online</span>
                    </div>
                </div>
                <div class="conversation">
                    <div class="conversation-container">
                    <div id="whatsapp_estimate_preview" class="message sent">
                            <p id="preview_estimate_greeting_text"><b><?php echo get_option('whatsapp_estimate_greeting_text'); ?> {first_name},</b></p>
                            <p id="preview_estimate_message_body"><?php echo get_option('whatsapp_estimate_message_body'); ?></p>
                            <p id="preview_estimate_link">{estimate_link}</p>
                            <p id="preview_estimate_team_name"><b>{business_name}</b></p>
                        <span class="metadata">
                            <span class="time"></span><span class="tick"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg></span>
                        </span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</div>
<hr>
<h5><?php echo _l('upt_background_image_login_password_area'); ?></h5>
<br>
<div class="form-group">
    <label for="login_background_image"><?php echo _l('upt_login_background_image'); ?> <small>(1500px * 1115px)</small></label>
    <input type="file" id="login_background_image" name="login_background_image" class="form-control-file">
    <?php
    $background_image = get_option('login_background_image');
    if (empty($background_image)) {
        $background_image = 'crm-bg-01.jpg';
    }
    ?>
    <img id="background_image_preview" src="<?php echo base_url('modules/ultimate_dark_theme/uploads/login_background/' . $background_image); ?>" style="max-width:100%; margin-top: 20px;"/>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        var loginBackgroundImage = document.getElementById('login_background_image');

        if (loginBackgroundImage) {
            loginBackgroundImage.addEventListener('change', function() {
                uploadBackgroundImage();
            });
        }

        function uploadBackgroundImage() {
            var fileInput = document.getElementById('login_background_image');
            if (fileInput.files.length > 0) {
                var file = fileInput.files[0];
                var allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                var maxSize = 2048 * 1024; // 2MB

                if (!allowedTypes.includes(file.type)) {
                    alert('<?= _l("error_file_type_not_allowed"); ?>');
                    return;
                }

                if (file.size > maxSize) {
                    alert('<?= _l("error_file_too_large"); ?>');
                    return;
                }

                var formData = new FormData();
                formData.append('login_background_image', file);
                formData.append('<?= $csrfName; ?>', '<?= $csrfHash; ?>');

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '<?= site_url("ultimate_dark_theme/ultimate_dark_theme_admin/upload_background_image"); ?>', true);

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            var preview = document.getElementById('background_image_preview');
                            preview.setAttribute('src', '<?= base_url("modules/ultimate_dark_theme/uploads/login_background/"); ?>' + response.file_path);
                            alert('<?= _l("upload_image_success"); ?>');
                        } else {
                            alert(response.message);
                        }
                    } else {
                        console.error('Erro ao fazer upload:', xhr.responseText);
                        alert('<?= _l("error_uploading_file"); ?>');
                    }
                };

                xhr.send(formData);
            }
        }
    });
</script>

<script>
function updatePreview(type) {
    let greetingText, messageBody, buttonText, teamName;

    if (type === 'proposal') {
        greetingText = document.getElementById('whatsapp_greeting_text').value;
        messageBody = document.getElementById('whatsapp_message_body').value;
        buttonText = document.getElementById('whatsapp_button_text').value;
        teamName = document.getElementById('whatsapp_team_name').value;
        document.getElementById('preview_greeting_text').textContent = greetingText + ' {first_name},';
        document.getElementById('preview_message_body').textContent = messageBody;
        document.getElementById('preview_link').textContent = '{proposal_link}';
        document.getElementById('preview_team_name').textContent = teamName;
    } else if (type === 'estimate') {
        greetingText = document.getElementById('whatsapp_estimate_greeting_text').value;
        messageBody = document.getElementById('whatsapp_estimate_message_body').value;
        buttonText = document.getElementById('whatsapp_estimate_button_text').value;
        teamName = document.getElementById('whatsapp_estimate_team_name').value;
        document.getElementById('preview_estimate_greeting_text').textContent = greetingText + ' {first_name},';
        document.getElementById('preview_estimate_message_body').textContent = messageBody;
        document.getElementById('preview_estimate_link').textContent = '{estimate_link}';
        document.getElementById('preview_estimate_team_name').textContent = teamName;
    }
}
</script>

<style>
    .chat {
        height: 300px;
    }

    .chat-container {
        height: 100%;
    }

    .user-bar {
        height: 55px;
        background: #005e54;
        color: #fff;
        padding: 0 8px;
        font-size: 24px;
        position: relative;
        z-index: 1;
        border-radius: 10px 10px 0 0;
    }

    .user-bar:after {
        content: "";
        display: table;
        clear: both;
    }

    .user-bar div {
        float: left;
        transform: translateY(-50%);
        position: relative;
        top: 50%;
    }

    .user-bar .actions {
        float: right;
        margin: 0 0 0 20px;
    }

    .user-bar .actions.more {
        margin: 0 12px 0 32px;
    }

    .user-bar .actions.attachment {
        margin: 0 0 0 30px;
    }

    .user-bar .actions.attachment i {
        display: block;
        transform: rotate(-45deg);
    }

    .user-bar .avatar {
        margin: 0 0 0 5px;
        width: 36px;
        height: 36px;
    }

    .user-bar .avatar img {
        border-radius: 50%;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
        display: block;
        width: 100%;
        background: #fff;
        padding: 8px;
    }

    .user-bar .name {
        font-size: 17px;
        font-weight: 600;
        text-overflow: ellipsis;
        letter-spacing: 0.3px;
        margin: 0 0 0 8px;
        overflow: hidden;
        white-space: nowrap;
        width: 220px;
    }

    .user-bar .status {
        display: block;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0;
    }

    .conversation {
        height: calc(100% - 12px);
        position: relative;
        background: #efe7dd url(/modules/ultimate_dark_theme/assets/image/bg-whats.jpg) repeat;
        z-index: 0;
        border-radius: 0 0 10px 10px;
    }

    .conversation ::-webkit-scrollbar {
        transition: all .5s;
        width: 5px;
        height: 1px;
        z-index: 10;
    }

    .conversation ::-webkit-scrollbar-track {
        background: transparent;
    }

    .conversation ::-webkit-scrollbar-thumb {
        background: #b3ada7;
    }

    .conversation .conversation-container {
        height: calc(100% - 68px);
        box-shadow: inset 0 10px 10px -10px #000000;
        overflow-x: hidden;
        padding: 0 16px;
        margin-bottom: 5px;
    }

    .conversation .conversation-container:after {
        content: "";
        display: table;
        clear: both;
    }

    .message {
        color: #000;
        clear: both;
        line-height: 18px;
        font-size: 15px;
        padding: 8px;
        position: relative;
        margin: 8px 0;
        max-width: 85%;
        word-wrap: break-word;
        z-index: -1;
    }

    .message:after {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
    }

    .metadata {
        display: inline-block;
        float: right;
        padding: 0 0 0 7px;
        position: relative;
        bottom: -4px;
    }

    .metadata .time {
        color: rgba(0, 0, 0, .45);
        font-size: 11px;
        display: inline-block;
    }

    .metadata .tick {
        display: inline-block;
        margin-left: 2px;
        position: relative;
        top: 4px;
        height: 16px;
        width: 16px;
    }

    .metadata .tick svg {
        position: absolute;
        transition: .5s ease-in-out;
    }

    .metadata .tick svg:first-child {
        -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
        -webkit-transform: perspective(800px) rotateY(180deg);
                transform: perspective(800px) rotateY(180deg);
    }

    .metadata .tick svg:last-child {
        -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
        -webkit-transform: perspective(800px) rotateY(0deg);
                transform: perspective(800px) rotateY(0deg);
    }

    .metadata .tick-animation svg:first-child {
        -webkit-transform: perspective(800px) rotateY(0);
                transform: perspective(800px) rotateY(0);
    }

    .metadata .tick-animation svg:last-child {
        -webkit-transform: perspective(800px) rotateY(-179.9deg);
             transform: perspective(800px) rotateY(-179.9deg);
    }

    .message:first-child {
        margin: 16px 0 8px;
    }

    .message.sent {
        background: #e1ffc7;
        border-radius: 5px 0px 5px 5px;
        float: right;
    }

    .message.sent:after {
        border-width: 0px 0 10px 10px;
        border-color: transparent transparent transparent #e1ffc7;
        top: 0;
        right: -10px;
    }
</style>

<script>
    var background_image_url = "<?php echo base_url('modules/ultimate_dark_theme/uploads/' . get_option('login_background_image')); ?>";
</script>

<script>
var primaryColorPicker = new iro.ColorPicker("#u_t_primary_color", {
        width: 200,
        color: "<?php echo get_option('u_t_primary_color'); ?>"
    });

    primaryColorPicker.on('color:change', function(color) {
        document.documentElement.style.setProperty('--primary-color', color.rgbString);
        document.getElementById('hidden_primary_color').value = color.rgbString;
    });

    var secondaryColorPicker = new iro.ColorPicker("#u_t_secondary_color", {
        width: 200,
        color: "<?php echo get_option('u_t_secondary_color'); ?>"
    });

    secondaryColorPicker.on('color:change', function(color) {
        document.documentElement.style.setProperty('--secondary-color', color.rgbString);
        document.getElementById('hidden_secondary_color').value = color.rgbString;
    });
</script>