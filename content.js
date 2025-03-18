console.log("Selenium Test Builder: Content script loaded on " + window.location.href);

let panel = null;
let isSelecting = false;

function createPanel() {
    if (panel) return;

    console.log("Attempting to create panel");
    try {
        if (!document.body) {
            console.error("document.body is not available yet");
            return;
        }
        panel = document.createElement('div');
        panel.id = 'selenium-test-builder-panel';
        panel.innerHTML = `
            <h3>Selenium Test Builder</h3>
            <label>Test ID: <input id="testId" type="text" placeholder="e.g., guest_login"></label><br>
            <label>Description: <input id="desc" type="text" placeholder="e.g., Guest login test"></label><br>
            <label><input id="dataDriven" type="checkbox"> Data-Driven</label>
            <input id="dataFile" type="text" placeholder="testdata/users.csv"><br>
            <label>Start Page: <input id="startPage" type="text" placeholder="e.g., login"></label><br>
            <h4>Actions</h4>
            <div id="actions"></div>
            <button id="addAction">Add Action</button>
            <h4>Assertions</h4>
            <div id="assertions"></div>
            <button id="addAssertion">Add Assertion</button>
            <button id="generate">Generate & Download</button>
            <button id="closePanel">Close</button>
            <style>
                #selenium-test-builder-panel {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 300px;
                    padding: 10px;
                    background: yellow;
                    border: 2px solid red;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                }
                .step {
                    margin: 5px 0;
                }
                button {
                    margin: 5px 0;
                }
            </style>
        `;
        document.body.appendChild(panel);
        console.log("Panel successfully appended to DOM");

        // Event listeners
        document.getElementById('addAction').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Add Action button clicked");
            startElementSelection();
        });
        document.getElementById('addAssertion').addEventListener('click', addAssertion);
        document.getElementById('generate').addEventListener('click', generateAndDownload);
        document.getElementById('closePanel').addEventListener('click', () => {
            if (isSelecting) stopElementSelection();
            panel.remove();
            panel = null;
            console.log("Panel closed");
        });
    } catch (error) {
        console.error("Error creating panel:", error);
    }
}

// Ensure panel creation after DOM is ready or with a fallback delay
function initializePanel() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log("DOM already loaded, creating panel immediately");
        createPanel();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM fully loaded, creating panel");
            createPanel();
        });
        setTimeout(() => {
            if (!panel) {
                console.log("Fallback: Creating panel after 1-second delay");
                createPanel();
            }
        }, 1000);
    }
}

// Start panel initialization
initializePanel();

function startElementSelection() {
    if (isSelecting) return;
    isSelecting = true;
    console.log("Starting element selection");
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mouseover', highlightElement, { capture: true });
    document.addEventListener('click', selectElement, { capture: true, once: true });
}

function stopElementSelection() {
    isSelecting = false;
    console.log("Stopping element selection");
    document.body.style.cursor = 'default';
    document.removeEventListener('mouseover', highlightElement, { capture: true });
}

function highlightElement(e) {
    if (!isSelecting) return;
    e.preventDefault();
    e.stopPropagation();
    console.log("Highlighting element:", e.target.tagName, e.target.id);
    e.target.style.outline = '2px solid blue';
    e.target.addEventListener('mouseout', () => {
        e.target.style.outline = '';
    }, { once: true });
}

function selectElement(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Element selected:", e.target.tagName, e.target.id);
    stopElementSelection();
    addAction({ id: e.target.id || e.target.tagName, page: window.location.pathname.split('/').pop() || 'unknown' });
}

function addAction(element) {
    console.log("Adding action for element:", element);
    const actionsDiv = document.getElementById('actions');
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `
        <select class="action-type">
            <option value="navigate">Navigate</option>
            <option value="enter">Enter</option>
            <option value="click">Click</option>
        </select>
        Page: <input type="text" class="action-page" value="${element.page}">
        Element: <input type="text" class="action-element" value="${element.id}">
        Value: <input type="text" class="action-value" placeholder="e.g., testuser">
    `;
    actionsDiv.appendChild(div);
}

function addAssertion() {
    console.log("Adding assertion");
    const assertionsDiv = document.getElementById('assertions');
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `
        <select class="assertion-type">
            <option value="url">URL</option>
            <option value="visible">Visible</option>
        </select>
        Value: <input type="text" class="assertion-value" placeholder="e.g., /cart">
        Condition: <select class="assertion-condition">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
        </select>
    `;
    assertionsDiv.appendChild(div);
}

function generateAndDownload() {
    console.log("Generating test snippet");
    try {
        const testId = document.getElementById('testId')?.value || "default_test";
        const desc = document.getElementById('desc')?.value || "Default description";
        const dataFile = document.getElementById('dataDriven')?.checked ? document.getElementById('dataFile')?.value : '';
        const startPage = document.getElementById('startPage')?.value || '';

        console.log("Test ID:", testId, "Description:", desc, "Data File:", dataFile, "Start Page:", startPage);

        let output = `\ntest.${testId}.description=${desc}`;
        if (dataFile) output += `\ntest.${testId}.dataFile=${dataFile}`;
        if (startPage) output += `\ntest.${testId}.startPage=${startPage}`;

        const actions = document.querySelectorAll('#actions .step');
        console.log("Found", actions.length, "actions");
        actions.forEach((action, i) => {
            const type = action.querySelector('.action-type');
            const page = action.querySelector('.action-page');
            const element = action.querySelector('.action-element');
            const value = action.querySelector('.action-value');
            console.log(`Action ${i}: type=${type?.value}, page=${page?.value}, element=${element?.value}, value=${value?.value}`);
            if (type) output += `\ntest.${testId}.actions[${i}].action=${type.value}`;
            if (type?.value === "navigate") {
                if (page) output += `\ntest.${testId}.actions[${i}].targetPage=${page.value}`;
            } else {
                if (page) output += `\ntest.${testId}.actions[${i}].page=${page.value}`;
                if (element) output += `\ntest.${testId}.actions[${i}].element=${element.value}`;
                if (value?.value) output += `\ntest.${testId}.actions[${i}].value=${value.value}`;
            }
        });

        const assertions = document.querySelectorAll('#assertions .step');
        console.log("Found", assertions.length, "assertions");
        assertions.forEach((assertion, i) => {
            const type = assertion.querySelector('.assertion-type');
            const value = assertion.querySelector('.assertion-value');
            const condition = assertion.querySelector('.assertion-condition');
            console.log(`Assertion ${i}: type=${type?.value}, value=${value?.value}, condition=${condition?.value}`);
            if (type) output += `\ntest.${testId}.assertions[${i}].type=${type.value}`;
            if (value) output += `\ntest.${testId}.assertions[${i}].value=${value.value}`;
            if (condition) output += `\ntest.${testId}.assertions[${i}].condition=${condition.value}`;
        });

        console.log("Generated output:", output);
        chrome.runtime.sendMessage({
            action: "download",
            content: output,
            filename: "test_snippet.properties"
        });
    } catch (error) {
        console.error("Error generating test snippet:", error);
    }
}

// Toggle panel via message from background script (optional)
chrome.runtime.onMessage.addListener((message) => {
    console.log("Message received:", message);
    if (message.action === "togglePanel") {
        if (!panel) createPanel();
        else {
            if (isSelecting) stopElementSelection();
            panel.remove();
            panel = null;
        }
    }
});