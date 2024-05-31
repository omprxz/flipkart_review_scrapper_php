# Flipkart Reviews Scraper

This project provides a web interface to extract Flipkart product reviews using PHP and JavaScript. It allows users to input a Flipkart product link and fetches all available reviews for analysis.

## Overview

The project consists of three main components:

1. **PHP Backend (`scrape.php`):**
   - Handles the scraping of Flipkart product reviews based on the provided URL.
   - Utilizes cURL for fetching web content and DOMDocument for parsing HTML.
   - Extracts review details such as title, text, rating, user name, user address, review likes, dislikes, and review date.
   - Provides an API endpoint for fetching review data in JSON format.

2. **JavaScript Frontend (`main.js`):**
   - Provides an interactive user interface using jQuery and Bootstrap.
   - Allows users to input a Flipkart product link and fetch reviews.
   - Displays fetched reviews with details such as title, rating, content, user information, likes, and dislikes.
   - Allows users to download fetched reviews in CSV format.

3. **HTML Interface (`index.html`):**
   - Provides a simple and intuitive interface for users to interact with.
   - Allows users to input the Flipkart product link and initiate the review fetching process.
   - Displays fetched reviews in a tabular format for easy viewing.
   - Includes tabs for viewing all reviews and AI-generated overview.

## Additional Details

- **AI Overview:**
  - Utilizes Google's Generative AI to generate an overview of the product reviews.
  - Analyzes the sentiment of the reviews and provides a sentiment score.
  - Generates pros and cons based on the overall analysis of the reviews.
  - Summarizes the overall product reviews in a concise paragraph.

- **Extra Functionality:**
  - Extracts detailed information from Flipkart reviews, including title, text, rating, user name, user address, review likes, dislikes, and review date.
  - Provides an option to download fetched reviews in CSV format for further analysis.

## Additional File Details

In this project, alongside the primary scripts `main.js` and `scrape.php`, you'll find additional scripts `main2.js` and `scrape2.php`. These complementary scripts are designed to work together seamlessly, enhancing the functionality provided by their counterparts.

One notable difference is in the data scraping mechanism employed. While `main.js` and `scrape.php` utilize PHP for data scraping, `main2.js` and `scrape2.php` leverage jQuery and JavaScript for this purpose. This approach offers flexibility and efficiency in handling reviews data, catering to different project requirements and preferences.

## Usage

1. Clone the repository to your local machine.
2. Open `index.html` in a web browser.
3. Input the Flipkart product link and click on "Get Reviews" to fetch reviews.
4. Explore the fetched reviews and AI-generated overview for insights.

## Bonus (Terminal Support)
`scrape.php` also support terminal support for reviews scarpping.
1. Install PHP in your OS (like Linux, MacOS or Termux)
2. Run this commamd to clone the project to your local storage
   ```sh 
   git clone  https://github.com/omprxz/flipkart_review_scrapper_php.git
   cd flipkart_review_scrapper_php
    ```
3. Execute `scrape.php` file with this command format:
   ```sh
   php scrape.php url=https://www.flipkart.com/xxxxx...
   ```

## Dependencies

- jQuery: 3.7.1
- Bootstrap: 5.3.3
- SweetAlert2: 11
- Google Generative AI: Latest version