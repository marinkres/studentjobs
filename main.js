require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');

const URL = 'https://studentski-poslovi.hr/pretraga?category=it-poslovi&province=zagreb&activated_from=all&min_hour_rate=';

async function scrapeJobs() {
  try {
    console.log('Fetching data from:', URL);
    const response = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Response received. Status:', response.status);
    
    const $ = cheerio.load(response.data);
    const jobs = [];

    console.log('Parsing job listings...');
    
    $('.job-post').each((index, element) => {
      const title = $(element).find('[dusk^="job-title-"]').text().trim();
      const company = $(element).find('.text-sm.font-medium').text().trim();
      const link = $(element).attr('data-url');
      const date = $(element).find('.text-sm.text-slate-600').first().text().trim();
      const salary = $(element).find('.text-slate-600 .uil-money-bill').parent().text().trim();
      const location = $(element).find('.text-slate-600 .uil-map-marker').parent().text().trim();

      jobs.push({ title, company, link, date, salary, location });
      console.log(`Job ${index + 1} parsed:`, { title, company, link, date, salary, location });
    });

    console.log(`Total jobs found: ${jobs.length}`);
    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return [];
  }
}

async function saveJobs(jobs) {
  await fs.writeFile('previous_jobs.json', JSON.stringify(jobs, null, 2));
}

async function loadPreviousJobs() {
  try {
    const data = await fs.readFile('previous_jobs.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function findNewJobs(currentJobs, previousJobs) {
  return currentJobs.filter(currentJob => 
    !previousJobs.some(prevJob => prevJob.link === currentJob.link)
  );
}

async function sendEmail(newJobs) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'New Student IT Jobs in Zagreb',
    html: `
      <h1>New Student IT Jobs in Zagreb</h1>
      <ul>
        ${newJobs.map(job => `
          <li>
            <strong>${job.title}</strong><br>
            Company: ${job.company}<br>
            Salary: ${job.salary}<br>
            Location: ${job.location}<br>
            Date: ${job.date}<br>
            <a href="${job.link}">View Job</a>
          </li>
        `).join('')}
      </ul>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function checkForNewJobs() {
  console.log('Checking for new jobs...');
  const currentJobs = await scrapeJobs();
  const previousJobs = await loadPreviousJobs();
  const newJobs = findNewJobs(currentJobs, previousJobs);

  if (newJobs.length > 0) {
    console.log(`Found ${newJobs.length} new job(s). Sending email...`);
    await sendEmail(newJobs);
    await saveJobs(currentJobs);
    console.log('Email sent and jobs updated.');
  } else {
    console.log('No new jobs found.');
  }
}

// Run the job check
checkForNewJobs();