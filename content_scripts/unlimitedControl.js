// TODO investigate ProfileActions, there is something more
// TODO use isConnectingFollowEnabled FINALLY
// TODO use keywords search (big field on top for serach by name)
// TODO move all rest setting to the storage

window.UCSettigs = {
  currentPage: 1,
  isInitFinished: false,
};

const DEFAULT_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const DEFAULT_PROFILES_PER_PAGE_AMOUNT = 10;
const API_BASE_URL = 'https://www.linkedin.com/voyager/api/';
const FILTERS_ARRAY = ['geoRegion', 'currentCompany', 'network', 'connectionOf'];
const HIGHEST_EXPECTED_SUCCESS_STATUS_CODE = 207;
let currentControlsElement = null;
let newResultsElement = null;

const hideOriginList = () => {
  const originListElement = document.querySelector('.blended-srp-results-js');

  if (!originListElement) {
    console.warn('<UnlimitedControl> origin list not found on the page');
  } else {
    originListElement.classList.add('hide-origin-results');
  }
};

const clearList = () => {
  const listNode = document.getElementById('uc-results-list');

  hideOriginList();

  if (!listNode) {
    console.warn('<UnlimitedControl> uc-results-list not found on the page');
  } else {
    listNode.innerHTML = '';
  }
};

const getProfileImageMarkUp = ({ attributes }) => {
  const { picture } = attributes[0].miniProfile;
  const isImageExists = picture && picture['com.linkedin.common.VectorImage'];
  const imageClass = `lazy-image ivm-view-attr__img--centered EntityPhoto-circle-4  presence-entity__image EntityPhoto-circle-4 loaded ${
    isImageExists ? '' : 'ghost-person'
  }`;
  let imageSrc = DEFAULT_IMAGE_PLACEHOLDER;

  if (isImageExists) {
    const { rootUrl, artifacts } = picture['com.linkedin.common.VectorImage'];
    imageSrc = `${rootUrl}${artifacts[3].fileIdentifyingUrlPathSegment}`;
  }

  return `
    <figure class="search-result__image">
      <div class="ivm-image-view-model ember-view">
          <img 
            class="${imageClass}"
            src="${imageSrc}"
          />
      </div>
    </figure>
  `;
};

const getSocialProofMarkUp = socialProofText => {
  if (!socialProofText) return '';

  return `
      <div class="search-result__social-proof ember-view">
        <li-icon aria-hidden="true" type="people-icon" class="t-black--light" size="small">
          <svg viewBox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveAspectRatio="xMinYMin meet" class="artdeco-icon" focusable="false">
            <path d="M14.27,9.23l-1.2-.45,0.31-.51A4.17,4.17,0,0,0,14,6.08V5.5a2.5,2.5,0,0,0-5,0V6.08a4.17,4.17,0,0,0,.62,2.19L9.93,8.78l-1.15.43a3.48,3.48,0,0,0-1-.63L7,8.29V7.73l0.25-.41A5,5,0,0,0,8,4.69V4A3,3,0,0,0,2,4V4.69a5,5,0,0,0,.75,2.63L3,7.73V8.29l-0.74.29A3.5,3.5,0,0,0,0,11.84V13a1,1,0,0,0,1,1H15a1,1,0,0,0,1-1V11.75A2.7,2.7,0,0,0,14.27,9.23ZM10.88,5.38a0.63,0.63,0,0,1,1.25,0v1a2.29,2.29,0,0,1-.34,1.2L11.5,8l-0.28-.46a2.29,2.29,0,0,1-.34-1.2v-1ZM4,3.75a1,1,0,0,1,2,0V5.19a3,3,0,0,1-.38,1.46l-0.33.6a0.25,0.25,0,0,1-.22.13H4.93a0.25,0.25,0,0,1-.22-0.13l-0.33-.6A3,3,0,0,1,4,5.19V3.75ZM8,12H2V11.68a1.5,1.5,0,0,1,1-1.4L4.5,9.7V9.2a2,2,0,0,0,.4.05H5.1A2,2,0,0,0,5.5,9.2V9.7L7,10.28a1.5,1.5,0,0,1,1,1.4V12Zm6.13,0H10V11.84a3.48,3.48,0,0,0-.24-1.25L11,10.13V9.75h1v0.38l1.54,0.61a0.93,0.93,0,0,1,.58.87V12Z" class="small-icon" style="fill-opacity: 1"></path>
          </svg>
        </li-icon>

        <span class="search-result__social-proof-count t-12 t-black--light ml1">${socialProofText}</span>
      </div>
    `;
};

