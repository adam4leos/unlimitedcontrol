const DEFAULT_PROFILES_PER_PAGE_AMOUNT = 10;
const MINIMUM_PROFILES_PER_PAGE = 1;
const MAXIMUM_PROFILES_PER_PAGE = 49;

function reportError(error) {
  document.getElementById('popup-content').classList.add('hidden');
  document.getElementById('error-content').classList.remove('hidden');
  document.getElementById('more-error').textContent += ` ${error.message}`;
  console.error(`Something goes wrong: ${error.message}`);
}

function addLoadButton(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {
    command: 'addControls',
  });
}

function sentProfilesUpdateCommand() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (chrome.runtime.lastError) {
      reportError(chrome.runtime.lastError.message);
    } else {
      chrome.tabs.sendMessage(tabs[0].id, {
        command: 'updateProfiles',
      });
    }
  });
}

function updateProfilesPerPageInput(newValue) {
  const valueToSet = newValue || DEFAULT_PROFILES_PER_PAGE_AMOUNT;
  document.getElementById('profilesPerPage').value = valueToSet;
}

function updateConnectingFollowInput(newValue) {
  document.getElementById('connectingFollow').checked = Boolean(newValue);
}

function updateWithStoredData() {
  chrome.storage.local.get(
    ['profilesPerPage', 'isConnectingFollowEnabled'],
    ({ profilesPerPage, isConnectingFollowEnabled }) => {
      if (profilesPerPage) {
        updateProfilesPerPageInput(profilesPerPage);
      }

      if (isConnectingFollowEnabled) {
        updateConnectingFollowInput(isConnectingFollowEnabled);
      }
    },
  );
}

function applyProfilesPerPageSetting() {
  const profilesPerPageInput = document.getElementById('profilesPerPage');
  const { value } = profilesPerPageInput;

  chrome.storage.local.set({ profilesPerPage: value });
}

function applyConnectingFollowSetting() {
  const connectingFollowCheckbox = document.getElementById('connectingFollow');
  const { checked } = connectingFollowCheckbox;

  chrome.storage.local.set({ isConnectingFollowEnabled: Number(checked) });
}

function showConfirmationCheckMark() {
  const checkMark = document.querySelector('.settings__confirm');

  checkMark.classList.add('visible');

  setTimeout(() => checkMark.classList.remove('visible'), 1000);
}

function applySettings() {
  applyProfilesPerPageSetting();
  applyConnectingFollowSetting();
  showConfirmationCheckMark();
  sentProfilesUpdateCommand();
}

function listenForEvents() {
  document.addEventListener('click', ({ target }) => {
    if (target.classList.contains('add-controls')) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (chrome.runtime.lastError) {
          reportError(chrome.runtime.lastError.message);
        } else {
          addLoadButton(tabs);
        }
      });
    }

    if (target.classList.contains('settings__submit')) {
      applySettings();
    }
  });

  document.addEventListener('input', ({ target }) => {
    if (target.classList.contains('profiles-per-page')) {
      let { value } = target;

      if (value < MINIMUM_PROFILES_PER_PAGE) value = MINIMUM_PROFILES_PER_PAGE;
      if (value > MAXIMUM_PROFILES_PER_PAGE) value = MAXIMUM_PROFILES_PER_PAGE;

      target.value = value;
    }
  });

  document.addEventListener('submit', event => {
    event.preventDefault();

    if (event.target.classList.contains('settings__form')) {
      applySettings();
    }
  });
}

function init() {
  updateWithStoredData();
  listenForEvents();
}

init();
