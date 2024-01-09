import { test, expect } from '@playwright/test'
import { promises as fs } from 'fs'
import Crawler from '../src/Crawler.js'

const TEST_URL = 'https://scrcr.github.io/playwright-boilerplate/'
const IMAGE_URL = `${TEST_URL}images/image.jpg`

test.describe('Crawler class', () => {
  let crawler

  test.beforeEach(async () => {
    crawler = new Crawler()
    await crawler.init()
  })

  test.afterEach(async () => {
    await crawler.browser.close()
  })

  test('initializeBrowser initializes browser and page correctly', async () => {
    expect(crawler.browser).not.toBeNull()
    expect(crawler.page).not.toBeNull()

    await crawler.movePage(TEST_URL)
    expect(crawler.page.url()).toBe(TEST_URL)
  })

  test('downloadImage fetches and writes image correctly', async () => {
    const fileName = 'test-image'
    const expectedFilePath = `download_images/${fileName}.jpg`

    const filePath = await crawler.downloadImage(IMAGE_URL, fileName)

    expect(filePath).toBe(expectedFilePath)

    try {
      const fileStat = await fs.stat(expectedFilePath)
      expect(fileStat.isFile()).toBeTruthy()
      expect(fileStat.size).toBeGreaterThan(0)
    } catch (error) {
      expect(error).toBeNull()
    }
  })

  test('getTextContent gets text content correctly', async () => {
    await crawler.movePage(TEST_URL)
    const textElement = await crawler.page.$('#test-text')
    const textContent = await crawler.getTextContent(textElement)
    expect(textContent).toBe('Hello World')

    const htmlElement = await crawler.page.$('#test-html')
    const htmlContent = await crawler.getHtmlContent(htmlElement)
    expect(htmlContent).toBe('<span>Hello World</span>')

    const linkElement = await crawler.page.$('#test-link')
    const href = await crawler.getHref(linkElement)
    expect(href).toBe(TEST_URL)
  })

  test('getItems fetches items correctly', async () => {
    await crawler.movePage(TEST_URL)
    const items = await crawler.getItems('.crayons-story__title')
    expect(items.length).toBe(2)
    expect(items[0].title).toBe('Item 1')
    expect(items[0].href).toBe('https://github.com')
    expect(items[1].title).toBe('Item 2')
    expect(items[1].href).toBe('https://gist.github.com')
  })
})

