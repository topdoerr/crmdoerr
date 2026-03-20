<?php
defined('BASEPATH') or exit('No direct script access allowed');

$CI = &get_instance();

// Tabla de roles propia del modulo para evitar conflicto con roles nativos del CRM.
if (!$CI->db->table_exists(db_prefix() . 'tm_roles')) {
    $CI->db->query(
        'CREATE TABLE `' . db_prefix() . 'tm_roles` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(50) NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_tm_role_name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;'
    );
}

if (!$CI->db->table_exists(db_prefix() . 'people')) {
    $CI->db->query(
        'CREATE TABLE `' . db_prefix() . 'people` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(100) NOT NULL,
            `last_name` VARCHAR(100) NULL,
            `email` VARCHAR(100) NOT NULL UNIQUE,
            `phone` VARCHAR(20) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `city` VARCHAR(100) NOT NULL,
            `gender` VARCHAR(1) NOT NULL DEFAULT "U",
            `profile_pic_url` TEXT NULL,
            `role_id` INT NOT NULL DEFAULT 1,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_people_role_id` (`role_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;'
    );
}

$peopleFields = [];
foreach ($CI->db->field_data(db_prefix() . 'people') as $field) {
    $peopleFields[] = $field->name;
}

if (!in_array('last_name', $peopleFields, true)) {
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'people` ADD `last_name` VARCHAR(100) NULL AFTER `name`;');
}

if (!in_array('profile_pic_url', $peopleFields, true)) {
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'people` ADD `profile_pic_url` TEXT NULL AFTER `gender`;');
}

if (!in_array('created_at', $peopleFields, true)) {
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'people` ADD `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;');
}

if (!in_array('role_id', $peopleFields, true)) {
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'people` ADD `role_id` INT NOT NULL DEFAULT 1;');
}

if (!$CI->db->table_exists(db_prefix() . 'tm_agencies')) {
    $CI->db->query(
        'CREATE TABLE `' . db_prefix() . 'tm_agencies` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(191) NOT NULL,
            `phone` VARCHAR(30) NULL,
            `address` VARCHAR(255) NULL,
            `description` TEXT NULL,
            `image_url` TEXT NULL,
            `city` VARCHAR(120) NULL,
            `maps_url` TEXT NULL,
            `active` TINYINT(1) NOT NULL DEFAULT 1,
            `display_order` INT NOT NULL DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;'
    );
}


if (!$CI->db->table_exists(db_prefix() . 'categories')) {
    $CI->db->query( // 1 true | 0 false
        'CREATE TABLE `' . db_prefix() . 'categories` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(100) NOT NULL,
            `active` TINYINT(1) NOT NULL DEFAULT 1, 
            `requires_document` TINYINT(1) NOT NULL DEFAULT 0,
            `image_url` TEXT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;'
    );
}

$categoryFields = [];
foreach ($CI->db->field_data(db_prefix() . 'categories') as $field) {
    $categoryFields[] = $field->name;
}

if (!in_array('requires_document', $categoryFields, true)) {
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'categories` ADD `requires_document` TINYINT(1) NOT NULL DEFAULT 0 AFTER `active`;');
}

// --- Seed mínimo idempotente ---
// Roles base
$citizen = $CI->db->get_where(db_prefix() . 'tm_roles', ['name' => 'Citizen'])->row_array();
if (!$citizen) { $CI->db->insert(db_prefix() . 'tm_roles', ['name' => 'Citizen']); }
$worker = $CI->db->get_where(db_prefix() . 'tm_roles', ['name' => 'Worker'])->row_array();
if (!$worker) { $CI->db->insert(db_prefix() . 'tm_roles', ['name' => 'Worker']); }
$admin = $CI->db->get_where(db_prefix() . 'tm_roles', ['name' => 'Admin'])->row_array();
if (!$admin) { $CI->db->insert(db_prefix() . 'tm_roles', ['name' => 'Admin']); }

