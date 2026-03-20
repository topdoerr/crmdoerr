<?php

defined('BASEPATH') or exit('No direct script access allowed');

if (!function_exists('create_jwt')) {
    /**
     * Create a JWT token.
     */
    function create_jwt($user_id, $secret, $expiry_minutes = 7200, $role = 'Citizen')
    {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);

        $payload = json_encode([
            'user_id' => (int) $user_id,
            'role' => (string) $role,
            'exp' => time() + ((int) $expiry_minutes * 60),
        ]);

        $base64UrlHeader = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
        $base64UrlPayload = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

        $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $secret, true);
        $base64UrlSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }
}

if (!function_exists('validate_jwt')) {
    /**
     * Validate JWT signature and expiration.
     */
    function validate_jwt($jwt, $secret)
    {
        $parts = explode('.', (string) $jwt);
        if (count($parts) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = $parts;

        $validSignature = hash_hmac('sha256', $header . '.' . $payload, $secret, true);
        $validSignatureEncoded = rtrim(strtr(base64_encode($validSignature), '+/', '-_'), '=');

        if (!hash_equals($signature, $validSignatureEncoded)) {
            return false;
        }

        $payloadDecoded = json_decode(base64_decode($payload), true);
        if (!is_array($payloadDecoded)) {
            return false;
        }

        if (!isset($payloadDecoded['exp']) || (int) $payloadDecoded['exp'] < time()) {
            return false;
        }

        return $payloadDecoded;
    }
}

if (!function_exists('tu_municipio_jwt_secret')) {
    /**
     * Fetch or generate the module JWT secret.
     */
    function tu_municipio_jwt_secret()
    {
        $optionName = 'tu_municipio_jwt_secret';
        $secret = get_option($optionName);

        if (is_string($secret) && trim($secret) !== '') {
            return $secret;
        }

        try {
            $secret = bin2hex(random_bytes(32));
        } catch (Exception $e) {
            $secret = app_generate_hash() . app_generate_hash();
        }

        if (get_option($optionName) === false) {
            add_option($optionName, $secret);
        } else {
            update_option($optionName, $secret);
        }

        return $secret;
    }
}
