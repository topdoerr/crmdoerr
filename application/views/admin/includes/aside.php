<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<aside id="menu" class="sidebar sidebar">
    <ul class="nav metis-menu" id="side-menu">
        <li class="tw-mt-[63px] sm:tw-mt-0 -tw-mx-2 tw-overflow-hidden sm:tw-bg-neutral-900/50">
            <div id="logo" class="sidebar-logo tw-py-5 tw-px-4 tw-min-h-[63px] tw-flex tw-items-center">
                <a href="<?php echo admin_url(); ?>" class="topdoerr-logo-mark tw-flex tw-items-center tw-gap-2.5 !tw-mt-0 tw-no-underline hover:tw-opacity-95" aria-label="TopDoerr CRM">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="tw-flex-shrink-0" aria-hidden="true">
                        <ellipse cx="16" cy="16" rx="14.5" ry="13" stroke="#FEFAE0" stroke-width="1.1" fill="none" opacity=".22"/>
                        <ellipse cx="16" cy="16" rx="11" ry="9.8" stroke="#FEFAE0" stroke-width="1.2" fill="none" opacity=".34"/>
                        <ellipse cx="16" cy="16" rx="7.8" ry="7.0" stroke="#FEFAE0" stroke-width="1.4" fill="none" opacity=".48"/>
                        <ellipse cx="16" cy="16" rx="4.8" ry="4.3" stroke="#FEFAE0" stroke-width="1.6" fill="none" opacity=".62"/>
                        <ellipse cx="16" cy="16" rx="2.4" ry="2.15" stroke="#D4822E" stroke-width="2.0" fill="none"/>
                        <circle cx="16" cy="16" r="1.15" fill="#D4822E"/>
                        <circle cx="16" cy="16" r="0.42" fill="#FEFAE0" opacity=".9"/>
                    </svg>
                    <span class="td-sidebar-wordmark">TopDoerr</span>
                </a>
            </div>
        </li>
        <?php
         hooks()->do_action('before_render_aside_menu');
         ?>
        <?php foreach ($sidebar_menu as $key => $item) {
             if ((isset($item['collapse']) && $item['collapse']) && count($item['children']) === 0) {
                 continue;
             } ?>
        <li class="menu-item-<?php echo e($item['slug']); ?>"
            <?php echo _attributes_to_string(isset($item['li_attributes']) ? $item['li_attributes'] : []); ?>>
            <a href="<?php echo count($item['children']) > 0 ? '#' : $item['href']; ?>" aria-expanded="false"
                <?php echo _attributes_to_string(isset($item['href_attributes']) ? $item['href_attributes'] : []); ?>>
                <i class="<?php echo e($item['icon']); ?> menu-icon"></i>
                <span class="menu-text">
                    <?php echo e(_l($item['name'], '', false)); ?>
                </span>
                <?php if (count($item['children']) > 0) { ?>
                <span class="fa arrow pleft5"></span>
                <?php } ?>
                <?php if (isset($item['badge'], $item['badge']['value']) && !empty($item['badge'])) {?>
                <span
                    class="badge pull-right
               <?=isset($item['badge']['type']) && $item['badge']['type'] != '' ? "bg-{$item['badge']['type']}" : 'bg-info' ?>" <?=(isset($item['badge']['type']) && $item['badge']['type'] == '') ||
                        isset($item['badge']['color']) ? "style='background-color: {$item['badge']['color']}'" : '' ?>>
                    <?= e($item['badge']['value']) ?>
                </span>
                <?php } ?>
            </a>
            <?php if (count($item['children']) > 0) { ?>
            <ul class="nav nav-second-level collapse" aria-expanded="false">
                <?php foreach ($item['children'] as $submenu) { ?>
                <li class="sub-menu-item-<?php echo e($submenu['slug']); ?>"
                    <?php echo _attributes_to_string(isset($submenu['li_attributes']) ? $submenu['li_attributes'] : []); ?>>
                    <a href="<?php echo e($submenu['href']); ?>"
                        <?php echo _attributes_to_string(isset($submenu['href_attributes']) ? $submenu['href_attributes'] : []); ?>>
                        <?php if (!empty($submenu['icon'])) { ?>
                        <i class="<?php echo e($submenu['icon']); ?> menu-icon"></i>
                        <?php } ?>
                        <span class="sub-menu-text">
                            <?php echo _l($submenu['name'], '', false); ?>
                        </span>
                    </a>
                    <?php if (isset($submenu['badge'], $submenu['badge']['value']) && !empty($submenu['badge'])) {?>
                    <span
                        class="badge pull-right
               <?=isset($submenu['badge']['type']) && $submenu['badge']['type'] != '' ? "bg-{$submenu['badge']['type']}" : 'bg-info' ?>" <?=(isset($submenu['badge']['type']) && $submenu['badge']['type'] == '') ||
                isset($submenu['badge']['color']) ? "style='background-color: {$submenu['badge']['color']}'" : '' ?>>
                        <?= e($submenu['badge']['value']) ?>
                    </span>
                    <?php } ?>
                </li>
                <?php } ?>
            </ul>
            <?php } ?>
        </li>
        <?php hooks()->do_action('after_render_single_aside_menu', $item); ?>
        <?php
         } ?>
        <?php if ($this->app->show_setup_menu() == true && (is_staff_member() || is_admin())) { ?>
        <li<?php if (get_option('show_setup_menu_item_only_on_hover') == 1) {
             echo ' style="display:none;"';
         } ?> id="setup-menu-item">
            <a href="#" class="open-customizer"><i class="fa fa-cog menu-icon"></i>
                <span class="menu-text">
                    <?php echo _l('setting_bar_heading'); ?>
                    <?php
                if ($modulesNeedsUpgrade = $this->app_modules->number_of_modules_that_require_database_upgrade()) {
                    echo '<span class="badge menu-badge !tw-bg-warning-600">' . $modulesNeedsUpgrade . '</span>';
                }
            ?>
                </span>
            </a>
            <?php } ?>
            </li>
            <?php hooks()->do_action('after_render_aside_menu'); ?>
            <?php $this->load->view('admin/projects/pinned'); ?>
    </ul>
</aside>