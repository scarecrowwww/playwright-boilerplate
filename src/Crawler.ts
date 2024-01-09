import { firefox, Browser, Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

const TIMEOUT = 60000;
const BASE_URL = 'https://dev.to';
const log = (value: any) => console.log(value);

const playwrightOptions = {
  args: ['--lang=ja,en-US,en', '--no-sandbox', '--disable-setuid-sandbox'],
  headless: false,
};

class Crawler {
  private browser: Browser | null;
  private page: Page | null;
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.browser = null;
    this.page = null;
    this.baseUrl = baseUrl;
  }

  async init(): Promise<void> {
    try {
      await this.initializeBrowser();
    } catch (error) {
      log(`Error in init: ${error}`);
    }
  }

  async initializeBrowser(): Promise<void> {
    this.browser = await firefox.launch(playwrightOptions);
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.setDefaultNavigationTimeout(TIMEOUT);
    log('Browser initialized');
  }

  async movePage(url: string = this.baseUrl): Promise<void> {
    try {
      await this.page!.goto(url, { waitUntil: 'networkidle' });
      log(`Navigated to ${url}`);
    } catch (error) {
      log(`Error navigating to ${url}: ${error}`);
    }
  }

  async downloadImage(imageUrl: string, fileName: string): Promise<string | null> {
    const dirPath = './download_images';
    const filePath = path.join(dirPath, `${fileName}.jpg`);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();

      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, Buffer.from(buffer), 'binary');
      return filePath;
    } catch (error) {
      log(`Error fetching image from ${imageUrl}: ${error.message}`);
      return null;
    }
  }

  async getTextContent(element: any): Promise<string> {
    try {
      return (await element.textContent()).trim();
    } catch (error) {
      log(`Error getting text content: ${error}`);
      return '';
    }
  }

  async getHtmlContent(element: any): Promise<string> {
    try {
      return (await element.innerHTML()).trim();
    } catch (error) {
      log(`Error getting HTML content: ${error}`);
      return '';
    }
  }

  async getHref(element: any): Promise<string> {
    try {
      return await element.getAttribute('href');
    } catch (error) {
      log(`Error getting href: ${error}`);
      return '';
    }
  }

  async getItems(elementIdentifier: string): Promise<{ title: string; href: string }[]> {
    try {
      const foundItems = await this.page!.$$(elementIdentifier);
      log(`Found ${foundItems.length} items`);

      const gotItems: { title: string; href: string }[] = [];

      for (const item of foundItems) {
        const title = await this.getTextContent(item);
        const href = await this.getHref(item);
        gotItems.push({ title, href });
      }

      log(gotItems);
      return gotItems;
    } catch (error) {
      log(`Error getting items: ${error}`);
      return [];
    }
  }
}

export default Crawler;