// Alinear people.role_id a Citizen si hay roles no mapeados
$citizenIdRow = $CI->db->select('id')->get_where(db_prefix() . 'tm_roles', ['name' => 'Citizen'])->row();
if ($citizenIdRow && isset($citizenIdRow->id)) {
    $citizenId = (int)$citizenIdRow->id;
    $CI->db->query('UPDATE `' . db_prefix() . 'people` p LEFT JOIN `' . db_prefix() . 'tm_roles` r ON r.id = p.role_id SET p.role_id = ' . $citizenId . ' WHERE r.id IS NULL');
}

// Secret JWT del módulo.
$jwtSecretOption = get_option('tu_municipio_jwt_secret');
if (!is_string($jwtSecretOption) || trim($jwtSecretOption) === '') {
    $jwtSecret = app_generate_hash() . app_generate_hash();
    if (get_option('tu_municipio_jwt_secret') === false) {
        add_option('tu_municipio_jwt_secret', $jwtSecret);
    } else {
        update_option('tu_municipio_jwt_secret', $jwtSecret);
    }
}

// Categorías por defecto (solo si está vacía)
$categoriesCount = $CI->db->query('SELECT COUNT(1) AS c FROM `'.db_prefix().'categories`')->row();
if ($categoriesCount && (int)$categoriesCount->c === 0) {
    $defaults = [
        ['name' => 'Asfalto Camino Municipal', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Calle_256.png?alt=media&token=a15c32db-d858-4953-9994-bb5afd56b359', 'active' => 1],
        ['name' => 'Asfalto en Entradas', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Entrada_Calle_256.png?alt=media&token=2a5e842e-badb-4203-8f30-f0329118189f', 'active' => 1],
        ['name' => 'Auto Abandonado', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FVehiculo_Abandonado256x256.png?alt=media&token=2512a08e-cfdd-4b5e-a905-b1f4f61055d4', 'active' => 1],
        ['name' => 'Bacheo', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Roto_Calle_256.png?alt=media&token=5df559d1-31ee-461b-895d-5332200f4b75', 'active' => 1],
        ['name' => 'Cartas de Recomendación', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FCartasDeRecomendacion_Adm.png?alt=media&token=94d08656-5ac6-4482-a812-06d718fc7bcf', 'active' => 1],
        ['name' => 'Casa con Toldo', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Toldo_256.png?alt=media&token=8d09c83b-e4a2-4c8a-b6e0-591cd1fe1388', 'active' => 1],
        ['name' => 'Corte de Árbol', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Arbol_Caido_256.png?alt=media&token=695ee3f7-d981-4ba3-ac81-702eaa974d4f', 'active' => 1],
        ['name' => 'Daños por Derrumbe', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Derrumbes_256.png?alt=media&token=d5d751ba-a0d5-4dc6-be3f-45aef06eb04c', 'active' => 1],
        ['name' => 'Daños por Fuego', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Fuego_Hogar_256.png?alt=media&token=64d2cbbf-9f23-48e2-8b92-9473c4ca7da9', 'active' => 1],
        ['name' => 'Daños por Inundaciones', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Inundacion_256.png?alt=media&token=833cdf9a-5e52-4c69-85f9-d2de85d4b954', 'active' => 1],
        ['name' => 'Daños por Terremoto', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Terremoto%20256x256.png?alt=media&token=ff078535-9664-4e4f-ad49-5bbbdea2d965', 'active' => 1],
        ['name' => 'Daños por Tormenta/Huracán', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Viento_Hogar_256.png?alt=media&token=5f4ce045-f337-4c21-a702-5992263cdb53', 'active' => 1],
        ['name' => 'Derrumbes', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Derrumbes_256.png?alt=media&token=d5d751ba-a0d5-4dc6-be3f-45aef06eb04c', 'active' => 1],
        ['name' => 'Desganche/Poda de Árbol', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_desenganche_Arbol_256.png?alt=media&token=2e9fd6be-5dbc-45b9-b764-6a7850ca3d46', 'active' => 1],
        ['name' => 'Disposición de Desperdicios Sólidos', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Contenedor_Basura_256.png?alt=media&token=240d4420-8ed7-409f-b61f-4778de426ee9', 'active' => 1],
        ['name' => 'Disposición de Material Reciclable', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Reciclaje_256.png?alt=media&token=ca9b6839-6d95-4393-9c1a-de7ae59763bd', 'active' => 1],
        ['name' => 'Disposición de Material Vegetativo', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Desechos_Vegetativos_256.png?alt=media&token=f9dae22d-f9d1-4558-bb52-2bfff38155da', 'active' => 1],
        ['name' => 'Limpieza de Alcantarilla', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Alcantarilla_256.png?alt=media&token=b9066351-22f5-4b04-9c0f-615090f7bb86', 'active' => 1],
        ['name' => 'Limpieza de Áreas Comunes', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Limpieza_Acera_256.png?alt=media&token=575bc2a9-0c2d-4b82-8599-0868c9f86b2b', 'active' => 1],
        ['name' => 'Limpieza de Caminos', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Limpieza_Acera_256.png?alt=media&token=575bc2a9-0c2d-4b82-8599-0868c9f86b2b', 'active' => 1],
        ['name' => 'Maquina para Hoyo para Pozo Septico', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FMaquinaHoyoPozoSeptico_OP.png?alt=media&token=42647931-7161-41cd-98cd-9930ee2f39b7', 'active' => 1],
        ['name' => 'Maquinas', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Excavadora_256.png?alt=media&token=397ac465-d9e3-4234-b8a2-ec73c94c097c', 'active' => 1],
        ['name' => 'Otros Asuntos', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Persona_256.png?alt=media&token=3b9f8d46-91a5-4f20-819c-e2b6eb1272f0', 'active' => 1],
        ['name' => 'Peligro de Línea Eléctrica', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Precaucion_Electricidad_256.png?alt=media&token=40c6d5dc-90cb-45b1-ac7d-09a3ee04d832', 'active' => 1],
        ['name' => 'Poda de Árbol', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FPodaArboles_ME.png?alt=media&token=ad5389f6-958c-4b7e-8514-c3764f98bfb9', 'active' => 1],
        ['name' => 'Proclamas', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FProclamas_RP.png?alt=media&token=f5ec6220-a058-4d88-a772-c0468a5ca9d2', 'active' => 1],
        ['name' => 'Propaganda Política (Pasquines)', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Letreros_256.png?alt=media&token=818fe4fd-8b93-44d2-8f5b-db900eeb1e6f', 'active' => 1],
        ['name' => 'Quejas/Querellas', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Persona_256.png?alt=media&token=3b9f8d46-91a5-4f20-819c-e2b6eb1272f0', 'active' => 1],
        ['name' => 'Recogido de Animales Muertos', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Basura_256.png?alt=media&token=089338b1-af30-491e-a5b9-b8526de15b54', 'active' => 1],
        ['name' => 'Recogido de Animales Realengos', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Animal_Realengo_256.png?alt=media&token=b08dced5-1242-4e3b-978c-d0631b500e17', 'active' => 1],
        ['name' => 'Recogido de Basura', 'image_url' => 'https://firebasestorage.googleapis.com/v0/b/tumunicipio-38254.appspot.com/o/tuMunicipio%2FappIcons%2FIcon_Contenedor_Basura_256.png?alt=media&token=240d4420-8ed7-409f-b61f-4778de426ee9', 'active' => 1],
    ];
    $CI->db->insert_batch(db_prefix() . 'categories', $defaults);
}


$fields = $CI->db->field_data(db_prefix() . 'tickets');
$has_people_id = false;
$has_category_id = false;

foreach ($fields as $field) {
    if ($field->name == 'people_id') {
        $has_people_id = true;
    }
    if ($field->name == 'category_id') {
        $has_category_id = true;
    }
}


if (!$has_people_id) {
    $CI->db->query("ALTER TABLE `" . db_prefix() . "tickets` ADD `people_id` INT NULL DEFAULT NULL;");
}


if (!$has_category_id) {
    $CI->db->query("ALTER TABLE `" . db_prefix() . "tickets` ADD `category_id` INT NULL DEFAULT NULL AFTER `people_id`;");
}
