<?php
$passwords = [
    'nom4d' => 'nom4d010203',
    'josi' => 'josi010203',
    'student' => 'Mudar123!'
];

foreach ($passwords as $user => $pass) {
    echo "$user: " . password_hash($pass, PASSWORD_BCRYPT) . "\n";
}
?>
