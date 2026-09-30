<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if (
    $_SERVER["REQUEST_METHOD"] !== "POST" &&
    $_SERVER["REQUEST_METHOD"] !== "PUT"
) {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
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

$id = isset($data["id"])
    ? (int) $data["id"]
    : 0;

if ($id <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Inquiry ID is required."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Read inquiries
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
| Find inquiry
|--------------------------------------------------------------------------
*/

$found = false;

foreach ($inquiries as &$inquiry) {

    if ((int)($inquiry["id"] ?? 0) === $id) {

        if (isset($data["leadName"])) {
            $inquiry["leadName"] = trim($data["leadName"]);
        }

        if (isset($data["company"])) {
            $inquiry["company"] = trim($data["company"]);
        }

        if (isset($data["phone"])) {
            $inquiry["phone"] = trim($data["phone"]);
        }

        if (isset($data["email"])) {
            $inquiry["email"] = trim($data["email"]);
        }

        if (isset($data["state"])) {
            $inquiry["state"] = trim($data["state"]);
        }

        if (isset($data["city"])) {
            $inquiry["city"] = trim($data["city"]);
        }

        if (isset($data["pipelineStage"])) {
            $inquiry["pipelineStage"] =
                trim($data["pipelineStage"]);
        }

        if (isset($data["owner"])) {
            $inquiry["owner"] =
                trim($data["owner"]);
        }

        if (array_key_exists("lastFollowUp", $data)) {
            $inquiry["lastFollowUp"] =
                $data["lastFollowUp"];
        }

        if (array_key_exists("nextFollowUp", $data)) {
            $inquiry["nextFollowUp"] =
                $data["nextFollowUp"];
        }

        if (isset($data["leadResponseMessage"])) {
            $inquiry["leadResponseMessage"] =
                trim($data["leadResponseMessage"]);
        }

        $found = true;

        break;
    }
}

unset($inquiry);


/*
|--------------------------------------------------------------------------
| Inquiry not found
|--------------------------------------------------------------------------
*/

if (!$found) {
    flock($handle, LOCK_UN);
    fclose($handle);

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Inquiry not found."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Save updated JSON
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
        "message" => "Unable to update inquiry."
    ]);

    exit;
}


echo json_encode([
    "success" => true,
    "message" => "Inquiry updated successfully."
]);
