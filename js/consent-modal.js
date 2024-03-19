// Create a function to load the consent modal
let gtmID = undefined;
function loadConsentModal() {

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
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
      <h2>Privacy & Cookie Consent</h2>
      <div class="consent-main" id="consent-main">
        <p>We value your privacy and want to be transparent about the data we collect, how we use it, and your rights to control that information. Consent for cookies and data collection helps us personalize and improve your experience. Please choose your preferences below.</p>
        <div class="consent-buttons">
          <button id="preferences-btn">Preferences</button>
          <button id="grant-consent">Grant Consent</button>
          <button id="deny-consent">Deny Consent</button>
        </div>
      </div>
  
        <!-- Preferences Section -->
        <div class="consent-preferences" id="consent-preferences">
          <div class="consent-preference">
            <div>
              <strong>Enable Targeted Ads</strong>
              <input type="checkbox" id="ad_storage">
            </div>
            <div>
              <span class="consent-description">Allow us to store information for the purpose of delivering tailored advertising based on your interests and interactions.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Allow Website Analytics</strong>
              <input type="checkbox" id="analytics_storage">
            </div>
            <div>
              <span class="consent-description">Consent to the storage of data for analyzing how you navigate and interact with our site, helping us improve your user experience.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Personalize Ad Profiles</strong>
              <input type="checkbox" id="ad_user_data">
            </div>
            <div>
              <span class="consent-description">Agree to the collection of demographic and behavioral data to create personalized advertising profiles.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Customize Ad Experience</strong>
              <input type="checkbox" id="ad_personalization">
            </div>
            <div>
              <span class="consent-description">Allow us to use your data to make the advertisements you see more relevant to your interests.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Remember Site Preferences</strong>
              <input type="checkbox" id="functionality_storage">
            </div>
            <div>
              <span class="consent-description">Permit us to remember your settings and preferences (like language and layout) for a more personalized website experience.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Personalize Content</strong>
              <input type="checkbox" id="personalization_storage">
            </div>
            <div>
              <span class="consent-description">Consent to the use of your data for personalizing your content experience beyond advertisements.</span>
            </div>
          </div>
  
          <div class="consent-preference">
            <div>
              <strong>Enhance Security</strong>
              <input type="checkbox" id="security_storage">
            </div>
            <div>
              <span class="consent-description">Enable us to store data critical for security purposes, such as authentication and fraud prevention.</span>
            </div>
          </div>
  
          <button id="save-preferences">Save Preferences</button>
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

    .consent-modal {
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 650px;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: center;
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
      margin: 0 10px;
    }

    .consent-modal button:hover {
      opacity: 0.9;
    }

    .consent-preferences {
      display: none;
      margin-top: 15px;
      width: 100%;
    }

    .consent-preferences label {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }

    .consent-description {
      font-size: 0.9em;
      color: #666;
      margin-left: 20px;
      max-width: 550px;
    }

    @media (max-width: 768px) {
      .consent-modal {
        width: 95%;
        padding: 20px;
      }
      .consent-description {
        margin-left: 10px;
      }
    }
  `;

  document.addEventListener('DOMContentLoaded', function () {
    var consentBanner = document.getElementById('consent-banner');
    var grantButton = document.getElementById('grant-consent');
    var denyButton = document.getElementById('deny-consent');

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
      consentBanner.style.display = 'none';
      document.getElementById('consent-preferences').style.display = 'none';
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
  });

  function setTagManager(containerId) {
    if (!containerId) {
      console.error('GTM container ID not provided!');
      return;
    }
    gtmID = containerId;
  }

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

  // Add event listeners or any additional JavaScript below
  // Example: document.querySelector('#save-preferences').addEventListener('click', savePreferences);
}

window.setTagManager = setTagManager;
// Call the function to load the modal when the document is ready
document.addEventListener('DOMContentLoaded', loadConsentModal);
