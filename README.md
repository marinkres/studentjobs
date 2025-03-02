# Student Job Scraper

A fully automated system to scrape IT student job listings from studentski-poslovi.hr and send email notifications for new job postings. This project utilizes Node.js for web scraping and email handling, along with GitHub Actions for automation.

## Features

- Automated Job Scraping: Fetches the latest IT job listings every 6 hours.
- Email Notifications: Sends an email summarizing new job postings.
- GitHub Actions Automation: Ensures the script runs at regular intervals with no manual intervention.
- Job History Tracking: Tracks previously scraped jobs to avoid duplicate notifications.

## How It Works

1. The script scrapes IT job postings from studentski-poslovi.hr.
2. It compares the newly scraped jobs with previously saved jobs (previous_jobs.json).
3. If new jobs are found, an email is sent to the configured recipient(s).
4. The job history is updated and committed back to the repository.

## Prerequisites

1. Node.js: Ensure Node.js (v20.16.0 or later) is installed.
2. GitHub Secrets: Configure the following secrets in your repository:
- EMAIL_USER: Your email address (used as the sender).
- EMAIL_APP_PASSWORD: Your email account's app-specific password.
- EMAIL_TO: The recipient's email address.
- GH_TOKEN: A GitHub personal access token for committing updates to the repository.

## Installation

NPM:
```
npm i marink-studentjobs
```
OR

1. Clone the repository:
    ```
    git clone https://github.com/yourusername/studentjobs.git
    cd studentjobs
    ```
2. Install the required dependencies:
    ```
    npm install
    ```
3. Create a .env file with the following content:
    ```
    EMAIL_USER=your-email@example.com
    EMAIL_APP_PASSWORD=your-app-password
    EMAIL_TO=recipient-email@example.com
    ```
4. (Optional) Add a previous_jobs.json file to track job history. An empty array is sufficient:
    ```
    []
    ```
5. Change the github workflow to your repository.

## Automation with GitHub Actions

This project uses GitHub Actions to run the script every 6 hours. The workflow is defined in .github/workflows/scrape-jobs.yml.

Key Features of the Workflow:
- Automated Scheduling: The script runs every 6 hours using cron.
- Push Updates: Updates to previous_jobs.json are committed and pushed back to the repository.
- Manual Triggering: The workflow can also be triggered manually via the GitHub Actions interface.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.