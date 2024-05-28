const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter',
      Swal.stopTimer)
    toast.addEventListener('mouseleave',
      Swal.resumeTimer)
  }
})
$(document).ready(function () {
  const cLog = (msg) => console.log(msg);
  const cErr = (msg) => console.error(msg);

  let allReviews = [];

  $(".getReviews").click(function () {
    const productLink = $("#productLink").val();
    const reviewLink = product2reviewLink(productLink);
    loadReviewContent(reviewLink);
  });

  function product2reviewLink(link) {
    const urlObj = new URL(link);
    const pathname = urlObj.pathname;
    const searchParams = new URLSearchParams(urlObj.search);
    searchParams.delete("spotlightTagId");
    searchParams.delete("q");
    searchParams.delete("pageUID");
    const newPathname = pathname.replace(/\/p\//, "/product-reviews/");
    const newUrl =
    urlObj.origin + newPathname + "?" + searchParams.toString();
    return newUrl;
  }

  function loadReviewContent(reviewLink) {
    $("#result").html("");
    var sno = 1;
    allReviews = [];

    $("#downloadCsv").css("display", "none");
    const getReviews = $(".getReviews");
    const originalButtonText = getReviews.html();

    $.ajax({
      url: "scrape.php",
      method: "GET",
      data: {
        url: reviewLink
      },
      beforeSend: function () {
        $(".getReviews")
        .html(
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...'
        )
        .prop("disabled", true);
      },
      success: function (data) {
        if (data != "") {
          const pattern =
          /(\d{1,3}(,\d{3})*|\d{1,3})(\.\d+)?(\s+r(ating|eview)s?)/gi;
          const match = data.match(pattern);
          const totalReviews = parseInt(match[1].replace(/,/g, ""), 10);
          cLog(totalReviews)
          if (totalReviews > 0) {
            const totalPages = Math.ceil(totalReviews / 10);
            let formattedReviews = "";
            for (let i = 1; i <= totalPages; i++) {
              formattedReviews = "";
              const reviewPageLink = reviewLink + "&page=" + i;
              $.ajax({
                url: "scrape.php",
                type: "get",
                async: false,
                data: {
                  url: reviewPageLink
                },
                success: function (data) {
                  const reviews = $(data).find(".cPHDOP");
                  reviews.each(function () {
                    formattedReviews = "";
                    const title = $(this).find(".z9E0IG").text().trim();
                    const rating = $(this).find(".XQDdHH").text().trim();
                    const contentElement = $(this).find(".ZmyHeo");
                    let content = contentElement.text().trim().replace(/READ MORE/gi, "");

                    if (contentElement.find(".XQDdHH").length > 0) {
                      content = content.substring(1);
                    }
                    const userName = $(this).find("._2NsDsF").first().text().trim();
                    const userAddress = $(this).find(".MztJPv > span:nth-child(2)").text().trim().replace(/,/g, "");
                    const daysAgo = $(this).find("._2NsDsF").last().text().trim();
                    const likes = $(this).find(".qhmk-f .tl9VpF").first().text().trim();
                    const dislikes = $(this).find(".qhmk-f .tl9VpF").last().text().trim();

                    if (rating && content && userName && daysAgo) {
                      formattedReviews += '<div class="card mb-3"><div class="card-body"><h5 class="card-title">' + title + '</h5><h6 class="card-subtitle mb-2 text-muted">Rating: ' + rating + ' ⭐</h6><p class="card-text">' + content + '</p><p class="card-text"><small class="text-muted">User: ' + userName + ", " + userAddress + '</small></p><p class="card-text"><small class="text-muted">' + daysAgo + '</small></p><p class="card-text">👍 ' + likes + " | 👎 " + dislikes + "</p></div></div>";
                      allReviews.push({
                        sno,
                        title,
                        rating,
                        content,
                        userName,
                        userAddress,
                        daysAgo,
                        likes,
                        dislikes
                      });
                      sno++
                    }
                    $("#result").append(formattedReviews);
                  });
                },
                error: function (jqXHR,
                  textStatus,
                  errorThrown) {
                  cErr("Error loading review content: " + textStatus);
                  Toast.fire({
                    title: "Error: "+textStatus,
                    icon: 'error'
                  })
                }
              });
            }
            $("#downloadCsv").css("display", "inline-block");
            Toast.fire({
              title: "Reviews fetched",
              icon: 'success'
            })
          } else {
            Toast.fire({
              title: "No reviews",
              icon: 'warning'
            })
            return;
          }
        } else {
          Toast.fire({
            title: "Can't fetch. Try again",
            icon: 'error'
          })
          return;
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        cErr("Error loading review content: " + textStatus);
        Toast.fire({
          title: "Error: "+textStatus,
          icon: 'error'
        })
        $(".getReviews")
        .html(originalButtonText)
        .prop("disabled", false);
      },
      complete: function () {
        $(".getReviews")
        .html(originalButtonText)
        .prop("disabled", false);
      }
    });
  }

  function escapeCSVValue(value) {
    if (
      value.includes(",") ||
      value.includes("\n") ||
      value.includes('"')
    ) {
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
    const rows = reviews.map((review) => [
      review.sno,
      escapeCSVValue(review.title),
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