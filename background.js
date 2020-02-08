chrome.webNavigation.onHistoryStateUpdated.addListener(({ url }) => {
  const isPeopleSearchURL = url.indexOf('linkedin.com/search/results/people') >= 0;

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {
      command: 'historyStateChanged',
      settings: { isPeopleSearchURL },
    });
  });
});