const createProfileBlock = (
  { headline, publicIdentifier, navigationUrl, subline, title, image, socialProofText, trackingId },
  profileActionsID,
) => {
  const resultsListElement = document.getElementById('uc-results-list');

  if (!resultsListElement) {
    console.error('<Unlimited Control> No uc-results-list leement found on the page, during createProfileBlock');
    return;
  }

  const imageMarkUp = getProfileImageMarkUp(image);
  const profileLink = navigationUrl || `/in/${publicIdentifier}/`;
  const socialProofMarkUp = getSocialProofMarkUp(socialProofText);

  resultsListElement.insertAdjacentHTML(
    'beforeend',
    `<li class="search-result search-result__occluded-item ember-view">
          <div class="search-entity search-result search-result--person search-result--occlusion-enabled ember-view">
              <div class="search-result__wrapper">
                  <div class="search-result__image-wrapper">
                      <a class="search-result__result-link ember-view" href="${profileLink}">
                          ${imageMarkUp}
                      </a>
                  </div>
                  
                  <div class="search-result__info pt3 pb4 ph0">
                      <a class="search-result__result-link ember-view" href="${profileLink}">
                          <h3 class="actor-name-with-distance search-result__title single-line-truncate ember-view">
                              ${title.text}
                          </h3>
                      </a>

                      <p class="subline-level-1 t-14 t-black t-normal search-result__truncate">${headline.text}</p>

                      <p class="subline-level-2 t-12 t-black--light t-normal search-result__truncate">
                        ${subline.text}
                      </p>

                      ${socialProofMarkUp}
                  </div>

                  <div class="search-result__actions">
                    <button 
                      class="uc-connect search-result__action-button search-result__actions--primary artdeco-button artdeco-button--default artdeco-button--2 artdeco-button--secondary"
                      trackingID="${trackingId}"
                      profileID="${publicIdentifier}"
                      actionsID="${profileActionsID}"
                    >                          
                      Connect
                    </button>
                  </div>
              </div>
          </div>
      <li>`,
  );
};

const prepareResultsMarkup = () => {
  const originSearchResults = document.querySelector('.search-results__list');

  if (!originSearchResults) return false;
  if (newResultsElement) return true;

  const ucResultsList = document.createElement('ul');
  const ucResultsCount = document.createElement('h3');

  ucResultsList.setAttribute('id', 'uc-results-list');
  ucResultsList.setAttribute('class', 'list-style-none');

  ucResultsCount.setAttribute('id', 'uc-results-count');
  ucResultsCount.setAttribute('class', 'pt4 pb0 t-14 t-black--light t-normal pl5 clear-both');

  originSearchResults.after(ucResultsList);
  originSearchResults.before(ucResultsCount);

  newResultsElement = document.getElementById('uc-results-list');

  return true;
};

const createControlBlock = () => {
  const { currentPage } = window.UCSettigs;

  document.getElementById('extended-nav').insertAdjacentHTML(
    'beforeend',
    `<div id="unlimited-controls" class="unlimited-controls">
      <button id="uc-prev-page" class="unlimited-controls__button artdeco-button">Prev Page</button>
      <input id="uc-current-page" class="unlimited-controls__input" placeholder="page #" type="number" min="1" value="${currentPage}">
      <button id="uc-next-page" class="unlimited-controls__button artdeco-button">Next Page</button>
      <div id="uc-toggler" class="unlimited-controls__toggler" title="Minimize"></div>
    </div>`,
  );
};

const removeControlsBlock = () => {
  if (currentControlsElement) {
    document.getElementById('unlimited-controls').remove();
    currentControlsElement = null;
  }

  newResultsElement = null;
  window.UCSettigs.isInitFinished = false;
};

