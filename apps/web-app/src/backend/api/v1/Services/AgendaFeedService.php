<?php

namespace BodyHarmony\Services;

use PDO;
use Exception;

class AgendaFeedService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Generates iCal RFC 5545 (.ics) string for a list of agenda events.
     */
    public function generateIcalFeed(array $events): string {
        $lines = [];
        $lines[] = "BEGIN:VCALENDAR";
        $lines[] = "VERSION:2.0";
        $lines[] = "PRODID:-//Body Harmony Nexus V3.1//Gestor Agenda//PT_BR";
        $lines[] = "CALSCALE:GREGORIAN";
        $lines[] = "METHOD:PUBLISH";
        $lines[] = "X-WR-CALNAME:Agenda Gestores Body Harmony";
        $lines[] = "X-WR-TIMEZONE:America/Sao_Paulo";

        foreach ($events as $event) {
            $lines[] = "BEGIN:VEVENT";
            $lines[] = "UID:event-" . $event['id'] . "@bodyharmony.com.br";
            $lines[] = "DTSTAMP:" . $this->formatIcalDate($event['created_at'] ?? date('Y-m-d H:i:s'));
            
            if (!empty($event['start_datetime'])) {
                $lines[] = "DTSTART:" . $this->formatIcalDate($event['start_datetime']);
            }
            if (!empty($event['end_datetime'])) {
                $lines[] = "DTEND:" . $this->formatIcalDate($event['end_datetime']);
            }

            $summary = $this->escapeIcalText(($event['event_type'] === 'urgencia' ? '[URGENTE] ' : '') . $event['title']);
            $lines[] = "SUMMARY:" . $summary;

            if (!empty($event['description'])) {
                $lines[] = "DESCRIPTION:" . $this->escapeIcalText($event['description']);
            }

            $priorityMap = [
                'critica' => 1,
                'alta' => 3,
                'media' => 5,
                'baixa' => 9
            ];
            $prio = $priorityMap[$event['priority'] ?? 'media'] ?? 5;
            $status = $event['status'] ?? 'pendente';
            $icalStatus = match ($status) {
                'concluido', 'em_andamento' => 'CONFIRMED',
                'cancelado' => 'CANCELLED',
                default => 'TENTATIVE',
            };
            $lines[] = "STATUS:" . $icalStatus;
            $lines[] = "END:VEVENT";
        }

        $lines[] = "END:VCALENDAR";

        return implode("\r\n", $lines) . "\r\n";
    }

    private function formatIcalDate(string $dateStr): string {
        $time = strtotime($dateStr);
        return gmdate('Ymd\THis\Z', $time);
    }

    private function escapeIcalText(string $text): string {
        $text = str_replace(["\\", ";", ",", "\n", "\r"], ["\\\\", "\\;", "\\,", "\\n", ""], $text);
        return $text;
    }
}
