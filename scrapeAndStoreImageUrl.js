const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://www.vadm.org";

async function getCalendarImageUrl() {
  try {
    const { data: html } = await axios.get(BASE_URL);
    const $ = cheerio.load(html);

    // This targets the <p> tag with center alignment and padding, and then gets the img inside
    const imageRelativeSrc = $("p[style*='text-align:center']")
      .find("img")
      .attr("src");

    if (!imageRelativeSrc) {
      throw new Error("Could not find image URL");
    }

    const fullImageUrl = BASE_URL + imageRelativeSrc;
    return fullImageUrl;
  } catch (error) {
    console.error("Error fetching image URL:", error.message);
    return null;
  }
}

// Run it if called directly
getCalendarImageUrl().then(url => console.log("Image URL:", url));


// Import necessary libraries
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

// Supabase client setup
const SUPABASE_URL = 'https://nvtfgmbtnmckjbekznad.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dGZnbWJ0bm1ja2piZWt6bmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDcxMTYsImV4cCI6MjA1ODU4MzExNn0.a_QMo5A_S1B8SnkxNt-NI8q5sCQ4HbNwyIVtfOilWBs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to scrape the image URL and insert into Supabase
async function scrapeAndStoreImageUrl() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Go to the website
  await page.goto('https://www.vadm.org/');

  // Get the image URL from the page
  const imageUrl = await page.$eval('p[style="text-align:center;padding-top:30px;padding-bottom:60px"] img', img => img.src);

  // Full URL construction (checking if the image URL is absolute or relative)
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.vadm.org${imageUrl}`;

  // Insert the image URL into the Supabase database
  const { data, error } = await supabase
    .from('image')
    .insert([
      { image_url: fullImageUrl }
    ]);

  if (error) {
    console.error('Error inserting image URL:', error);
  } else {
    console.log('Successfully inserted image URL:', data);
  }

  await browser.close();
}

// Run the function
scrapeAndStoreImageUrl();