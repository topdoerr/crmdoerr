<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-12">
                <h4 class="tw-mt-0 tw-font-semibold tw-text-lg tw-text-neutral-700">
                    User Roles
                </h4>
                <hr class="hr-panel-heading" />
<!--                <a href="--><?php //= admin_url('login_roles/create') ?><!--" class="btn btn-primary mbot15">New Role</a>-->

                <div class="panel_s">
                    <div class="panel-body">
                        <?php
                        render_datatable([
                            'ID',
                            'Name',
                        ], 'roles-table');
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
<script>
    const tmAdminBase = admin_url + 'modulo_login_tm/';

    $(function(){
        initDataTable('.table-roles-table', tmAdminBase + 'login_roles', [0], [0]);
    });
</script>
</body>
</html>
