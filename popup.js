// const fetchDocumentData = () => {
  document.getElementById("report-btn").onclick = () => {
    console.log("onclick")
  chrome.runtime.sendMessage({ method: "clear" }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: getDocumentInfo,
        },
        () => {
          if (chrome.runtime.lastError) {
            document.getElementById("base-url").value =
              "Error: " + chrome.runtime.lastError.message;
          } else {
            chrome.runtime.sendMessage({ method: "get" }, (response) => {
              console.log("going to dataToPopup")
              dataToPopup(response);
            });
          }
        }
      );
    });
  });
};

// fetchDocumentData();

async function getDocumentInfo() {

  console.log("getDocumentInfo")

  // get favicon function
  const getFavicon = () => {
    let favicon = undefined;
    let nodeList = document.getElementsByTagName("link");
    for (let i = 0; i < nodeList.length; i++)
    {
        if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
        {
            favicon = nodeList[i].getAttribute("href");
        }
    }
  
    if(favicon === undefined || favicon === null || favicon === "") {
      return false;
    } else {
      return true;
    }
  }

  const getImageAltText = () => {
    let imagesWithoutAlt = [];
    let nodeList = document.getElementsByTagName("img");

    for (let i = 0; i < nodeList.length; i++)
    {
      let altText = nodeList[i].alt.length > 0 ? true : false;
      if(!altText) {
        imagesWithoutAlt.push(nodeList[i].src)
      }
    }

    return imagesWithoutAlt;
  }

  const getOGTags = () => {
    let ogTags = false;
    let nodeList = document.querySelectorAll("meta[property]");

    for (let i = 0; i < nodeList.length; i++)
    {
      let isOgTag = nodeList[i].getAttribute('property').includes('og');
      if(isOgTag) {
        ogTags = true;
      }
    }

    return ogTags;
  }

  // get favicon function
  const getCanonicalUrl = () => {
    let canonicalUrl = undefined;
    let nodeList = document.getElementsByTagName("link");
    for (let i = 0; i < nodeList.length; i++)
    {
        if((nodeList[i].getAttribute("rel") == "canonical"))
        {
          canonicalUrl = nodeList[i].getAttribute("href");
        }
    }
  
    if(canonicalUrl === undefined || canonicalUrl === null || canonicalUrl === "") {
      return false;
    } else {
      return canonicalUrl;
    }
  }

  const getNoindexTag = () => {
    let content = document.getElementsByTagName('meta').robots.content
    let included = content.includes('noindex');

    if(included) return true;
    else return false;
  }

  const getSSL = () => {
    let content = document.location.protocol
    let included = content.includes('https');

    if(included) return true;
    else return false;
  }

  // Base URL
  let baseUrl = document.baseURI;

  // Title
  let title = document.title;

  // Meta description
  let description = document.getElementsByTagName('meta').description.content;

  // Headings
  let h1Count = document.getElementsByTagName("h1").length;

  let h2Count = document.getElementsByTagName("h2").length;
  let h3Count = document.getElementsByTagName("h3").length;
  let h4Count = document.getElementsByTagName("h4").length;
  let h5Count = document.getElementsByTagName("h5").length;
  let h6Count = document.getElementsByTagName("h6").length;

  // Alt Text of Images
  let imageAltText = getImageAltText();

  // XML Sitemap
  let xmlRes = await fetch('sitemap.xml');
  let xmlSitemap = xmlRes.status === 404 ? 'Not found' : 'Found';
  
  // XML Sitemap
  let robotsRes = await fetch('robots.txt');
  let robotsTxt = robotsRes.status === 404 ? 'Not found' : 'Found';

  // Iframe
  let iframe = document.getElementsByTagName('iframe').length > 0 ? true : false;

  // Favicon
  let favicon = getFavicon()

  // doctype
  let doctype = document.doctype.name !== 'html' ? document.doctype.name : 'HTML5' ;

  // Encoding
  let encoding = document.inputEncoding;

  // Open Graph Tags
  let ogTags = getOGTags();

  // // Canonical Url
  let canonicalUrl = getCanonicalUrl();

  // // Noindex Tag
  let noindexTag = getNoindexTag();

  // // SSL Certificate
  let ssl = getSSL();

  // links (Start)
  let links = document.getElementsByTagName("link");
  let cssCount = 0;
  let jsCount = 0;
  for (let i = 0; i < links.length; i++) {
    if (/\.css$/.test(links[i].href)) cssCount++;
    if (/\.js$/.test(links[i].href)) jsCount++;
  }

  let jsScriptTags = document.getElementsByTagName("script");
  for (let i = 0; i < jsScriptTags.length; i++) {
    if(jsScriptTags[i].src > 0) {
      jsCount++;
    }
  }
  // links (End)


  let keyPoints = {title, description, h1Count, h2Count, h3Count, h4Count, h5Count, h6Count, 
                   favicon, imageAltText, xmlSitemap, robotsTxt, doctype, encoding, iframe, 
                   canonicalUrl, noindexTag, ssl, ogTags, jsCount, cssCount }

  let dataObject = { baseUrl, keyPoints }

  chrome.runtime.sendMessage({ method: "set", value: dataObject }, () => {});
}

