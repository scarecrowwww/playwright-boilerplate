import { test, expect } from '@playwright/test'
import Crawler from '../src/Crawler.js'
test.describe('Crawler class', () => {
  let crawler

  test.beforeEach(async () => {
    crawler = new Crawler()
    await crawler.init()
  })

  test.afterEach(async () => {
    await crawler.browser.close()
  })

  test('init initializes browser and page', async () => {
    expect(crawler.browser).not.toBeNull()
    expect(crawler.page).not.toBeNull()
  })

  test('initializeBrowser initializes browser and page correctly', async () => {
    // ブラウザとページが初期化されていることを確認
    expect(crawler.browser).not.toBeNull()
    expect(crawler.page).not.toBeNull()
  })

  test('movePage navigates to URL correctly', async () => {
    const url = 'https://example.com/'
    await crawler.movePage(url)
    expect(crawler.page.url()).toBe(url)
  })

  test('fetchImage fetches and writes image correctly', async () => {
    // テスト用の画像URLとファイル名
    const imageUrl = 'https://example.com/image.jpg'
    const fileName = 'test-image'

    const filePath = await crawler.fetchImage(imageUrl, fileName)
    // 画像が正しく保存されたファイルパスが返されることを確認
    expect(filePath).toBe(`./tmp/${fileName}.jpg`)
  })

  test('getTextContent gets text content correctly', async () => {
    // 仮想の要素を作成し、textContentを取得
    await crawler.page.setContent('<div id="test">Hello World</div>')
    const element = await crawler.page.$('#test')
    const textContent = await crawler.getTextContent(element)
    expect(textContent).toBe('Hello World')
  })

  test('getHtmlContent gets HTML content correctly', async () => {
    // 仮想の要素を作成し、innerHTMLを取得
    await crawler.page.setContent('<div id="test"><span>Hello World</span></div>')
    const element = await crawler.page.$('#test')
    const htmlContent = await crawler.getHtmlContent(element)
    expect(htmlContent).toBe('<span>Hello World</span>')
  })

  test('getHref gets href attribute correctly', async () => {
    // 仮想の要素を作成し、href属性を取得
    await crawler.page.setContent('<a id="test" href="https://example.com">Link</a>')
    const element = await crawler.page.$('#test')
    const href = await crawler.getHref(element)
    expect(href).toBe('https://example.com')
  })

  test('getItems fetches items correctly', async () => {
    // 仮想のコンテンツを設定してgetItemsをテスト
    await crawler.page.setContent(`
      <div class="crayons-story__title">
        <a href="item1">Item 1</a>
      </div>
      <div class="crayons-story__title">
        <a href="item2">Item 2</a>
      </div>
    `)
    await crawler.getItems()
  })
})

