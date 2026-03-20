<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div id="alerts"></div>
    <div class="content">
        <div class="row">
            <div class="col-md-12">
                <div class="panel_s">
                    <div class="panel-body">
                        <?php
                        render_datatable([
                            'ID',
                            'Name',
                            'Email',
                            'Phone',
                            'Role',
                            'Actions',
                        ], 'citizens-table');
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

    $(function () {
        initDataTable('.table-citizens-table', tmAdminBase + 'login_admin', [0], [0]);
    });

    $(document).ready(function () {
        $(document).on('change', '.role-select', function () {
            var userId = $(this).data('user-id');
            var newRoleId = $(this).val();

            $.post(tmAdminBase + 'login_admin/change_role', {
                user_id: userId,
                role_id: newRoleId
            }).done(function (response) {
                response = JSON.parse(response);
                if (response.success) {
                    alert_float('success', 'Rol Updated');
                } else {
                    alert_float('danger', 'Error updating role');
                }
            });
        });

        // Delete with confirmation modal
        $('body').on('click', '.btn-delete-citizen', function (e) {
            e.preventDefault();
            var id = $(this).data('id');
            $('#confirmDeleteModal').data('id', id).modal('show');
        });

        $('#confirmDeleteBtn').on('click', function () {
            var id = $('#confirmDeleteModal').data('id');
            $.post(tmAdminBase + 'login_admin/delete', { id: id }).done(function (response) {
                response = JSON.parse(response);
                if (response.success) {
                    $('.table-citizens-table').DataTable().ajax.reload(null, false);
                    alert_float('success', 'Citizen deleted');
                } else {
                    alert_float('danger', 'Could not delete');
                }
                $('#confirmDeleteModal').modal('hide');
            }).fail(function(){
                alert_float('danger', 'Network error');
                $('#confirmDeleteModal').modal('hide');
            });
        });
    });
</script>

<div class="modal fade" id="confirmDeleteModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Confirm deletion</h4>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this citizen? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
            </div>
        </div>
    </div>
</div>

</body>
</html>
