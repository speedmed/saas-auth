import { SaasFrontPage } from './app.po';

describe('saas-front App', () => {
  let page: SaasFrontPage;

  beforeEach(() => {
    page = new SaasFrontPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
