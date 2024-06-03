<?php
function parseArguments($argv) {
    $args = [];
    foreach ($argv as $arg) {
        if (strpos($arg, '=') !== false) {
            list($key, $value) = explode('=', $arg, 2);
            $args[$key] = $value;
        }
    }
    return $args;
}
if($argv){
  array_shift($argv);
  $_GET = parseArguments($argv);
}

if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $allReviews = [];
    
    $reviewLink = product2reviewLink($url);
    $html = fetchContent($reviewLink);

    libxml_use_internal_errors(true); // Suppress HTML5 parsing warnings
    $doc = new DOMDocument();
    @$doc->loadHTML($html);
    libxml_clear_errors(); // Clear any errors

    $xpath = new DOMXPath($doc);
    
    $pattern = '/(\d{1,3}(,\d{3})*|\d{1,3})\s+reviews?/i';
    preg_match($pattern, $html, $matches);
    $totalReviews = isset($matches[1]) ? (int)str_replace(",", "", $matches[1]) : 0;
    
    if ($totalReviews > 0) {
        $totalPages = ceil($totalReviews / 10);
        $allReviews = array_merge($allReviews, extractDetails($xpath));
        if ($totalPages > 1) {
            for ($page = 2; $page <= $totalPages; $page++) {
                $rvLink = product2reviewLink($url, $page);
                $html = fetchContent($rvLink);
                
                libxml_use_internal_errors(true);
                $doc = new DOMDocument();
                @$doc->loadHTML($html);
                libxml_clear_errors();
                
                $xpath = new DOMXPath($doc);
                $allReviews = array_merge($allReviews, extractDetails($xpath, (10 * ($page - 1) + 1)));
            }
        }
        echo json_encode($allReviews, JSON_PRETTY_PRINT);
    } else {
        echo "No reviews.";
    }
} else {
    echo "No URL provided.";
}

function extractDetails($xpath, $serial = 1) {
    $elements = $xpath->query("//*[contains(@class, 'cPHDOP')]");
    $allR = [];
    $sno = $serial;
    for ($i = 1; $i < ($elements->length - 1); $i++) {
        $element = $elements->item($i);
        $userNameQuery = $xpath->query(".//*[contains(@class, '_2NsDsF')]", $element);

        $title = $xpath->query(".//*[contains(@class, 'z9E0IG')]", $element)->item(0)->textContent ?? null;
        $rating = $xpath->query(".//*[contains(@class, 'XQDdHH')]", $element)->item(0)->textContent ?? null;
        $contentElement = $xpath->query(".//*[contains(@class, 'ZmyHeo')]", $element)->item(0);
        $content = $contentElement ? trim(str_replace("READ MORE", "", $contentElement->textContent)) : null;
        if($contentElement){
          if($xpath->query(".//*[contains(@class, 'XQDdHH')]", $contentElement) -> length > 0){
            $content = substr($content, 1);
          }
        }
        $userName = $userNameQuery->length > 0 ? $userNameQuery->item(0)->textContent : null;
        $userAddressQuery = $xpath->query(".//*[contains(@class, 'MztJPv')]/span[2]", $element);
        $userAddress = $userAddressQuery->length > 0 ? str_replace(", ", "", $userAddressQuery->item(0)->textContent) : null;
        $daysAgoQuery = $xpath->query(".//*[contains(@class, '_2NsDsF')][last()]", $element);
        $daysAgo = $daysAgoQuery->length > 0 ? $daysAgoQuery->item(0)->textContent : null;
        $likesQuery = $xpath->query(".//div[contains(@class, 'qhmk-f')][1]//span[contains(@class, 'tl9VpF')]", $element);
        $likes = $likesQuery->length > 0 ? $likesQuery->item(0)->textContent : '0';
        $dislikes = $likesQuery->length > 1 ? $likesQuery->item(1)->textContent : '0';

        if ($rating && $content && $userName && $daysAgo) {
            $allR[] = [
                'sno' => $sno,
                'title' => $title,
                'rating' => $rating,
                'content' => $content,
                'userName' => $userName,
                'userAddress' => $userAddress,
                'daysAgo' => $daysAgo,
                'likes' => $likes,
                'dislikes' => $dislikes
            ];
            $sno++;
        }
    }
    return $allR;
}

function product2reviewLink($link, $page = null) {
    $url_obj = parse_url($link);
    $pathname = $url_obj['path'];
    parse_str($url_obj['query'], $search_params);
    unset($search_params["spotlightTagId"]);
    unset($search_params["q"]);
    unset($search_params["pageUID"]);
    
    if ($page !== null) {
        $search_params["page"] = $page;
    }
    
    $new_pathname = str_replace("/p/", "/product-reviews/", $pathname);
    $new_query = http_build_query($search_params);
    $new_url = sprintf("%s://%s%s?%s%s",
                       $url_obj['scheme'],
                       $url_obj['host'],
                       $new_pathname,
                       $new_query,
                       isset($url_obj['fragment']) ? "#" . $url_obj['fragment'] : "");
    return $new_url;
}

function fetchContent($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
    }
    curl_close($ch);
    return $output;
}
?>