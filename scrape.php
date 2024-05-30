<?php
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $allReviews = [];
    
    $reviewLink = product2reviewLink($url);
    $html = fetchContent($reviewLink);
    //echo($html);
    $doc = new DOMDocument();
    $doc->loadHTML($html);

    $xpath = new DOMXPath($doc);
    
    $pattern = '/(\d{1,3}(,\d{3})*|\d{1,3})\s+reviews?/i';
    preg_match($pattern, $html, $matches);
    $totalReviews = isset($matches[1]) ? (int)str_replace(",", "", $matches[1]) : 0;
    
    if($totalReviews > 0){
      $totalPages = ceil($totalReviews/10);
      $allReviews = array_merge($allReviews, extractDetails($xpath));
      if($totalPages > 1){
      for($page = 2; $page <= $totalPages; $page++){
        $rvLink = product2reviewLink($url, $page);
        $html = fetchContent($rvLink);
        //echo($html);
        $doc = new DOMDocument();
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        $allReviews = array_merge($allReviews, extractDetails($xpath, 11));
        
      }
      
      }
      echo(json_encode($allReviews));
    }else{
      echo "No reviews.";
    }


} else {
    echo "No URL provided.";
}


function extractDetails($xpath, $serial = 1){
  $elements = $xpath->query("//*[contains(@class, 'cPHDOP')]");
  $allR = [];
  $sno= $serial;
   for ($i = 1; $i < ($elements->length - 1); $i++) {
     
        $element = $elements->item($i);
        $userNameQuery = $xpath->query(".//*[contains(@class, '_2NsDsF')]", $element);
        if($userNameQuery->length > 0){
          $title = $xpath->query(".//*[contains(@class, 'z9E0IG')]", $element)->item(0)->textContent;
        $rating = $xpath->query(".//*[contains(@class, 'XQDdHH')]", $element)->item(0)->textContent;
        $contentElement = $xpath->query(".//*[contains(@class, 'ZmyHeo')]", $element)->item(0);
        $content = $contentElement->textContent;
        $content = trim(str_replace("READ MORE", "", $content));
        
        if ($xpath->query(".//*[contains(@class, 'XQDdHH')]", $contentElement)->length > 0) {
            $content = substr($content, 1);
        }
        $userName = $xpath->query(".//*[contains(@class, '_2NsDsF')]", $element)->item(0)->textContent;
        $userAddress = $xpath->query(".//*[contains(@class, 'MztJPv')]/span[2]", $element)->item(0)->textContent;
        $userAddress = str_replace(",", "", $userAddress);
        $daysAgo = $xpath->query(".//*[contains(@class, '_2NsDsF')][last()]", $element)->item(0)->textContent;
        $likes = $xpath->query(".//div[contains(@class, 'qhmk-f')][1]//span[contains(@class, 'tl9VpF')]", $element)->item(0)->textContent;
        $dislikes = $xpath->query(".//div[contains(@class, 'qhmk-f')][1]//span[contains(@class, 'tl9VpF')]", $element)->item(1)->textContent;
        }

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

function fetchContent($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    if(curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
    }
    curl_close($ch);
    return $output;
}
?>