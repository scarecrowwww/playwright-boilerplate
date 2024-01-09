import Crawler from './src/Crawler.js'

const crawler = new Crawler();
await crawler.init()
await crawler.movePage()
await crawler.getItems('.crayons-story__title > a')
