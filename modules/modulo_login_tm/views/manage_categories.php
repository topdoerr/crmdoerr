<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>

<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-12">
                <h4 class="tw-mt-0 tw-font-semibold tw-text-lg tw-text-neutral-700">
                    Reports Categories
                </h4>
                <hr class="hr-panel-heading"/>
                <div class="panel_s">
                    <div class="panel-body">
                        <!--Boton para agregar una categoria :)♥-->
                        <a href="#" class="btn btn-primary mbot15" data-toggle="modal" data-target="#addCategoryModal">
                            <i class="fa fa-plus"></i> Add Category
                        </a>

                        <?php
                        render_datatable([
                            'ID',
                            'Name',
                            "Active",
                            "Requires Document"
                        ], 'categories-table');
                        ?>
                    </div>
                    <div class="modal fade" id="addCategoryModal" tabindex="-1" role="dialog">
                        <div class="modal-dialog" role="document">
                            <form id="addCategoryForm">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h4 class="modal-title">Add Category</h4>
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="form-group">
                                            <label>Nombre</label>
                                            <input type="text" name="name" class="form-control" required>
                                        </div>
                                        <!--                                        Imagen se pone con url directa-->
                                        <!--                                        <div class="form-group">-->
                                        <!--                                            <label>Image Url</label>-->
                                        <!--                                            <input type="url" name="image_url" class="form-control">-->
                                        <!--                                        </div>-->
                                        <!--                                        Imagen a base de dropdown-->
                                        <div class="form-group">
                                            <label>Image Url</label>
                                            <select name="image_url" class="form-control" id="existingImages">
                                                <option value="">-- Select existing image --</option>
                                                <?php foreach ($existing_categories as $cat) { ?>
                                                    <?php if (!empty($cat['image_url'])) { ?>
                                                        <option value="<?php echo htmlspecialchars($cat['image_url']); ?>"></option>
                                                    <?php } ?>
                                                <?php } ?>

                                            </select>
                                            <input type="url" name="image_url" class="form-control" id="imageUrlInput"
                                                   placeholder="Or enter new URL">
                                        </div>

                                        <div class="form-group">
                                            <label>¿Active?</label>
                                            <select name="active" class="form-control">
                                                <option value="1">Yes</option>
                                                <option value="0">No</option>
                                            </select>
                                        </div>
                                        <div class="checkbox checkbox-primary mtop5">
                                            <input type="checkbox" id="requires_document" name="requires_document" value="1">
                                            <label for="requires_document">Requires document</label>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="submit" id="saveCategoryBtn" class="btn btn-primary">
                                            <i class="fa fa-spinner fa-spin" style="display:none;margin-right:5px;"
                                               id="saveSpinner"></i>
                                            Save
                                        </button>

                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet"/>

