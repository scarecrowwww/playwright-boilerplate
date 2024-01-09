import Crawler from './src/Crawler.js'

const crawler = new Crawler();
(async () => {
	await crawler.init()
	await crawler.movePage()
	await crawler.fetchImage('https://scarecrowwww.github.io/playwright-boilerplate/images/image.jpg', 'test')
	await crawler.getItems()
})()
