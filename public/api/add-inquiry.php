<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed."
    ]);

    exit;
}

$file = getenv("INQUIRY_FILE_PATH")
    ?: __DIR__ . "/../../database/inquiry.json";

$input = file_get_contents("php://input");

$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Validate required fields
|--------------------------------------------------------------------------
*/

$name = trim($data["leadName"] ?? "");
$phone = trim($data["phone"] ?? "");
$state = trim($data["state"] ?? "");
$city = trim($data["city"] ?? "");
$message = trim($data["leadResponseMessage"] ?? "");

if (
    $name === "" ||
    $phone === "" ||
    $state === "" ||
    $city === "" ||
    $message === ""
) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Read existing inquiries
|--------------------------------------------------------------------------
*/

$handle = fopen($file, "c+");

if ($handle === false || !flock($handle, LOCK_EX)) {
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
$inquiries = json_decode($content, true);

if (trim($content) === "") {
    $inquiries = [];
} elseif (!is_array($inquiries)) {
    flock($handle, LOCK_UN);
    fclose($handle);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Inquiry storage contains invalid JSON."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Generate next ID
|--------------------------------------------------------------------------
*/

$nextId = 1;

foreach ($inquiries as $item) {
    if (is_array($item)) {
        $nextId = max($nextId, (int) ($item["id"] ?? 0) + 1);
    }
}


/*
|--------------------------------------------------------------------------
| Create inquiry
|--------------------------------------------------------------------------
*/

$newInquiry = [

    "id" => $nextId,

    "leadName" => $name,

    "company" => trim($data["company"] ?? ""),

    "phone" => $phone,

    "email" => trim($data["email"] ?? ""),

    "state" => $state,

    "city" => $city,

    "source" => "Website",

    "pipelineStage" => "New",

    "owner" => "",

    "lastFollowUp" => null,

    "nextFollowUp" => null,

    "leadResponseMessage" => $message,

    "createdAt" => date("c")

];


/*
|--------------------------------------------------------------------------
| Add inquiry
|--------------------------------------------------------------------------
*/

$inquiries[] = $newInquiry;


/*
|--------------------------------------------------------------------------
| Save JSON
|--------------------------------------------------------------------------
*/

$json = json_encode(
    $inquiries,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);

$writeSucceeded = $json !== false
    && rewind($handle)
    && ftruncate($handle, 0)
    && fwrite($handle, $json) === strlen($json)
    && fflush($handle);

flock($handle, LOCK_UN);
fclose($handle);

if (!$writeSucceeded) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to save inquiry."
    ]);

    exit;
}


echo json_encode([
    "success" => true,
    "message" => "Inquiry submitted successfully.",
    "inquiry" => $newInquiry
]);
