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

  // get performance parameters
  const getPerformance = () => {
    try {
      let perfObject = {};
      let { timing, timeOrigin } = JSON.parse(JSON.stringify(window.performance));
      perfObject.domCompleted = (timing.domComplete - timeOrigin)/1000; // ms to s
      perfObject.connectTime = (timing.connectEnd - timing.connectStart)/1000; //ms to s
      perfObject.domContentEvent = (timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart)/1000; //ms to s
      perfObject.responseTime = (timing.responseEnd - timing.requestStart)/1000; // ms to s
      perfObject.unloadEvent = (timing.unloadEventEnd - timing.unloadEventStart)/1000; // ms to s
      perfObject.domInteractive = (timing.domInteractive - timeOrigin)/1000; // ms to s
      perfObject.redirectTime = (timing.redirectEnd - timing.redirectStart)/1000; // ms to s

      return perfObject;
    } catch (error) {
      return error;
    }
  }

  // get Meta Description
  const metaDescription = () => {
    try {
      const description = document.getElementsByTagName('meta').description.content;

      if(description.length > 0) {
        return description;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // get favicon function
  const getFavicon = () => {
    try {
      let favicon = undefined;
      let nodeList = document.getElementsByTagName("link");
      for (let i = 0; i < nodeList.length; i++)
      {
          if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
          {
              favicon = nodeList[i].getAttribute("href");
          }
      }
    
      if(favicon) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  const getImageAltText = () => {
    try {
      let imagesWithoutAlt = [];
      let nodeList = document.getElementsByTagName("img");
      let totalImages = nodeList.length;

      for (let i = 0; i < nodeList.length; i++)
      {
        let altText = nodeList[i].alt.length > 0 ? true : false;
        if(!altText) {
          imagesWithoutAlt.push(nodeList[i].src)
        }
      }

      return { totalImages, imagesWithoutAlt };
    } catch (error) {
      return false;
    }
  }

  const xmlSitemapExists = async() => {
    try {
      let xmlRes = await fetch('/sitemap.xml');
      let xmlSitemap = xmlRes.status === 404 ? false : true;
      return xmlSitemap;
    } catch (error) {
      return false;
    }
  }

  const robotsTxtExists = async () => {
    try {
      let robotsRes = await fetch('/robots.txt');
      let robotsTxt = robotsRes.status === 404 ? false : true;
      return robotsTxt;
    } catch (error) {
      return false;
    }
  }

  const getOGTags = () => {
    try {
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
    } catch (error) {
      return false;
    }
  }

  // get favicon function
  const getCanonicalUrl = () => {
    try {
      let canonicalUrl = undefined;
      let nodeList = document.getElementsByTagName("link");
      for (let i = 0; i < nodeList.length; i++)
      {
          if((nodeList[i].getAttribute("rel") == "canonical"))
          {
            canonicalUrl = nodeList[i].getAttribute("href");
          }
      }
    
      if(canonicalUrl) {
        return canonicalUrl;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  const getNoindexTag = () => {
    try {
      let robotsTagExists = document.getElementsByTagName('meta').robots.content
      if(robotsTagExists) {
        let included = content.includes('noindex');

        if(included) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch(error) {
      return false
    } 
  }

  const getSSL = () => {
    try {
      let content = document.location.protocol
      let included = content.includes('https');

      if(included) return true;
      else return false;
    } catch (error) {
      return false;
    }
  }

  // Performance Parameter
  let performanceObject = getPerformance();

  console.log({performanceObject});

  // Base URL
  let baseUrl = document.baseURI;

  // Title
  let title = document.title;

  // Meta description
  let description = metaDescription();
  console.log("first")
  // Headings
  let h1Count = document.getElementsByTagName("h1").length;

  let h2Count = document.getElementsByTagName("h2").length;
  let h3Count = document.getElementsByTagName("h3").length;
  let h4Count = document.getElementsByTagName("h4").length;
  let h5Count = document.getElementsByTagName("h5").length;
  let h6Count = document.getElementsByTagName("h6").length;

  // Alt Text of Images
  let images = getImageAltText();

  // XML Sitemap
  let xmlSitemap = xmlSitemapExists();
  
  // XML Sitemap
  let robotsTxt = robotsTxtExists();

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

  // domain 
  let domain = document.domain;


  let keyPoints = { performanceObject, title, description, h1Count, h2Count, h3Count, h4Count, h5Count, h6Count, 
                   favicon, images, xmlSitemap, robotsTxt, doctype, encoding, iframe, 
                   canonicalUrl, noindexTag, ssl, ogTags, jsCount, cssCount, domain }

  let dataObject = { baseUrl, keyPoints }

  console.log("dataObject")

  chrome.runtime.sendMessage({ method: "set", value: dataObject }, () => {});
}

function dataToPopup(response) {

  const { keyPoints, baseUrl } = response.value;

  let score = 0
  let scorePerSuccess = 7.14;

  console.log("datatopopup")

  document.getElementById("report-btn").style.display = "none";
  document.getElementById("main-wrapper").style.display = "block";
  document.getElementById("logo").style.marginTop = "5%";
  document.getElementById("logo").style.marginBottom = "5%";

  document.getElementById("base-url").innerHTML = baseUrl;

  // Title
  document.getElementById("site-title").innerHTML = keyPoints.title;
  document.getElementById("title-length").innerHTML = "<b>Length : </b>" + keyPoints.title.length;
  if(keyPoints.title.length > 10 && keyPoints.title.length < 70) {
    score = scorePerSuccess + score;
    document.getElementById('site-title').classList.add("success-mark")
  } else {
    document.getElementById('site-title').classList.add("error-mark")
  }

  // Description
  if(keyPoints.description) {
    document.getElementById("site-description").innerHTML = keyPoints.description;
    document.getElementById("description-length").innerHTML = "<b>Length : </b>" + keyPoints.description.length;
    if(keyPoints.description.length > 70 && keyPoints.description.length < 320) {
      score = scorePerSuccess + score;
      document.getElementById('site-description').classList.add("success-mark")
    } else {
      document.getElementById('site-description').classList.add("warning-mark")
    }
  } else {
    document.getElementById("site-description").innerHTML = "Oops, your webpage has not any meta description";
    document.getElementById('site-description').classList.add("error-mark")
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
    score = scorePerSuccess + score;
    document.getElementById("site-headings").innerHTML = "Good, Your webpage has only 1 h1 tag";
    document.getElementById('site-headings').classList.add("success-mark")
  } else if(keyPoints.h1Count <= 0) {
    document.getElementById("site-headings").innerHTML = "Oops, your webpage has not any h1 tag";
    document.getElementById('site-headings').classList.add("warning-mark")
  }

  // Images without alt text
  document.getElementById("site-alt-text").innerHTML = keyPoints.images.totalImages;
  if(keyPoints.images.imagesWithoutAlt.length > 0) {
    document.getElementById('images-withuot-alt').classList.add("error-mark")
    document.getElementById("images-withuot-alt").innerHTML = keyPoints.images.imagesWithoutAlt.length + " ALT attributes are empty or missing.";

    const div = document.getElementById('images-withuot-alt');
    const ul = document.createElement("ul");
    ul.setAttribute("id", "image-list");

    for (let i = 0; i < keyPoints.images.imagesWithoutAlt.length; i++) {
      const li = document.createElement("li");
      li.innerHTML = keyPoints.images.imagesWithoutAlt[i];
      li.setAttribute("class", "image-list-item")
      ul.appendChild(li);
    }

    div.appendChild(ul);

  } else {
    score = scorePerSuccess + score;
    document.getElementById('images-withuot-alt').classList.add("success-mark")
    document.getElementById("images-withuot-alt").innerHTML =  "Good, Every images have alt attributes.";
  }

  // XML Sitemap
  if (keyPoints.xmlSitemap) {
    score = scorePerSuccess + score;
    document.getElementById('site-xml').classList.add("success-mark")
    document.getElementById("site-xml").innerHTML = "Good, you have XML Sitemap file";
  } else {
    document.getElementById('site-xml').classList.add("error-mark")
    document.getElementById("site-xml").innerHTML = "Oops, you have not XML Sitemap file";
  }

  // Robots.txt
  if (keyPoints.robotsTxt) {
    score = scorePerSuccess + score;
    document.getElementById('site-robots').classList.add("success-mark")
    document.getElementById("site-robots").innerHTML = "Good, you have Robots.txt file";
  } else {
    document.getElementById('site-robots').classList.add("error-mark")
    document.getElementById("site-robots").innerHTML = "Oops, you have not Robots.txt file";
  }

  // Iframe
  if(keyPoints.iframe) {
    document.getElementById("site-iframe").classList.add("error-mark")
    document.getElementById("site-iframe").innerHTML = "Oops, Your website contains iframe";
  } else {
    score = scorePerSuccess + score;
    document.getElementById("site-iframe").classList.add("success-mark")
    document.getElementById("site-iframe").innerHTML = "Perfect, no iframe content has been detected";
  }

  // Favicon
  if(keyPoints.favicon) {
    score = scorePerSuccess + score;
    document.getElementById("site-favicon").classList.add("success-mark")
    document.getElementById("site-favicon").innerHTML = "Great, Your website has a favicon";
  } else {
    document.getElementById("site-favicon").classList.add("error-mark")
    document.getElementById("site-favicon").innerHTML = "Oops, Your website has not favicon";
  }

  // Doctype
  score = scorePerSuccess + score;
  document.getElementById("site-doctype").classList.add("success-mark")
  document.getElementById("site-doctype").innerHTML = "Your webpage doctype is: " + keyPoints.doctype;;

  // Encoding
  if(keyPoints.encoding === 'UTF-8') {
    score = scorePerSuccess + score;
    document.getElementById("site-encoding").classList.add("success-mark")
    document.getElementById("site-encoding").innerHTML = "Great, language/character encoding is specified: " + keyPoints.encoding;
  } else {
    document.getElementById("site-encoding").classList.add("warning-mark")
    document.getElementById("site-encoding").innerHTML = "Language/character encoding is specified: " + keyPoints.encoding;
  }

  if (keyPoints.ogTags) {
    score = scorePerSuccess + score;
    document.getElementById("site-og").classList.add("success-mark")
    document.getElementById("site-og").innerHTML = "Your page is using Facebook Open Graph Tags.";
  } else {
    document.getElementById("site-og").classList.add("error-mark")
    document.getElementById("site-og").innerHTML = "Your page is not using Facebook Open Graph Tags.";
  }
  
  if (keyPoints.canonicalUrl) {
    score = scorePerSuccess + score;
    document.getElementById("site-canonical").classList.add("success-mark")
    document.getElementById("site-canonical").innerHTML = "Your page is using the Canonical Tag.";
    let canonical = document.getElementById("site-canonical")
    let div = document.createElement("a");
    div.setAttribute("id", "site-canonical-url");
    div.setAttribute("class", "card-value");
    div.href = keyPoints.canonicalUrl;
    div.innerHTML = keyPoints.canonicalUrl;

    canonical.parentNode.insertBefore(div, canonical.nextSibling);
  } else {
    document.getElementById("site-canonical").classList.add("error-mark")
    document.getElementById("site-canonical").innerHTML = "Your page is not using the Canonical Tag.";
  }

  // NoIndex Tag
  if (!keyPoints.noindexTag) {
    score = scorePerSuccess + score;
    document.getElementById("site-noindex").classList.add("success-mark");
    document.getElementById("site-noindex").innerHTML = "Your page is not using the Noindex Tag which prevents indexing.";
  } else {
    document.getElementById("site-noindex").classList.add("error-mark");
    document.getElementById("site-noindex").innerHTML = "Your page is using the Noindex Tag which prevents indexing.";
  }

  // SSL Enabled
  if (keyPoints.ssl) {
    score = scorePerSuccess + score;
    document.getElementById("site-ssl").classList.add("success-mark")
    document.getElementById("site-ssl").innerHTML = "Greate, Your website has SSL enabled.";
  } else {
    document.getElementById("site-ssl").classList.add("error-mark")
    document.getElementById("site-ssl").innerHTML = "Oops, Your website has not been SSL enabled.";
  }

  // Number of Resources
  document.getElementById("resource-js").innerHTML = keyPoints.jsCount;
  document.getElementById("resource-css").innerHTML = keyPoints.cssCount;

  document.getElementById("site-domain").innerHTML = keyPoints.domain;
  let date = new Date();
  document.getElementById("current-date").innerHTML = date.toLocaleString();

  // Performance Matrix
  if(keyPoints.performanceObject) {
    const { performanceObject } = keyPoints;
    document.getElementById("performance-dom-completed").innerHTML = performanceObject.domCompleted + "s";
    document.getElementById("performance-connect-time").innerHTML = performanceObject.connectTime + "s";
    document.getElementById("performance-dom-content").innerHTML = performanceObject.domContentEvent + "s";
    document.getElementById("performance-response-time").innerHTML = performanceObject.responseTime + "s";
    document.getElementById("performance-unload-event").innerHTML = performanceObject.unloadEvent + "s";
    document.getElementById("performance-dom-interactive").innerHTML = performanceObject.domInteractive + "s";
    document.getElementById("performance-redirect-time").innerHTML = performanceObject.redirectTime + "s";
  }

  scoreProgressBar(score);
}

function scoreProgressBar(score) {
  var elem = document.getElementById("myBar");
    var width = score.toFixed(2);
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
      } else {
        elem.style.width = width + "%";
        elem.innerHTML = width  + "%";
      }
    }
}