const getValueFromCookieField = fieldName => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${fieldName}=`);
  let returnedValue = '';

  if (parts.length === 2) {
    returnedValue = parts
      .pop()
      .split(';')
      .shift()
      .slice(1, -1);
  }

  return returnedValue;
};

const getCSRFToken = () => {
  const fieldName = 'JSESSIONID';
  const token = getValueFromCookieField(fieldName);

  return token;
};

const sendRequest = (URL, settings = {}, callback) => {
  const csrfToken = getCSRFToken();
  const fetchSettings = {
    ...settings,
    headers: {
      'csrf-token': csrfToken,
    },
  };

  fetch(URL, fetchSettings)
    .then(response => callback(response))
    .catch(e => console.error('<UnlimitedControl> Error on fetch: ', e));
};

const collectFilter = filterName => {
  const filter = document.querySelector(`.search-s-facet--${filterName}`);
  let filterString = '';

  if (!filter) {
    console.warn(`<UnlimitedControl> No filter found on the page. Was looking for ${filterName}`);
    return filterString;
  }

  const checked = filter.querySelectorAll('input:checked');

  if (checked.length) {
    filterString += `${filterName}->`;

    checked.forEach(({ value }) => {
      filterString += `${value}|`;
    });

    filterString = encodeURIComponent(filterString.slice(0, -1)) + ',';
  }

  return filterString;
};

const getFilters = () => {
  let filtersString = 'filters=List(';

  FILTERS_ARRAY.forEach(filterName => {
    filtersString += collectFilter(filterName);
  });

  filtersString += 'resultType-%3EPEOPLE)';

  return filtersString;
};

const connectCallback = ({ status }) => {
  if (status > HIGHEST_EXPECTED_SUCCESS_STATUS_CODE) {
    alert("You're out of invites for now. Try again in couple of hours.");
  }
};

const setInviteSentStateToButton = button => {
  button.disabled = true;
  button.childNodes[0].nodeValue = 'Invite Sent';
};

const connect = ({ target }) => {
  const profileID = target.getAttribute('profileid');
  const trackingID = target.getAttribute('trackingid');
  const connectURL = `${API_BASE_URL}growth/normInvitations`;

  const settings = {
    method: 'POST',
    body: JSON.stringify({
      emberEntityName: 'growth/invitation/norm-invitation',
      invitee: {
        'com.linkedin.voyager.growth.invitation.InviteeProfile': {
          profileId: profileID,
        },
      },
      trackingId: trackingID,
    }),
  };

  setInviteSentStateToButton(target);
  sendRequest(connectURL, settings, connectCallback);
};

const changePage = (pageNumber = 1) => {
  const pageToSet = pageNumber <= 1 ? 1 : pageNumber;

  window.UCSettigs.currentPage = pageToSet;

  document.getElementById('uc-current-page').value = pageToSet;
};

const getFetchProfilesStartIndex = (profilesPerPage = DEFAULT_PROFILES_PER_PAGE_AMOUNT) => {
  const { currentPage } = window.UCSettigs;
  const startIndex = currentPage < 2 ? 0 : (currentPage - 1) * Number(profilesPerPage);

  return Number(startIndex);
};

const updateSearchResultsCount = (totalResultCount = 'unknown amount') => {
  chrome.storage.local.get(['profilesPerPage'], ({ profilesPerPage = DEFAULT_PROFILES_PER_PAGE_AMOUNT }) => {
    const startNumber = getFetchProfilesStartIndex(profilesPerPage) + 1;
    const endNumber = startNumber + Number(profilesPerPage) - 1;

    document.getElementById(
      'uc-results-count',
    ).innerHTML = `Showing profiles #${startNumber}-#${endNumber} of ${totalResultCount}`;
  });
};

const initOriginButtonsWithFetchFunctionality = () => {
  // TODO find better solution. Currently re-initing this because of buttons rerender
  document
    .querySelectorAll('.facet-collection-list__apply-button')
    .forEach(button => button.addEventListener('click', fetchProfiles));
};

const profileActionsCallback = response => {
  response
    .json()
    .then(({ results }) => {
      Object.keys(results).forEach(profileActionsID => {
        const { overflowActions, primaryAction, secondaryAction } = results[profileActionsID];

        if (!primaryAction) return;

        const correspondButton = document.querySelector(`[actionsID="${profileActionsID}"]`);

        if (!correspondButton || !correspondButton.childNodes) return;

        const primary = Object.keys(primaryAction.action)[0]
          .split('.')
          .pop();

        if (primary === 'InvitationPending') {
          setInviteSentStateToButton(correspondButton);
        } else if (primary === 'Message') {
          correspondButton.childNodes[0].nodeValue = 'Open in new tab';
          correspondButton.addEventListener('click', () => {
            const profileID = correspondButton.getAttribute('profileid');
            window.open(`/in/${profileID}`, '_blank');
          });
        } else {
          correspondButton.childNodes[0].nodeValue = primary;
          correspondButton.addEventListener('click', connect);
        }
      });

      initOriginButtonsWithFetchFunctionality();
    })
    .catch(e => console.error('<UnlimitedControl> Error on reading json of profiles actions: ', e));
};

const fetchProfileActions = profileActionsIDs => {
  if (!profileActionsIDs) {
    console.warn('<UnlimitedControl> trying to fetch profile action with wrong ids: ', profileActionsIDs);
    return;
  }

  const profileActionsIDsListString =
    typeof profileActionsIDs === 'string' ? profileActionsIDs : profileActionsIDs.join(',');
  const url = `${API_BASE_URL}identity/profileActionsV2?ids=List(${profileActionsIDsListString})`;

  sendRequest(url, {}, profileActionsCallback);
};