<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script>
    const tmAdminBase = admin_url + 'modulo_login_tm/';

    $(function () {
        initDataTable('.table-categories-table', tmAdminBase + 'login_categories', [0], [0]);
    });
    $(function () {
        $('body').on('click', '.toggle-active', function () {
            var button = $(this);
            var categoryId = button.data('id');
            var currentStatus = parseInt(button.data('active'));
            var newStatus = currentStatus === 1 ? 0 : 1;

            button.data('active', newStatus);
            if (newStatus === 1) {
                button.removeClass('btn-danger').addClass('btn-success');
                button.text('Activo');
            } else {
                button.removeClass('btn-success').addClass('btn-danger');
                button.text('Inactivo');
            }


            $.post(tmAdminBase + 'login_categories/toggle_active', {
                id: categoryId,
                active: newStatus
            }).done(function (response) {
                response = JSON.parse(response);
                if (!response.success) {
                    // Si falla, se revierte
                    var revertStatus = newStatus === 1 ? 0 : 1;
                    button.data('active', revertStatus);
                    if (revertStatus === 1) {
                        button.removeClass('btn-danger').addClass('btn-success');
                        button.text('Active');
                    } else {
                        button.removeClass('btn-success').addClass('btn-danger');
                        button.text('Inactive');
                    }
                    alert_float('danger', 'Error changing the Status');
                } else {
                    alert_float('success', response.message);
                }
            }).fail(function () {
                // Si falla la red, se revierte
                var revertStatus = newStatus === 1 ? 0 : 1;
                button.data('active', revertStatus);
                if (revertStatus === 1) {
                    button.removeClass('btn-danger').addClass('btn-success');
                    button.text('Active');
                } else {
                    button.removeClass('btn-success').addClass('btn-danger');
                    button.text('Inactive');
                }
                alert_float('danger', 'Network problem');
            });
        });

    });

    $(function () {
        $('body').on('click', '.toggle-requires-document', function () {
            var button = $(this);
            var categoryId = button.data('id');
            var currentStatus = parseInt(button.data('requires-document'));
            var newStatus = currentStatus === 1 ? 0 : 1;

            button.data('requires-document', newStatus);
            if (newStatus === 1) {
                button.removeClass('btn-default').addClass('btn-warning');
                button.text('Required');
            } else {
                button.removeClass('btn-warning').addClass('btn-default');
                button.text('Optional');
            }

            $.post(tmAdminBase + 'login_categories/toggle_requires_document', {
                id: categoryId,
                requires_document: newStatus
            }).done(function (response) {
                response = JSON.parse(response);
                if (!response.success) {
                    var revertStatus = newStatus === 1 ? 0 : 1;
                    button.data('requires-document', revertStatus);

                    if (revertStatus === 1) {
                        button.removeClass('btn-default').addClass('btn-warning');
                        button.text('Required');
                    } else {
                        button.removeClass('btn-warning').addClass('btn-default');
                        button.text('Optional');
                    }
                    alert_float('danger', 'Error changing document requirement');
                } else {
                    alert_float('success', response.message);
                }
            }).fail(function () {
                var revertStatus = newStatus === 1 ? 0 : 1;
                button.data('requires-document', revertStatus);

                if (revertStatus === 1) {
                    button.removeClass('btn-default').addClass('btn-warning');
                    button.text('Required');
                } else {
                    button.removeClass('btn-warning').addClass('btn-default');
                    button.text('Optional');
                }
                alert_float('danger', 'Network problem');
            });
        });
    });

    var csrfData = {
        '<?php echo $this->security->get_csrf_token_name(); ?>': '<?php echo $this->security->get_csrf_hash(); ?>'
    };
    $(function () {
        // Crear categoría
        $('#addCategoryForm').on('submit', function (e) {
            e.preventDefault();


            $('#saveCategoryBtn').prop('disabled', true);
            $('#saveSpinner').show();

            var formData = $(this).serialize();
            formData += '&' + $.param(csrfData);

            $.post(tmAdminBase + 'login_categories/add', formData).done(function (response) {
                response = JSON.parse(response);


                $('#saveCategoryBtn').prop('disabled', false);
                $('#saveSpinner').hide();

                if (response.success) {

                    $('#addCategoryModal').modal('hide');
                    $('#addCategoryForm')[0].reset();

                    alert_float('success', 'Category added');


                    $('.table-categories-table').DataTable().ajax.reload(null, false);
                } else {
                    alert_float('danger', 'Error saving');
                }

                if (response.csrf_hash) {
                    csrfData = {
                        '<?php echo $this->security->get_csrf_token_name(); ?>': response.csrf_hash
                    };
                }
            }).fail(function () {
                $('#saveCategoryBtn').prop('disabled', false);
                $('#saveSpinner').hide();
                alert_float('danger', 'Network error');
            });
        });


        // Eliminar categoría
        $('body').on('click', '.delete-category', function () {
            var id = $(this).data('id');

            if (confirm('Are you sure you want to delete this category?')) {
                var table = $('.table-categories-table').DataTable();
                var row = $(this).closest('tr');

                $.post(tmAdminBase + 'login_categories/delete', {id: id}).done(function (response) {
                    response = JSON.parse(response);
                    if (response.success) {
                        table.row(row).remove().draw(false);
                        alert_float('success', 'Category deleted');
                    } else {
                        alert_float('danger', 'Could not be removed');
                    }
                });
            }
        });

    });

    $(function () {
        // Inicializar tooltips del boton de eliminar :) ♥
        $('body').tooltip({
            selector: '[data-toggle="tooltip"]'
        });
    });


    function formatImageOnly(state) {
        if (!state.id) {
            return $('<span>-- No image --</span>');
        }
        var imgUrl = state.id;

        // Imagen de respaldo (puede ser local o externa)
        var fallbackImg = 'https://via.placeholder.com/40?text=No+Img';

        var $state = $(
            '<span style="display: flex; align-items: center;">' +
            '<img src="' + imgUrl + '" style="height: 40px; width: auto; margin-right: 5px;" ' +
            'onerror="this.onerror=null;this.src=\'' + fallbackImg + '\';" />' +
            '</span>'
        );
        return $state;
    }



    $('#existingImages').select2({
        templateResult: formatImageOnly,
        templateSelection: formatImageOnly,
        width: '100%',
        dropdownAutoWidth: true,
        dropdownParent: $('#addCategoryModal')
    });


    // Para copiar la URL seleccionada al input
    $('#existingImages').on('change', function () {
        var selected = $(this).val();
        $('#imageUrlInput').val(selected);
    });


</script>
<style>
    .hidden-on-hover {
        display: none;
        margin-top: 5px;
        cursor: pointer;
        color: red;
    }

    .category-name-wrapper:hover .hidden-on-hover {
        display: inline-block;
    }

    .delete-button {
        font-size: 10px;
    }
</style>

</body>
</html>
