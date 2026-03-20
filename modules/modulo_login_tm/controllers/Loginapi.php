<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Loginapi extends App_Controller
{
    const TOKEN_EXPIRY_MINUTES = 7200;

    protected $jwt_secret;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('login_model');
        $this->load->model('ticket_model');
        $this->load->model('tickets_model');
        $this->load->model('categories_model');
        $this->load->helper(TU_MUNICIPIO_MODULE_NAME . '/login');
        $this->jwt_secret = tu_municipio_jwt_secret();

        header('Content-Type: application/json');
    }

    public function register()
    {
        $data = $this->get_json_body();

        if (
            !$data ||
            empty($data['name']) ||
            empty($data['email']) ||
            empty($data['phone']) ||
            empty($data['password'])
        ) {
            return $this->respond(['status' => false, 'message' => 'Name, email, phone and password are required.'], 422);
        }

        $email = trim((string) $data['email']);
        $phone = preg_replace('/[^0-9+]/', '', (string) $data['phone']);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respond(['status' => false, 'message' => 'Invalid email format.'], 422);
        }

        $exists = $this->login_model->find_by_email_or_phone($email, $phone);
        if ($exists) {
            return $this->respond(['status' => false, 'message' => 'A user with that email or phone already exists.'], 409);
        }

        $citizenRoleId = $this->login_model->get_role_id_by_name('Citizen');
        if ($citizenRoleId <= 0) {
            return $this->respond(['status' => false, 'message' => 'Citizen role is not configured.'], 500);
        }

        $insertData = [
            'name' => trim((string) $data['name']),
            'last_name' => isset($data['last_name']) ? trim((string) $data['last_name']) : null,
            'email' => $email,
            'phone' => $phone,
            'password' => (string) $data['password'],
            'city' => isset($data['city']) ? trim((string) $data['city']) : '',
            'gender' => isset($data['gender']) ? trim((string) $data['gender']) : 'U',
            'profile_pic_url' => isset($data['profile_pic_url']) ? trim((string) $data['profile_pic_url']) : null,
            'role_id' => $citizenRoleId,
        ];

        $id = $this->login_model->register($insertData);
        if (!$id) {
            return $this->respond(['status' => false, 'message' => 'User could not be created.'], 500);
        }

        return $this->respond(['status' => true, 'id' => $id]);
    }

    public function login()
    {
        $data = $this->get_json_body();

        $identifier = trim((string) ($data['email'] ?? $data['phone'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($identifier === '' || $password === '') {
            return $this->respond(['status' => false, 'message' => 'Email/phone and password are required.'], 422);
        }

        $existing = $this->login_model->find_by_email_or_phone($identifier, $identifier);
        if (!$existing) {
            return $this->respond(['status' => false, 'message' => 'No user found for that email/phone.'], 404);
        }

        $user = $this->login_model->authenticate([
            'email' => $identifier,
            'password' => $password,
        ]);

        if (!$user) {
            return $this->respond(['status' => false, 'message' => 'Invalid password.'], 401);
        }

        $token = create_jwt($user['id'], $this->jwt_secret, self::TOKEN_EXPIRY_MINUTES, $user['role_name'] ?? 'Citizen');

        return $this->respond([
            'status' => true,
            'token' => $token,
            'user_id' => $user['id'],
            'name' => $user['name'] ?? null,
            'last_name' => $user['last_name'] ?? null,
            'email' => $user['email'] ?? null,
            'phone' => $user['phone'] ?? null,
            'city' => $user['city'] ?? null,
            'role' => $user['role_name'] ?? null,
            'profile_pic_url' => $user['profile_pic_url'] ?? null,
        ]);
    }

    public function auto_login()
    {
        $data = $this->get_json_body();
        $token = $data['token'] ?? null;

        if (!$token) {
            return $this->respond(['status' => false, 'message' => 'Token is required.'], 422);
        }

        $payload = validate_jwt($token, $this->jwt_secret);
        if (!$payload || !isset($payload['user_id'])) {
            return $this->respond(['status' => false, 'message' => 'Invalid or expired token.'], 401);
        }

        $user = $this->login_model->get_user_by_token_payload($payload);
        if (!$user) {
            return $this->respond(['status' => false, 'message' => 'User not found.'], 404);
        }

        return $this->respond([
            'status' => true,
            'token' => $token,
            'user_id' => $user['id'],
            'name' => $user['name'] ?? null,
            'last_name' => $user['last_name'] ?? null,
            'email' => $user['email'] ?? null,
            'phone' => $user['phone'] ?? null,
            'city' => $user['city'] ?? null,
            'role' => $user['role_name'] ?? null,
            'profile_pic_url' => $user['profile_pic_url'] ?? null,
        ]);
    }

    public function tickets()
    {
        $method = strtoupper($this->input->method());

        if ($method === 'GET') {
            return $this->list_tickets();
        }

        if ($method === 'POST') {
            return $this->create_ticket();
        }

        return $this->respond(['status' => false, 'message' => 'Method not allowed.'], 405);
    }

    public function ticket($ticketid)
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $ticket = $this->get_accessible_ticket((int) $ticketid, $payload);
        if ($ticket === false) {
            return;
        }

        $ticket['replies'] = $this->ticket_model->get_ticket_replies((int) $ticketid);
        $ticket['initial_attachment'] = $this->ticket_model->get_ticket_initial_attachment((int) $ticketid) ?: null;

        return $this->respond(['status' => true, 'ticket' => $ticket]);
    }

    public function add_ticket_reply($ticketid)
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $ticket = $this->get_accessible_ticket((int) $ticketid, $payload);
        if ($ticket === false) {
            return;
        }

        $data = $this->get_json_body();
        if (empty($data['message'])) {
            return $this->respond(['status' => false, 'message' => 'Reply message is required.'], 422);
        }

        $attachment = null;
        if (!empty($data['attachment']) && !empty($data['attachment_name']) && !empty($data['attachment_type'])) {
            $decoded = base64_decode($data['attachment']);

            if ($decoded !== false) {
                $uploadPath = FCPATH . 'uploads/ticket_attachments/' . (int) $ticketid . '/';
                if (!is_dir($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }

                $filename = uniqid('reply_', true) . '_' . preg_replace('/[^a-zA-Z0-9\._-]/', '', $data['attachment_name']);
                file_put_contents($uploadPath . $filename, $decoded);

                $attachment = [
                    'file_name' => $filename,
                    'filetype' => $data['attachment_type'],
                ];
            }
        }

        $replyId = $this->ticket_model->add_ticket_reply((int) $ticketid, (int) $payload['user_id'], (string) $data['message'], $attachment);
        if (!$replyId) {
            return $this->respond(['status' => false, 'message' => 'Reply could not be added.'], 500);
        }

        return $this->respond(['status' => true, 'reply_id' => $replyId]);
    }

    public function ticket_replies($ticketid)
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $ticket = $this->get_accessible_ticket((int) $ticketid, $payload);
        if ($ticket === false) {
            return;
        }

        $replies = $this->ticket_model->get_ticket_replies((int) $ticketid);

        return $this->respond([
            'status' => true,
            'ticket_id' => (int) $ticketid,
            'replies' => $replies,
        ]);
    }

    public function categories()
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $categories = $this->categories_model->get_active();
        return $this->respond(['status' => true, 'categories' => $categories]);
    }

    public function agencies()
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $agencies = [];
        if ($this->db->table_exists(db_prefix() . 'tm_agencies')) {
            $agencies = $this->db
                ->select('id, name, phone, address, description, image_url, city, maps_url')
                ->from(db_prefix() . 'tm_agencies')
                ->where('active', 1)
                ->order_by('display_order', 'ASC')
                ->order_by('name', 'ASC')
                ->get()
                ->result_array();
        }

        return $this->respond(['status' => true, 'agencies' => $agencies]);
    }

    public function update_profile()
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $data = $this->get_json_body();
        $allowed = ['name', 'last_name', 'phone', 'city', 'profile_pic_url'];
        $update = [];

        foreach ($allowed as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                $update[$key] = trim((string) $data[$key]);
            }
        }

        if (isset($update['phone'])) {
            $update['phone'] = preg_replace('/[^0-9+]/', '', $update['phone']);
        }

        if (empty($update)) {
            return $this->respond(['status' => false, 'message' => 'No profile fields to update.'], 422);
        }

        $this->db->where('id', (int) $payload['user_id']);
        $this->db->update(db_prefix() . 'people', $update);

        $dbError = $this->db->error();
        if (!empty($dbError['code'])) {
            return $this->respond(['status' => false, 'message' => 'Profile update failed.'], 500);
        }

        return $this->respond(['status' => true]);
    }

    public function change_password()
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $data = $this->get_json_body();
        $currentPassword = (string) ($data['current_password'] ?? '');
        $newPassword = (string) ($data['new_password'] ?? '');

        if ($currentPassword === '' || $newPassword === '') {
            return $this->respond(['status' => false, 'message' => 'Current password and new password are required.'], 422);
        }

        $user = $this->login_model->get((int) $payload['user_id']);
        if (!$user || empty($user['password'])) {
            return $this->respond(['status' => false, 'message' => 'User not found.'], 404);
        }

        if (!password_verify($currentPassword, $user['password'])) {
            return $this->respond(['status' => false, 'message' => 'Current password is incorrect.'], 401);
        }

        if (password_verify($newPassword, $user['password'])) {
            return $this->respond(['status' => false, 'message' => 'New password must be different from current password.'], 422);
        }

        $updated = $this->login_model->update_password((int) $payload['user_id'], $newPassword);
        if (!$updated) {
            return $this->respond(['status' => false, 'message' => 'Password could not be updated.'], 500);
        }

        return $this->respond(['status' => true]);
    }

    private function list_tickets()
    {
        $payload = $this->authenticate_request();
        if ($payload === false) {
            return;
        }

        $userId = (int) $payload['user_id'];
        $role = $payload['role'] ?? 'Citizen';

        if ($this->is_staff_role($role)) {
            $tickets = $this->ticket_model->get_all_tickets();
        } else {
            $tickets = $this->ticket_model->get_user_tickets($userId);
        }

        foreach ($tickets as &$ticket) {
            $ticketId = (int) ($ticket['ticketid'] ?? 0);
            $ticket['replies'] = $ticketId > 0 ? $this->ticket_model->get_ticket_replies($ticketId) : [];
            $ticket['initial_attachment'] = $ticketId > 0 ? ($this->ticket_model->get_ticket_initial_attachment($ticketId) ?: null) : null;
        }

        return $this->respond(['status' => true, 'tickets' => $tickets]);
    }

    private function create_ticket()
    {
        $payload = $this->authenticate_request(false);
        if ($payload === false) {
            return;
        }

        if ($payload === null) {
            $apiToken = trim((string) $this->input->get_request_header('authtoken'));
            if ($apiToken === '') {
                return $this->respond(['status' => false, 'message' => 'Authorization token is required.'], 401);
            }
        }

        $postedPeopleId = (int) $this->input->post('people_id');
        $userId = $payload ? (int) $payload['user_id'] : $postedPeopleId;

        if ($userId <= 0) {
            return $this->respond(['status' => false, 'message' => 'User authentication is required.'], 401);
        }

        $user = $this->login_model->get($userId);
        if (!$user) {
            return $this->respond(['status' => false, 'message' => 'User not found.'], 404);
        }

        $subject = trim((string) $this->input->post('subject'));
        $message = trim((string) $this->input->post('message'));
        $categoryId = (int) $this->input->post('category_id');
        $requiresDocument = false;

        if ($subject === '' || $message === '') {
            return $this->respond(['status' => false, 'message' => 'Subject and message are required.'], 422);
        }

        if ($categoryId > 0) {
            $category = $this->categories_model->get_by_id($categoryId);
            $requiresDocument = ((int) ($category['requires_document'] ?? 0) === 1);
        }

        $department = $this->resolve_department_id((int) $this->input->post('department'));
        if ($department <= 0) {
            return $this->respond(['status' => false, 'message' => 'No valid department available.'], 500);
        }

        $priority = $this->resolve_priority_id((int) $this->input->post('priority'));

        if (isset($_FILES['file']) && !empty($_FILES['file']['name']) && !isset($_FILES['attachments'])) {
            $_FILES['attachments'] = [
                'name' => [$_FILES['file']['name']],
                'type' => [$_FILES['file']['type']],
                'tmp_name' => [$_FILES['file']['tmp_name']],
                'error' => [$_FILES['file']['error']],
                'size' => [$_FILES['file']['size']],
            ];
        }

        if ($requiresDocument && !$this->has_ticket_attachment_upload()) {
            return $this->respond([
                'status' => false,
                'message' => 'A document is required for this category.',
            ], 422);
        }

        $requesterName = trim(((string) ($user['name'] ?? '')) . ' ' . ((string) ($user['last_name'] ?? '')));
        if ($requesterName === '') {
            $requesterName = 'Tu Municipio App';
        }

        $ticketData = [
            'subject' => $subject,
            'department' => $department,
            'priority' => $priority,
            'message' => $message,
            'userid' => 0,
            'contactid' => 0,
            'name' => $requesterName,
            'email' => $user['email'] ?? 'noreply@localhost.local',
            'people_id' => $userId,
        ];

        if ($categoryId > 0) {
            $ticketData['category_id'] = $categoryId;
        }

        $ticketId = $this->tickets_model->add($ticketData, null);
        if (!$ticketId) {
            return $this->respond(['status' => false, 'message' => 'Ticket could not be created.'], 500);
        }

        $ticket = $this->ticket_model->get_ticket_for_app((int) $ticketId);
        if ($ticket) {
            $ticket['replies'] = $this->ticket_model->get_ticket_replies((int) $ticketId);
            $ticket['initial_attachment'] = $this->ticket_model->get_ticket_initial_attachment((int) $ticketId) ?: null;
        }

        return $this->respond([
            'status' => true,
            'ticket_id' => (int) $ticketId,
            'ticket' => $ticket,
        ], 201);
    }

    private function resolve_department_id($requestedDepartmentId)
    {
        $requestedDepartmentId = (int) $requestedDepartmentId;

        if ($requestedDepartmentId > 0) {
            $exists = $this->db
                ->where('departmentid', $requestedDepartmentId)
                ->count_all_results(db_prefix() . 'departments');

            if ($exists > 0) {
                return $requestedDepartmentId;
            }
        }

        $fallback = $this->db
            ->select('departmentid')
            ->from(db_prefix() . 'departments')
            ->order_by('departmentid', 'ASC')
            ->limit(1)
            ->get()
            ->row_array();

        return $fallback ? (int) $fallback['departmentid'] : 0;
    }

    private function resolve_priority_id($requestedPriorityId)
    {
        $requestedPriorityId = (int) $requestedPriorityId;

        if (!$this->db->table_exists(db_prefix() . 'tickets_priorities')) {
            return max($requestedPriorityId, 0);
        }

        if ($requestedPriorityId > 0) {
            $exists = $this->db
                ->where('priorityid', $requestedPriorityId)
                ->count_all_results(db_prefix() . 'tickets_priorities');

            if ($exists > 0) {
                return $requestedPriorityId;
            }
        }

        $fallback = $this->db
            ->select('priorityid')
            ->from(db_prefix() . 'tickets_priorities')
            ->order_by('priorityid', 'ASC')
            ->limit(1)
            ->get()
            ->row_array();

        return $fallback ? (int) $fallback['priorityid'] : 0;
    }

    private function get_accessible_ticket($ticketId, array $payload)
    {
        if ($ticketId <= 0) {
            $this->respond(['status' => false, 'message' => 'Ticket id is required.'], 422);
            return false;
        }

        $ticket = $this->ticket_model->get_ticket_for_app($ticketId);
        if (!$ticket) {
            $this->respond(['status' => false, 'message' => 'Ticket not found.'], 404);
            return false;
        }

        if (!$this->is_staff_role($payload['role'] ?? 'Citizen')) {
            $ownerId = (int) ($ticket['people_id'] ?? 0);
            if ($ownerId !== (int) $payload['user_id']) {
                $this->respond(['status' => false, 'message' => 'You do not have access to this ticket.'], 403);
                return false;
            }
        }

        return $ticket;
    }

    private function is_staff_role($roleName)
    {
        $roleName = strtolower(trim((string) $roleName));
        return in_array($roleName, ['worker', 'admin'], true);
    }

    private function has_ticket_attachment_upload()
    {
        if (!isset($_FILES['attachments'])) {
            return false;
        }

        $names = $_FILES['attachments']['name'] ?? [];
        $errors = $_FILES['attachments']['error'] ?? [];

        if (!is_array($names)) {
            return trim((string) $names) !== '' && (int) $errors === UPLOAD_ERR_OK;
        }

        foreach ($names as $index => $name) {
            $error = isset($errors[$index]) ? (int) $errors[$index] : UPLOAD_ERR_NO_FILE;
            if (trim((string) $name) !== '' && $error === UPLOAD_ERR_OK) {
                return true;
            }
        }

        return false;
    }

    private function get_json_body()
    {
        $rawBody = file_get_contents('php://input');
        if (!$rawBody) {
            return [];
        }

        $decoded = json_decode($rawBody, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function authenticate_request($required = true)
    {
        $token = $this->get_bearer_token();

        if (!$token) {
            if ($required) {
                $this->respond(['status' => false, 'message' => 'Authorization bearer token is missing.'], 401);
                return false;
            }

            return null;
        }

        $payload = validate_jwt($token, $this->jwt_secret);
        if (!$payload || !isset($payload['user_id'])) {
            $this->respond(['status' => false, 'message' => 'Invalid or expired token.'], 401);
            return false;
        }

        return $payload;
    }

    private function get_bearer_token()
    {
        $authHeader = (string) $this->input->get_request_header('Authorization');
        if ($authHeader === '') {
            return null;
        }

        if (preg_match('/^\s*Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    private function respond(array $payload, $statusCode = 200)
    {
        return $this->output
            ->set_content_type('application/json')
            ->set_status_header((int) $statusCode)
            ->set_output(json_encode($payload));
    }
}
