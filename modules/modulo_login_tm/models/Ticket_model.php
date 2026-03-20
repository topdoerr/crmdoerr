<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Ticket_model extends App_Model
{
    protected $tickets_table;
    protected $replies_table;
    protected $attachments_table;

    public function __construct()
    {
        parent::__construct();
        $this->tickets_table = db_prefix() . 'tickets';
        $this->replies_table = db_prefix() . 'ticket_replies';
        $this->attachments_table = db_prefix() . 'ticket_attachments';
    }

    public function get($ticketid)
    {
        return $this->db
            ->where('ticketid', (int) $ticketid)
            ->get($this->tickets_table)
            ->row_array();
    }

    public function get_all_tickets()
    {
        return $this->db
            ->select('t.*, c.name as category_name, ts.name as status_name')
            ->from($this->tickets_table . ' t')
            ->join(db_prefix() . 'categories c', 'c.id = t.category_id', 'left')
            ->join(db_prefix() . 'tickets_status ts', 'ts.ticketstatusid = t.status', 'left')
            ->order_by('t.ticketid', 'DESC')
            ->get()
            ->result_array();
    }

    public function get_user_tickets($people_id)
    {
        return $this->db
            ->select('t.*, c.name as category_name, ts.name as status_name')
            ->from($this->tickets_table . ' t')
            ->join(db_prefix() . 'categories c', 'c.id = t.category_id', 'left')
            ->join(db_prefix() . 'tickets_status ts', 'ts.ticketstatusid = t.status', 'left')
            ->where('t.people_id', (int) $people_id)
            ->order_by('t.ticketid', 'DESC')
            ->get()
            ->result_array();
    }

    public function get_ticket_for_app($ticketid)
    {
        return $this->db
            ->select('t.*, c.name as category_name, ts.name as status_name')
            ->from($this->tickets_table . ' t')
            ->join(db_prefix() . 'categories c', 'c.id = t.category_id', 'left')
            ->join(db_prefix() . 'tickets_status ts', 'ts.ticketstatusid = t.status', 'left')
            ->where('t.ticketid', (int) $ticketid)
            ->get()
            ->row_array();
    }

    public function get_ticket_replies($ticketid)
    {
        $this->db->where('ticketid', (int) $ticketid);
        $this->db->order_by('id', 'ASC');
        $replies = $this->db->get($this->replies_table)->result_array();

        foreach ($replies as &$reply) {
            $replyId = (int) $reply['id'];

            $attachments = $this->db
                ->where('replyid', $replyId)
                ->get($this->attachments_table)
                ->result_array();

            foreach ($attachments as &$attachment) {
                $attachment['full_url'] = base_url('uploads/ticket_attachments/' . $ticketid . '/' . $attachment['file_name']);
            }

            $reply['attachments'] = $attachments;
        }

        return $replies;
    }

    public function get_ticket_initial_attachment($ticketid)
    {
        $this->db->where('ticketid', (int) $ticketid);
        $this->db->where('replyid IS NULL', null, false);
        $this->db->order_by('dateadded', 'ASC');
        $attachment = $this->db->get($this->attachments_table)->row_array();

        if ($attachment) {
            $attachment['full_url'] = base_url('uploads/ticket_attachments/' . $ticketid . '/' . $attachment['file_name']);
        }

        return $attachment;
    }

    public function add_ticket_reply($ticketid, $user_id, $message, $attachment = null)
    {
        if (!$ticketid || !$user_id || trim((string) $message) === '') {
            return false;
        }

        $replyData = [
            'ticketid' => (int) $ticketid,
            'message' => $message,
            'date' => date('Y-m-d H:i:s'),
            'contactid' => (int) $user_id,
        ];

        $this->db->insert($this->replies_table, $replyData);

        if ($this->db->affected_rows() > 0) {
            $replyId = (int) $this->db->insert_id();

            if ($attachment) {
                $this->db->insert($this->attachments_table, [
                    'ticketid' => (int) $ticketid,
                    'replyid' => $replyId,
                    'file_name' => $attachment['file_name'],
                    'filetype' => $attachment['filetype'],
                    'dateadded' => date('Y-m-d H:i:s'),
                ]);
            }

            $this->db->where('ticketid', (int) $ticketid);
            $this->db->update($this->tickets_table, ['status' => 3]);

            return $replyId;
        }

        return false;
    }
}
