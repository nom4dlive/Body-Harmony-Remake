<?php
// libs/SimplePDF.php
// A minimal PDF 1.3 generator for Body Harmony Certificates
// Implements basic text and page handling without external dependencies.

class SimplePDF {
    protected $objects = [];
    protected $buffer = '';
    protected $pageBytes = [];
    protected $width = 842; // A4 Landscape (297mm * 2.83) = ~842 pts
    protected $height = 595; // A4 Landscape (210mm * 2.83) = ~595 pts
    protected $currentFont = '';
    protected $fontSize = 12;

    public function __construct() {
        $this->addObject("1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj");
        $this->addObject("2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj");
        $this->addObject("3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 {$this->width} {$this->height}] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>> >> >> endobj");
        
        // Content stream placeholder (Object 4)
        $this->objects[4] = ""; 
        
        // Font Object (Object 5)
        $this->addObject("5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj");
    }

    protected function addObject($data) {
        $id = count($this->objects) + 1;
        // Adjust for predefined IDs
        // Mapping: 1=Catalog, 2=Pages, 3=Page1, 4=Content1, 5=Font
        // This is a naive implementation for a single page PDF
        $this->objects[$id] = $data;
        return $id;
    }

    public function AddPage() {
        // Already init in constructor for single page
    }

    public function SetFont($family, $style, $size) {
        $this->fontSize = $size;
        // Only Helvetica supported in this primitive version
    }

    public function Text($x, $y, $text) {
        // Simple PDF text positioning
        // Y is inverted in PDF (0 is bottom)
        $y = $this->height - $y;
        $text = str_replace(['(', ')', '\\'], ['\\(', '\\)', '\\\\'], $text);
        
        $stream = "BT /F1 {$this->fontSize} Tf {$x} {$y} Td ({$text}) Tj ET";
        
        // Append to Object 4 (Content)
        if (isset($this->objects[4]) && $this->objects[4] === "") {
             $this->objects[4] = "4 0 obj <</Length " . strlen($stream) . ">> stream\n$stream\nendstream\nendobj";
        } else {
             // In this simple version, we ideally build the stream first.
             // But for hacky appending:
             // Extract stream content
             // This is getting complex for a "Simple" class.
             // Let's store commands in a buffer instead.
        }
        $this->pageBytes[] = $stream;
    }
    
    // Better approach: build content array -> render to object 4 at Output
    public function Output($name = 'doc.pdf', $dest = 'I') {
        $streamContent = implode("\n", $this->pageBytes);
        $this->objects[4] = "4 0 obj <</Length " . strlen($streamContent) . ">> stream\n$streamContent\nendstream\nendobj";

        $buffer = "%PDF-1.3\n";
        $offsets = [];
        
        foreach ($this->objects as $id => $obj) {
            $offsets[$id] = strlen($buffer);
            $buffer .= $obj . "\n";
        }
        
        $xrefStart = strlen($buffer);
        $buffer .= "xref\n";
        $buffer .= "0 " . (count($this->objects) + 1) . "\n";
        $buffer .= "0000000000 65535 f \n";
        
        foreach ($offsets as $offset) {
            $buffer .= sprintf("%010d 00000 n \n", $offset);
        }
        
        $buffer .= "trailer <</Size " . (count($this->objects) + 1) . " /Root 1 0 R>>\n";
        $buffer .= "startxref\n$xrefStart\n%%EOF";
        
        if ($dest === 'D') {
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="'.$name.'"');
            echo $buffer;
        } else {
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="'.$name.'"');
            echo $buffer;
        }
    }

    public function Title($text) {
       $this->Text(300, 100, $text); // Centered-ish title
    }
    
    public function Certify($studentName, $courseName, $date, $hash) {
        $this->SetFont('Helvetica', 'B', 30);
        $this->Text(250, 150, "CERTIFICADO DE CONCLUSAO");
        
        $this->SetFont('Helvetica', '', 16);
        $this->Text(100, 250, "Certificamos que");
        
        $this->SetFont('Helvetica', 'B', 24);
        $this->Text(100, 300, $studentName);
        
        $this->SetFont('Helvetica', '', 16);
        $this->Text(100, 350, "Concluiu com exito o modulo:");
        
        $this->SetFont('Helvetica', 'B', 20);
        $this->Text(100, 400, $courseName);
        
        $this->SetFont('Helvetica', '', 12);
        $this->Text(100, 500, "Data: $date");
        $this->Text(500, 500, "Validacao: $hash");
    }
}
