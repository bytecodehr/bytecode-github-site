// Create a function to load the consent modal
window.gtmID = undefined;

function gtag() { dataLayer.push(arguments); }

function loadConsentModal() {
  window.dataLayer = window.dataLayer || [];
  
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'enabled',
    'wait_for_update': 500
  });
  dataLayer.push({'event': 'gtm.js', 'gtm.start': new Date().getTime()});
  // Define the HTML content
  const modalHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
    <div class="consent-modal">
      <div id="consent-modal--closeBtn">
        <i class="consent-banner--icon consent-banner--icon-x"></i>
      </div>
      <div class="consent-modal-body">
        <h2>Privacy & Cookie Consent</h2>
        <div class="consent-main" id="consent-main">
          <p>We value your privacy and want to be transparent about the data we collect, how we use it, and your rights to control that information. Consent for cookies and data collection helps us personalize and improve your experience. Please choose your preferences below.</p>
          <div class="consent-buttons">
            <button id="preferences-btn">Customise Preferences</button>
            <button id="grant-consent">Grant Consent To All</button>
            <button id="deny-consent">Deny Consent To All</button>
          </div>
        </div>
    
          <!-- Preferences Section -->
          <div class="consent-preferences" id="consent-preferences">
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon consent-banner--icon-chevronUp"></i>
                  <strong>Enable Targeted Ads</strong>
                </div>
                <input type="checkbox" id="ad_storage" class="checkbox" />
                <label for="ad_storage" class="switch"></label>
              </div>
              <div class="consent-description active">
                <span>Allow us to store information for the purpose of delivering tailored advertising based on your interests and interactions.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Allow Website Analytics</strong>
                </div>
                <input type="checkbox" id="analytics_storage" class="checkbox" />
                <label for="analytics_storage" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Consent to the storage of data for analyzing how you navigate and interact with our site, helping us improve your user experience.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Personalize Ad Profiles</strong>
                </div>
                <input type="checkbox" id="ad_user_data" class="checkbox" />
                <label for="ad_user_data" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Agree to the collection of demographic and behavioral data to create personalized advertising profiles.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Customize Ad Experience</strong>
                </div>
                <input type="checkbox" id="ad_personalization" class="checkbox" />
                <label for="ad_personalization" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Allow us to use your data to make the advertisements you see more relevant to your interests.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Remember Site Preferences</strong>
                </div>
                <input type="checkbox" id="functionality_storage" class="checkbox" />
                <label for="functionality_storage" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Permit us to remember your settings and preferences (like language and layout) for a more personalized website experience.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Personalize Content</strong>
                </div>
                <input type="checkbox" id="personalization_storage" class="checkbox" />
                <label for="personalization_storage" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Consent to the use of your data for personalizing your content experience beyond advertisements.</span>
              </div>
            </div>
    
            <div class="consent-preference">
              <div class="consent-preference-header">
                <div class="consent-preference-header--label">
                  <i class="consent-banner--icon  consent-banner--icon-chevronDown"></i>
                  <strong>Enhance Security</strong>
                </div>
                <input type="checkbox" id="security_storage" class="checkbox" checked />
                <label for="security_storage" class="switch"></label>
              </div>
              <div class="consent-description">
                <span>Enable us to store data critical for security purposes, such as authentication and fraud prevention.</span>
              </div>
            </div>

            <div class="consent-preferences--footer">
              <button id="save-preferences">Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    `;

  // Define the CSS content
  const modalCSS = `
    /* Modal Styles */
    .consent-modal, .consent-modal button, .consent-description {
      font-family: 'Montserrat', sans-serif;
    }

    #consent-banner {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    #reopen-consent-modal {
      z-index: 100;
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      border: 0;
      vertical-align: middle;
      color: #fff;
      border-radius:1.625rem;
      padding: 0.75rem;
      text-decoration: none;
      background: #282936;
      font-size: inherit;
      font-family: inherit;
      box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
    }

    #reopen-consent-modal i {
      width: 24px;
      height: 24px;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg> ');
      background-repeat: no-repeat;
    }

    #reopen-consent-modal span {
      font-family: Inter,Helvetica Neue,Helvetica,Arial,sans-serif;
      font-size: 14px;
      max-width: 0;
      -webkit-transition: max-width 1s;
      transition: max-width 1s;
      display: inline-block;
      vertical-align: top;
      white-space: nowrap;
      overflow: hidden;
    }

    #reopen-consent-modal:hover span {
      margin: 0 0.5rem;
      max-width: 12rem;
    }

    .consent-modal {
      position: relative;
      background-color: white;
      padding: 4px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 650px;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #consent-modal--closeBtn {
      cursor: pointer;
      position: absolute;
      top: 15px;
      right: 15px;
      color: #333;
    }

    .consent-modal-body {
      width: 100%;
      padding: 20px;
      max-height: calc(100vh - 210px);
      overflow-y: auto;
    }

    .consent-modal h2 {
      color: #333;
      font-size: 24px;
      margin-bottom: 20px;
    }

    .consent-modal p {
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      margin-bottom: 25px;
      max-width: 600px;
    }

    .consent-buttons {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }

    .consent-buttons button {
      padding: 10px 25px;
      border: none;
      border-radius: 4px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin: 0 10px;
    }

    #preferences-btn {
      background-color: #6094db; /* Soft Blue */
    }

    #grant-consent {
      background-color: #6bc47d; /* Soft Green */
    }

    #deny-consent {
      background-color: #db6b6b; /* Soft Red */
    }

    #save-preferences {
      background-color: #6bc47d; /* Soft Green */
      padding: 10px 25px;
      border: none;
      border-radius: 4px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .consent-modal button:hover {
      opacity: 0.9;
    }

    .consent-preferences {
      display: none;
      margin-top: 15px;
      width: 100%;
      border-top: 1px solid #dcdcdc;
    }

    .consent-preferences label {
      display: flex;
      align-items: center;
    }

    .consent-preference {
      border: 1px solid #dcdcdc;
      border-top: none;
    }

    .consent-preference-header {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25px 20px;
    }

    .consent-preference-header--label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 10px;
    }

    .consent-description {
      display: none;
      width: 100%;
      border-top: 1px solid #bab8b8;
      background-color: #f7f8fa;
      padding: 20px 30px;
      font-size: 0.9em;
      color: #666;
    }

    .consent-description.active {
      display: block;
    }

    .consent-preferences--footer {
      padding: 20px 0;
    }

    .consent-preferences .switch {
      flex-shrink: 0;
      cursor: pointer;
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.25);
      border-radius: 20px;
      transition: all 0.3s;
    }
    .consent-preferences .switch::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius:50%;
      background-color: white;
      top: 1px;
      left: 1px;
      transition: all 0.3s;
    }
    
    .consent-preferences .checkbox:checked + .switch::after {
      left : 21px;
    }
    .consent-preferences .checkbox:checked + .switch {
      background-color: #7983ff;
    }
    .consent-preferences .checkbox {
      display : none;
    }

    .consent-banner--icon {
      display: inline-block;
      width: 24px;
      height: 24px;
    }

    .consent-banner--icon-chevronDown {
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>');
      background-repeat: no-repeat;
    }
    
    .consent-banner--icon-chevronUp {
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15l6 -6l6 6" /></svg>');
      background-repeat: no-repeat;
    }

    .consent-banner--icon-x {
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>');
      background-repeat: no-repeat;
    }

    /* Custom Scrollbar CSS */
    /* Firefox */
    #consent-banner {
      scrollbar-width: auto;
      scrollbar-color: #dcdcdc #ffffff;
    }

    /* Chrome, Edge, and Safari */
    #consent-banner::-webkit-scrollbar {
      width: 16px;
    }

    #consent-banner::-webkit-scrollbar-track {
      background: #ffffff;
    }

    #consent-banner::-webkit-scrollbar-thumb {
      background-color: #dcdcdc;
      border-radius: 10px;
      border: 3px solid #ffffff;
    }


    @media (max-width: 768px) {
      .consent-modal {
        width: 95%;
      }

      .consent-modal-body {
        max-height: calc(100vh - 100px);
      }

      .consent-buttons {
        flex-direction: column;
        gap: 10px;
      }

      .consent-preference-header {
        padding: 20px 15px;
      }

      .consent-preference-header--label {
        gap: 12px;
      }

    }
  `;



  // Create style tag for CSS
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';
  styleTag.appendChild(document.createTextNode(modalCSS));

  // Append the style tag to the head
  document.head.appendChild(styleTag);

  // Create a div to hold the modal and add the modal HTML content
  const modalDiv = document.createElement('div');
  modalDiv.id = 'consent-banner';
  modalDiv.innerHTML = modalHTML;

  // Append the modal div to the body
  document.body.appendChild(modalDiv);

  window.setTagManager = setTagManager

}

function setTagManager(containerId) {
  if (!containerId) {
    console.error('GTM container ID not provided!');
    return;
  }
  window.gtmID = containerId;
}

function loadConsentModalJs() { 
  var consentBanner = document.getElementById('consent-banner');
  var grantButton = document.getElementById('grant-consent');
  var denyButton = document.getElementById('deny-consent');
  var closeButton = document.getElementById('consent-modal--closeBtn');

  // toggle consent preference details
  const preferenceEl = consentBanner.getElementsByClassName("consent-preference-header");

  for (let i = 0; i < preferenceEl.length; i++) {
    const element = preferenceEl[i];
    element.addEventListener("click", function () {
      const iEl = element.getElementsByTagName("i")[0];
      const data = element.nextElementSibling;

      let chevronDownClass = "consent-banner--icon consent-banner--icon-chevronDown";
      let chevronUpClass = "consent-banner--icon consent-banner--icon-chevronUp";

      if (iEl.className == chevronUpClass) {
        iEl.classList.value = chevronDownClass;
      } else {
        iEl.classList.value = chevronUpClass;
      }
      data.classList.toggle("active");
    });
  }

  closeButton.addEventListener('click', function() {
    consentBanner.style.display = 'none';
  });

  grantButton.addEventListener('click', function() {
    localStorage.setItem('consentGranted', 'true');
    updateConsent(true);
    consentBanner.style.display = 'none';
  });

  denyButton.addEventListener('click', function() {
    localStorage.setItem('consentGranted', 'false');
    updateConsent(false);
    consentBanner.style.display = 'none';
  });

  function updateConsent(consent) {
    var consentConfig = {
      'ad_storage': consent ? 'granted' : 'denied',
      'analytics_storage': consent ? 'granted' : 'denied',
      'ad_user_data': consent ? 'granted' : 'denied',
      'ad_personalization': consent ? 'granted' : 'denied',
      'functionality_storage': consent ? 'granted' : 'denied',
      'personalization_storage': consent ? 'granted' : 'denied',
      'security_storage': consent ? 'granted' : 'denied',
    };
    gtag('consent', 'update', consentConfig);
    localStorage.setItem('individualConsentPreferences', JSON.stringify(consentConfig));
    if (consent) loadTagManager();
  }

  function loadTagManager() {
    var gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmID;
    document.head.appendChild(gtmScript);
  }

  if(localStorage.getItem('consentGranted') === 'true') {
    updateConsent(true);
    consentBanner.style.display = 'none';
  }

  // Existing consent banner code goes here

  // Function to save individual consent preferences
  function saveIndividualConsentPreferences() {
    var consentConfig = {
      'ad_storage': document.getElementById('ad_storage').checked ? 'granted' : 'denied',
      'analytics_storage': document.getElementById('analytics_storage').checked ? 'granted' : 'denied',
      'ad_user_data': document.getElementById('ad_user_data').checked ? 'granted' : 'denied',
      'ad_personalization': document.getElementById('ad_personalization').checked ? 'granted' : 'denied',
      'functionality_storage': document.getElementById('functionality_storage').checked ? 'granted' : 'denied',
      'personalization_storage': document.getElementById('personalization_storage').checked ? 'granted' : 'denied',
      'security_storage': document.getElementById('security_storage').checked ? 'granted' : 'denied',
      // Add other preferences
    };
    gtag('consent', 'update', consentConfig);
    localStorage.setItem('consentGranted', 'true');
    localStorage.setItem('individualConsentPreferences', JSON.stringify(consentConfig));
  }

  // Function to load individual consent preferences
  function loadIndividualConsentPreferences() {
    var savedPreferences = localStorage.getItem('individualConsentPreferences');
    if (savedPreferences) {
      var preferences = JSON.parse(savedPreferences);
      for (var key in preferences) {
        if (preferences.hasOwnProperty(key)) {
          document.getElementById(key).checked = preferences[key] === 'granted';
        }
      }
    }
  }

  // "Save Preferences" button functionality
  var savePreferencesBtn = document.getElementById('save-preferences');
  savePreferencesBtn.addEventListener('click', function() {
    saveIndividualConsentPreferences();
    if (isAnyCheckboxChecked) loadTagManager();
    document.getElementById('consent-preferences').style.display = 'none';
    document.getElementById('consent-banner').style.display = 'none';
  });

  // Load individual preferences when the modal is opened
  var preferencesBtn = document.getElementById('preferences-btn');
  preferencesBtn.addEventListener('click', function() {
    loadIndividualConsentPreferences();
    document.getElementById('consent-main').style.display = 'none';
    document.getElementById('consent-preferences').style.display = 'block';
  });

  // Link to reopen the consent modal
  var reopenConsentModalLink = document.getElementById('reopen-consent-modal');
  reopenConsentModalLink.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('consent-main').style.display = 'block';
    document.getElementById('consent-banner').style.display = 'flex';
  });

  function isAnyCheckboxChecked() {
    var preferencesDiv = document.getElementById('consent-preferences');
    var checkboxes = preferencesDiv.querySelectorAll('input[type="checkbox"]');
    return Array.from(checkboxes).some(checkbox => checkbox.checked);
  }
};
