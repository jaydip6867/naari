<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$file = getenv("INQUIRY_FILE_PATH")
    ?: __DIR__ . "/../../database/inquiry.json";
$handle = fopen($file, "c+");

if ($handle === false || !flock($handle, LOCK_SH)) {
    if ($handle !== false) {
        fclose($handle);
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to access inquiry storage."
    ]);

    exit;
}

$content = stream_get_contents($handle);
$data = json_decode($content, true);

flock($handle, LOCK_UN);
fclose($handle);

if (trim($content) === "") {
    $data = [];
} elseif (!is_array($data)) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Inquiry storage contains invalid JSON."
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "inquiries" => $data
]);
