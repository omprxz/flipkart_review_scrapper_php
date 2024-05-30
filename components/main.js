const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const cLog = (msg) => console.log(msg);
const cErr = (msg) => console.error(msg);

var allReviews = [], isAiFetched = true;
var sentimentScore = 0;
var totalScore = 0;
var totalLikeDislikeAdded = 0;

var prompt = `I have a list of reviews in the following nested array format: [[rating, 'review content', users_liked, users_disliked], ...]. The elements represent:
rating: The rating of the review (1 to 5).
review content: The actual text of the review.
users_liked: The number of users who liked the review.
users_disliked: The number of users who disliked the review.
Reviews input: REVIEWS_ARRAY_QWE
I need you to analyze these reviews and generate the following outputs:
sentimentScore: sentiment score of whole reviews text combined,
Pros: A list of 3 to 5 positive aspects after analysing reviews (pros).
Cons: A list of 3 to 5 negative aspects after analysing reviews (cons). Don't give any exact reviews in pros & cons. Pros & cons must be generated after overall analysis of all reviews.
Summary: A single or maybe double, simple paragraph summarizing the overall product reviews in approximately 50 words. Either keep the summary mostly positive or mostly negative based on the sentiment score of whole reviews text combined if above 50 then positive or if below 50 then negative & it should be like human written.
Please provide the output in a JSON code block and JSON format with the following keys:
pros: [list of 3 to 5 pros]
cons: [list of 3 to 5 cons]
summary: (summary text) Example output:{
"sentimentScore": 78,
"pros": ["Excellent quality", "Very happy", "Awesome product"],
"cons": ["Not worth the money", "Worst product"],
"summary": "Overall, the product has received mostly positive reviews for its quality and satisfaction, though some users found it not worth the money."
}`;

$(document).ready(function () {

  $(".getReviews").click(function () {
    let productLink = $("#productLink").val();
    if (productLink != '') {
      //const reviewLink = product2reviewLink(productLink);
      loadReviewContent(productLink);
    } else {
      Toast.fire({
        title: 'Provide product link',
        icon: 'error'
      });
    }
  });

  function product2reviewLink(link) {
    const urlObj = new URL(link);
    const pathname = urlObj.pathname;
    const searchParams = new URLSearchParams(urlObj.search);
    searchParams.delete("spotlightTagId");
    searchParams.delete("q");
    searchParams.delete("pageUID");
    const newPathname = pathname.replace(/\/p\//,
      "/product-reviews/");
    const newUrl = urlObj.origin + newPathname + "?" + searchParams.toString();
    return newUrl;
  }

  function loadReviewContent(productLink) {
    $('#reviews-data').addClass('d-none');
    $('#reviews-data').removeClass('d-flex');
    $("#result").html("");
    $('#pills-summary-tab').removeClass('active').prop('aria-selected',
      'false');
    $('#pills-summary').removeClass('show active');
    if (!$('#pills-result-tab').hasClass('active')) {
      $('#pills-result-tab').addClass('active').prop('aria-selected', 'true');
      if (!$('#pills-result').hasClass('show')) {
        $('#pills-result').addClass('show active');
      }
    }
    isAiFetched = false;
    var sno = 1;
    allReviews = [];
    $("#sentiment-progress").text(0 + "%").css("width", 0 + "%").attr("aria-valuenow", 0);
    $('.ai-pros').html('');
    $('.ai-cons').html('');
    $('.ai-summary').html('');
    $('.overview-loader').removeClass('d-none');
    $('.overview-loader').addClass('d-flex');
    $('.overview').addClass('d-none');
    $('.overview').removeClass('d-block');

    $("#downloadCsv").css("display", "none");
    const getReviews = $(".getReviews");
    const originalButtonText = getReviews.html();

    $.ajax({
      url: "scrape.php",
      type: "get",
      data: {
        url: productLink
      },
      dataType: 'json',
      beforeSend: function () {
        $(".getReviews")
        .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...')
        .prop("disabled", true);
      },
      success: function (data) {
        console.log(data);
        allReviews = [...data];
        if (allReviews.length > 0) {
          let formattedReviews = "";
          $('#reviews-data').toggleClass('d-flex d-none');
          allReviews.forEach(function (review) {
            const title = review.title;
            const rating = review.rating;
            const content = review.content;
            const userName = review.userName;
            const userAddress = review.userAddress;
            const daysAgo = review.daysAgo;
            const likes = review.likes;
            const dislikes = review.dislikes;

            if (rating && content && userName && daysAgo) {
              formattedReviews = "";
              var cardTitle = title !== null ? '<h5 class="card-title">' + title + '</h5>': '';

              formattedReviews += '<div class="card mb-3"><div class="card-body">' + cardTitle + '<h6 class="card-subtitle mb-2 text-muted">Rating: ' + rating + ' ⭐</h6><p class="card-text">' + content + '</p><p class="card-text"><small class="text-muted">User: ' + userName + ", " + userAddress + '</small></p><p class="card-text"><small class="text-muted">' + daysAgo + '</small></p><p class="card-text">👍 ' + likes + " | 👎 " + dislikes + "</p></div></div>";
            }
            $("#result").append(formattedReviews);
          });
          $("#downloadCsv").css("display",
            "inline-block");
          Toast.fire({
            title: "Reviews fetched",
            icon: 'success'
          });
        } else {
          Toast.fire({
            title: "No reviews found",
            icon: 'warning'
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        cErr("Error loading review content: " + textStatus);
        Toast.fire({
          title: "Error: " + textStatus,
          icon: 'error'
        });
      },
      complete: function () {
        $(".getReviews")
        .html(originalButtonText)
        .prop("disabled", false);
      }
    });
  }

  function escapeCSVValue(value) {
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  function convertToCSV(reviews) {
    const headers = [
      "S.No.",
      "Title",
      "Rating",
      "Content",
      "User Name",
      "User Address",
      "Days Ago",
      "Likes",
      "Dislikes"
    ];
    const rows = reviews.map((review, index) => [
  review.sno,
  review.title !== null ? escapeCSVValue(review.title) : '',
  escapeCSVValue(review.rating),
  escapeCSVValue(review.content),
  escapeCSVValue(review.userName),
  escapeCSVValue(review.userAddress),
  escapeCSVValue(review.daysAgo),
  escapeCSVValue(review.likes),
  escapeCSVValue(review.dislikes)
]);
    return [headers,
      ...rows].map((e) => e.join(",")).join("\n");
  }

  function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], {
      type: "text/csv"
    });
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  $("#downloadCsv").click(function () {
    if (allReviews.length === 0) {
      alert("No reviews available to download.");
      return;
    }
    const csv = convertToCSV(allReviews);
    downloadCSV(csv, "reviews.csv");
  });
});