<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-12">
                <div class="panel_s">
                    <div class="panel-body">
                        <h4 class="no-margin">Editar Ciudadano</h4>
                        <hr class="hr-panel-heading"/>

                        <?= form_open(admin_url('modulo_login_tm/login_admin/edit/' . $citizen['id'])) ?>

                        <?= render_input('name', 'Nombre', $citizen['name']) ?>
                        <?= render_input('email', 'Email', $citizen['email']) ?>
                        <?= render_input('phone', 'Teléfono', $citizen['phone']) ?>
                        <?= render_input('password', 'Nuevo Password (opcional)', '', 'password') ?>

                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        <a href="<?= admin_url('modulo_login_tm/login_admin') ?>" class="btn btn-default">Volver</a>

                        <?= form_close() ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
</body>
</html>