const renderProfiles = elements => {
  if (!elements) {
    console.error('<UnlimitedControl> Wrong data passed to renderProfiles: ', elements);
    return;
  }

  const profileActionsIDsCollection = [];

  elements.forEach(profileData => {
    const { targetUrn } = profileData;
    const profileActionsID = targetUrn.split(':').pop();

    profileActionsIDsCollection.push(profileActionsID);
    createProfileBlock(profileData, profileActionsID);
  });

  fetchProfileActions(profileActionsIDsCollection);
};

const fetchProfilesCallback = response => {
  response
    .json()
    .then(data => {
      console.log(data);
      const { elements: globalElements, metadata } = data;
      const { totalResultCount } = metadata;

      clearList();
      updateSearchResultsCount(totalResultCount);

      if (globalElements) {
        globalElements.forEach(({ type, elements }) => {
          // TODO take a look here into another type ("SEARCH_FEATURES")
          // There are interesting stuff with related results
          if (type === 'SEARCH_HITS') renderProfiles(elements);
        });
      } else {
        console.error(
          '<UnlimitedControl> There is not elements in fetchProfilesCallback response.json(). Instead there is: ',
          globalElements,
        );
      }
    })
    .catch(e => console.error('<UnlimitedControl> Error on getting JSON from response for fetchProfilesCallback: ', e));
};

const getKeywords = () => {
  const keywordsInput = document.querySelector('.search-global-typeahead__input');
  let keywords = '';

  if (!keywordsInput) {
    console.warn('<UnlimitedControl> No keyword inout found on the page');
    return keywords;
  }

  const inputValue = encodeURIComponent(keywordsInput.value);

  if (inputValue.length > 0) {
    keywords += `keywords=${inputValue}`;
  }

  return keywords;
};

const fetchProfiles = () => {
  chrome.storage.local.get(['profilesPerPage'], ({ profilesPerPage = DEFAULT_PROFILES_PER_PAGE_AMOUNT }) => {
    const filters = getFilters();
    const keywords = getKeywords();
    const startIndex = getFetchProfilesStartIndex(profilesPerPage);
    const url = `${API_BASE_URL}search/blended?count=${profilesPerPage}&${filters}&${keywords}&origin=FACETED_SEARCH&q=all&queryContext=List(spellCorrectionEnabled-%3Etrue,relatedSearchesEnabled-%3Etrue)&start=${startIndex}`;

    sendRequest(url, {}, fetchProfilesCallback);
  });
};

const onCurrentPageInput = ({ target }) => {
  const { value: newPage } = target;
  const { currentPage } = window.UCSettigs;

  if (newPage === currentPage) return;

  changePage(newPage);
  fetchProfiles();
};

const onPrevPageRequest = () => {
  const { currentPage } = window.UCSettigs;

  changePage(Number(currentPage) - 1);
  fetchProfiles();
};

const onNextPageRequest = () => {
  const { currentPage } = window.UCSettigs;

  changePage(Number(currentPage) + 1);
  fetchProfiles();
};

const minimizeUC = () => {
  document.getElementById('unlimited-controls').classList.toggle('minimized');
};

const onTogglerClick = () => {
  minimizeUC();
};

const initEventListeners = () => {
  document.getElementById('uc-prev-page').addEventListener('click', onPrevPageRequest);
  document.getElementById('uc-next-page').addEventListener('click', onNextPageRequest);
  document.getElementById('uc-toggler').addEventListener('click', onTogglerClick);
  document.getElementById('uc-current-page').addEventListener('input', onCurrentPageInput);
};

const init = () => {
  if (!window.UCSettigs.isInitFinished && !currentControlsElement) {
    createControlBlock();
    initEventListeners();

    currentControlsElement = document.getElementById('unlimited-controls');
  }

  const isMarkUpPrepared = prepareResultsMarkup();

  if (isMarkUpPrepared) {
    fetchProfiles();

    window.UCSettigs.isInitFinished = true;
  }
};

chrome.runtime.onMessage.addListener(({ command, settings }) => {
  if (command === 'updateProfiles') {
    if (window.UCSettigs.isInitFinished) {
      fetchProfiles();
    }
  }

  if (command === 'historyStateChanged') {
    settings.isPeopleSearchURL ? init() : removeControlsBlock();
  }
});

if (window.location.href.indexOf('linkedin.com/search/results/people') >= 0) {
  init();
}
