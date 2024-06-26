let button = document.getElementById('html-cpy-btn');

const domain = 'https://aicvpro.com';
// const domain = 'http://localhost:8007';
const localDomain = 'http://localhost:3000';

const endpoint = '/api/send-resume/get-clean-resume-text';

const redirectUri = '/create?tab=copy-paste';

const redirectUrl = domain + redirectUri;

const url = domain + endpoint;

const getHtml = () => {
    var html = document.getElementsByTagName('html')[0].innerHTML;
    return html;
}

if (button) {
    button.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                const firstTab = tabs[0];
                if (!firstTab.url) {
                    document.querySelector('p').innerText = "Please open your LinkedIn profile first";
                    return;
                }
                if (!firstTab.url.includes('linkedin.com')) {
                    document.querySelector('p').innerText = "Please open your LinkedIn profile first";
                    return;
                }
                chrome.tabs.sendMessage(firstTab.id ?? -1, { message: 'copy-html-action' }, (resume) => {
                    if (resume) {
                        var xhr = new XMLHttpRequest();
                        document.querySelector('button').innerText = "Processing...";
                        document.querySelector('p').innerText = "Copied profile is being processed...";

                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.send(JSON.stringify({ resume }));

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                navigator.clipboard.writeText(
                                    xhr.responseText
                                ).then(() => {
                                    document.querySelector('button').innerText = "Copied!";
                                    chrome.tabs.update({ url: redirectUrl });
                                    window.close();
                                }).catch((e) => {
                                    document.querySelector('button').innerText = "Error!";
                                });

                                document.querySelector('p').innerText = xhr.responseText;

                                setTimeout(() => {
                                    document.querySelector('button').innerText = "Send Profile to AICVPro";
                                }, 4000);
                            }
                        }

                        xhr.onerror = function () {
                            document.querySelector('button').innerText = "Error!";
                        }

                        xhr.onload = function () {
                            document.querySelector('button').innerText = "Loaded!";
                        }

                        xhr.onprogress = function () {
                            document.querySelector('button').innerText = "Loading...";
                        }

                        xhr.ontimeout = function () {
                            document.querySelector('button').innerText = "Timeout!";
                        }
                    }
                });
            } else {
                alert('Please open your LinkedIn profile first');
            }

        });
    }
    );
}

chrome.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
    if (payload.message === 'copy-html-action') {
        sendResponse(getHtml());
    }
});

// chrome.action.setBadgeText({ text: 'Copy' });
// chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });