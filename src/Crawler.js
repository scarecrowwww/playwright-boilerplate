import { writeFile } from 'fs/promises'
import { firefox } from 'playwright'

const TIMEOUT = 60000
const BASE_URL = 'https://dev.to'
const log = value => console.log(value)

const playwrightOptions = {
  args: ['--lang=ja,en-US,en', '--no-sandbox', '--disable-setuid-sandbox'],
  headless: false,
}

class Crawler {
  constructor() {
    this.browser = null
    this.page = null
    this.init()
  }

  async init() {
    try {
      await this.initializeBrowser()
    } catch (error) {
      log(`Error in init: ${error}`)
    } finally {
      if (this.browser) {
        await this.browser.close()
      }
    }
  }

  async initializeBrowser() {
    this.browser = await firefox.launch(playwrightOptions)
    this.page = await this.browser.newPage()
    await this.page.setViewportSize({ width: 1280, height: 800 })
    await this.page.setDefaultNavigationTimeout(TIMEOUT)
    log('Browser initialized')
  }

  async movePage(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' })
      log(`Navigated to ${url}`)
    } catch (error) {
      log(`Error navigating to ${url}: ${error}`)
    }
  }

  async fetchImage(imageUrl, fileName) {
    try {
      const response = await fetch(`${imageUrl}`)
      const buffer = await response.arrayBuffer()
      const filePath = `./tmp/${fileName}.jpg`
      await writeFile(filePath, Buffer.from(buffer), 'binary')
      return filePath
    } catch (error) {
      log(`Error fetching image: ${error}`)
      return null
    }
  }

  async getTextContent(element) {
    try {
      return (await element.textContent()).trim()
    } catch (error) {
      log(`Error getting text content: ${error}`)
      return ''
    }
  }

  async getHtmlContent(element) {
    try {
      return (await element.innerHTML()).trim()
    } catch (error) {
      log(`Error getting HTML content: ${error}`)
      return ''
    }
  }

  async getHref(element) {
    try {
      return await element.getAttribute('href')
    } catch (error) {
      log(`Error getting href: ${error}`)
      return ''
    }
  }

  async getItems() {
    try {
      await this.movePage(BASE_URL)
      const newsItems = await this.page.$$('.crayons-story__title')
      log(`Found ${newsItems.length} news items`)

      for (const newsItem of newsItems) {
        const titleElement = await newsItem.$('a')
        if (titleElement) {
          const title = await this.getTextContent(titleElement)
          const href = await this.getHref(newsItem)
          log(`Title: ${title}, Link: ${BASE_URL}/${href}`)
        }
      }
    } catch (error) {
      log(`Error getting items: ${error}`)
    }
  }
}

export default Crawler
