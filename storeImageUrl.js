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

// Import necessary libraries
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

// Supabase client setup
const SUPABASE_URL = 'https://nvtfgmbtnmckjbekznad.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dGZnbWJ0bm1ja2piZWt6bmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDcxMTYsImV4cCI6MjA1ODU4MzExNn0.a_QMo5A_S1B8SnkxNt-NI8q5sCQ4HbNwyIVtfOilWBs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to scrape the image URL and upsert it in Supabase
async function scrapeAndStoreImageUrl() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Go to the website
    await page.goto(BASE_URL);

    // Get the image URL from the page
    const imageUrl = await page.$eval(
      'p[style="text-align:center;padding-top:30px;padding-bottom:60px"] img',
      img => img.src
    );

    // Full URL construction (checking if the image URL is absolute or relative)
    const fullImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${BASE_URL}${imageUrl}`;

    // Upsert the new image URL into the table
    const { data, error } = await supabase
      .from('image')
      .upsert(
        [{ image_url: fullImageUrl }],
        { onConflict: 'image_url' }
      );

    if (error) {
      console.error('Error inserting/updating image URL:', error);
    } else {
      console.log('Successfully inserted/updated image URL:', data);
    }
  } catch (error) {
    console.error('Scraping or database error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the function
scrapeAndStoreImageUrl();
