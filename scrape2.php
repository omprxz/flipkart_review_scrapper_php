<?php
if (isset($_GET['url'])) {
    $url = filter_var($_GET['url'], FILTER_VALIDATE_URL);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode == 200) {
        echo $response;
    } else {
        echo "Error fetching data from the provided URL. HTTP Code: " . $httpCode;
    }

    curl_close($ch);
} else {
    echo "No URL provided.";
}
?>