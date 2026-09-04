<?php
// api/v1/Controllers/NexusTestController.php

class NexusTestController {
    // Path where docker-compose mounts ../tests/results
    private $reportsPath = '/var/www/tests';

    public function suites() {
        // Since the current testing framework doesn't strictly have "suites" files in the same way 
        // without parsing the whole directory structure, we will return the "Tests" suite implies by the structure.
        // Or we can parse output.xml to find executed suites.
        
        $outputXml = $this->reportsPath . '/output.xml';
        if (!file_exists($outputXml)) {
             Response::json(['suites' => []]);
             return;
        }

        $suites = [];
        try {
            $xml = simplexml_load_file($outputXml);
            if ($xml && isset($xml->suite)) {
                foreach ($xml->suite->suite as $subSuite) {
                    $suites[] = [
                        'id' => (string)$subSuite['id'],
                        'name' => (string)$subSuite['name'],
                        'status' => (string)$subSuite->status['status'],
                        'source' => (string)$subSuite['source']
                    ];
                }
            }
        } catch (Exception $e) {
            // Log error
        }

        Response::json(['suites' => $suites]);
    }

    public function run() {
        // Triggering a run from PHP is complex in Docker without a shared socket or orchestrator.
        // For now, we return a message instructing to use the governance script.
        Response::json([
            'status' => 'info',
            'message' => 'To run tests, execute cycle-governance.ps1 on the host or use the CI/CD pipeline.'
        ]);
    }

    public function status() {
        $outputXml = $this->reportsPath . '/output.xml';
        
        if (!file_exists($outputXml)) {
            Response::json(['status' => 'unknown', 'message' => 'No test results found.']);
            return;
        }

        try {
            $xml = simplexml_load_file($outputXml);
            $generated = (string)$xml['generated'];
            
            $totalStats = $xml->statistics->total->stat;
            $pass = (int)$totalStats['pass'];
            $fail = (int)$totalStats['fail'];
            
            Response::json([
                'status' => 'available',
                'generated_at' => $generated,
                'stats' => [
                    'pass' => $pass,
                    'fail' => $fail,
                    'total' => $pass + $fail
                ]
            ]);
        } catch (Exception $e) {
            Response::json(['status' => 'error', 'message' => 'Failed to parse reports.']);
        }
    }
}