function dataToPopup(response) {

  const { keyPoints, baseUrl } = response.value;

  console.log("datatopopup")

  document.getElementById("report-btn").style.display = "none";
  document.getElementById("main-wrapper").style.display = "block";

  document.getElementById("base-url").innerHTML = baseUrl;

  // Title
  document.getElementById("site-title").innerHTML = keyPoints.title;
  document.getElementById("title-length").innerHTML = "<b>Length : </b>" + keyPoints.title.length;
  if(keyPoints.title.length > 10 && keyPoints.title.length < 70) {
    document.getElementById('site-title').classList.add("success-mark")
  }

  // Description
  document.getElementById("site-description").innerHTML = keyPoints.description;
  document.getElementById("description-length").innerHTML = "<b>Length : </b>" + keyPoints.description.length;
  if(keyPoints.description.length > 70 && keyPoints.description.length < 320) {
    document.getElementById('site-description').classList.add("success-mark")
  }

  // Headings
  document.getElementById("heading-h1").innerHTML = keyPoints.h1Count;
  document.getElementById("heading-h2").innerHTML = keyPoints.h2Count;
  document.getElementById("heading-h3").innerHTML = keyPoints.h3Count;
  document.getElementById("heading-h4").innerHTML = keyPoints.h4Count;
  document.getElementById("heading-h5").innerHTML = keyPoints.h5Count;
  document.getElementById("heading-h6").innerHTML = keyPoints.h6Count;
  if(keyPoints.h1Count > 1) {
    document.getElementById("site-headings").innerHTML = "Your Webpage has more than 1 h1 tags";
    document.getElementById('site-headings').classList.add("error-mark")
  } else if(keyPoints.h1Count === 1) {
    document.getElementById("site-headings").innerHTML = "Good, Your webpage has only 1 h1 tag";
    document.getElementById('site-headings').classList.add("success-mark")
  } else if(keyPoints.h1Count <= 0) {
    document.getElementById("site-headings").innerHTML = "Oops, your webpage has not any h1 tag";
    document.getElementById('site-headings').classList.add("warning-mark")
  }

  document.getElementById("site-alt-text").innerHTML = keyPoints.imageAltText;
  document.getElementById("site-xml").innerHTML = keyPoints.xmlSitemap;
  document.getElementById("site-robots").innerHTML = keyPoints.robotsTxt;

  // Iframe
  if(keyPoints.iframe) {
    document.getElementById("site-iframe").classList.add("error-mark")
    document.getElementById("site-iframe").innerHTML = "Oops, Your website contains iframe";
  } else {
    document.getElementById("site-iframe").classList.add("error-mark")
    document.getElementById("site-iframe").innerHTML = "Perfect, no iframe content has been detected";
  }

  // Favicon
  if(keyPoints.favicon) {
    document.getElementById("site-favicon").classList.add("success-mark")
    document.getElementById("site-favicon").innerHTML = "Great, Your website has a favicon";
  } else {
    document.getElementById("site-favicon").classList.add("error-mark")
    document.getElementById("site-favicon").innerHTML = "Oops, Your website has not favicon";
  }

  // Doctype
  document.getElementById("site-doctype").classList.add("success-mark")
  document.getElementById("site-doctype").innerHTML = "Your webpage doctype is: " + keyPoints.doctype;;

  // Encoding
  if(keyPoints.encoding === 'UTF-8') {
    document.getElementById("site-encoding").classList.add("success-mark")
    document.getElementById("site-encoding").innerHTML = "Great, language/character encoding is specified: " + keyPoints.encoding;
  } else {
    document.getElementById("site-encoding").classList.add("warning-mark")
    document.getElementById("site-encoding").innerHTML = "Language/character encoding is specified: " + keyPoints.encoding;
  }
}