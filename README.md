# Selenium Test Builder Chrome Extension

The **Selenium Test Builder** is a Chrome extension designed to simplify the creation of test scenarios and user journeys for the `selenium-cucumber-test` automation suite. It allows testers to visually select elements on a web page, define actions (e.g., `click`, `enter`, `navigate`), and specify assertions (e.g., `url`, `visible`), then generates and appends these as entries in the `tests.properties` file. This tool is ideal for non-technical users and speeds up test development within a Selenium-Cucumber-Java framework.

## Features
- **Visual Element Selection**: Point-and-click to choose inputs, buttons, or links on the page with hover highlighting.
- **Action Definition**: Select from supported actions like `navigate`, `enter`, and `click`.
- **Assertion Builder**: Define checks for URLs, element visibility, and more.
- **Properties Generation**: Outputs `tests.properties`-compatible snippets for your test suite.
- **Integration**: Works seamlessly with the `selenium-cucumber-test` project.
- **User-Friendly**: No coding required—build tests directly in the browser.

## Prerequisites
- **Chrome Browser**: Version 90 or higher (tested with 134).
- **Target Web Application**: A running instance of your web app (e.g., `http://localhost:3000` from `selenium-cucumber-webapp`).
- **Selenium-Cucumber-Test Suite**: The parent project must be set up with `tests.properties` in `src/test/resources/testdata/`.

## Screenshot
![screenshot](/builder.png)

## Installation

1. **Clone or Download the Extension**:
   - Clone the repository or download the `selenium-test-builder` folder:
     ```bash
     git clone <repository-url>
     cd selenium-test-builder
     ```
   - Alternatively, extract a provided ZIP file.

2. **Ensure Icon Exists**:
   - Create a 16x16 PNG file named `icon.png` (e.g., a simple logo or shape) and place it in the `selenium-test-builder` directory.

3. **Load the Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top-right corner).
   - Click **Load unpacked** and select the `selenium-test-builder` folder.
   - The extension icon should appear in your toolbar.

4. **Verify Setup**:
   - Pin the extension to your toolbar for easy access.
   - Ensure your web app (e.g., `http://localhost:3000`) is running via `npm start` in `selenium-cucumber-webapp`.

## Usage

### Creating a New Test
1. **Open the Web Application**:
   - Navigate to your target app (e.g., `http://localhost:3000/login`).

2. **Load the Sidebar**:
   - The extension automatically displays a yellow sidebar with a red border on the right side of the page when loaded on `http://localhost:3000/*`.

3. **Define Test Metadata**:
   - **Test ID**: Enter a unique identifier (e.g., `guest_login`).
   - **Description**: Add a brief description (e.g., "Guest login and cart navigation").
   - **Data-Driven**: Check if using a CSV file (optional), and specify the file (e.g., `testdata/users.csv`).
   - **Reset Driver**: Leave unchecked unless testing multiple users.
   - **Start Page**: Set the initial page (e.g., `login`).

4. **Add Actions**:
   - Click **Add Action** in the sidebar.
   - Move your cursor over the page; it should change to a crosshair, and elements should highlight with a blue outline on hover.
   - Click an element (e.g., a button or input) to select it.
   - Choose an action from the dropdown (e.g., `enter`, `click`, `navigate`) and fill in fields like `Value` (e.g., `testuser`) or `targetPage` (e.g., `cart`).
   - Repeat to build the user journey (e.g., enter username, click login, navigate to cart).

5. **Add Assertions**:
   - Click **Add Assertion**.
   - Select a type (e.g., `url`, `visible`), enter a value (e.g., `/cart`), and choose a condition (e.g., `contains`).
   - Add more as needed.

6. **Generate the Test**:
   - Click **Generate & Download** to create a `tests.properties` snippet.
   - A file named `test_snippet.properties` will download.

7. **Integrate with `tests.properties`**:
   - Open `test_snippet.properties` from your Downloads folder.
   - Copy its contents.
   - Paste into `src/test/resources/testdata/tests.properties` in your `selenium-cucumber-test` project.
   - Example output:
     ```properties
     test.guest_login.description=Guest login and cart navigation
     test.guest_login.startPage=login
     test.guest_login.actions[0].action=navigate
     test.guest_login.actions[0].targetPage=login
     test.guest_login.actions[1].page=login
     test.guest_login.actions[1].element=username
     test.guest_login.actions[1].action=enter
     test.guest_login.actions[1].value=guest@example.com
     test.guest_login.actions[2].page=login
     test.guest_login.actions[2].element=loginButton
     test.guest_login.actions[2].action=click
     test.guest_login.actions[3].action=navigate
     test.guest_login.actions[3].targetPage=cart
     test.guest_login.assertions[0].type=url
     test.guest_login.assertions[0].value=/cart
     test.guest_login.assertions[0].condition=contains
     ```

8. **Run the Test**:
   - In your `selenium-cucumber-test` project:
     ```bash
     mvn test -Dcucumber.filter.tags="@guest_login"
     ```

## Project Structure
```
selenium-test-builder/
├── manifest.json        # Extension configuration
├── content.js          # Injects and manages the sidebar
├── background.js       # Handles toolbar click and downloads
├── icon.png            # Toolbar icon (16x16 PNG)
└── README.md           # This documentation
```

## Supported Actions
| Action       | Description                       | Fields in UI                |
|--------------|-----------------------------------|-----------------------------|
| `navigate`   | Navigates to a page              | `targetPage`                |
| `enter`      | Enters text into an input        | `page`, `element`, `value`  |
| `click`      | Clicks an element                | `page`, `element`           |

## Supported Assertions
| Type      | Description                       | Fields in UI                |
|-----------|-----------------------------------|-----------------------------|
| `url`     | Checks current URL               | `value`, `condition`        |
| `visible` | Checks element visibility        | `page`, `element`, `condition` |

## Limitations
- **File Appending**: Currently downloads a snippet due to Chrome’s security restrictions. Direct appending requires additional setup (future enhancement).
- **Element Detection**: Relies on elements having `id` attributes; falls back to tag names if missing, which may need manual adjustment.
- **Single Browser**: Chrome-only for now.

## Troubleshooting
- **Sidebar Not Visible**:
  - Open DevTools (`Ctrl+Shift+I`) > Console and check for logs like:
    ```
    Selenium Test Builder: Content script loaded on http://localhost:3000/
    Creating panel
    Panel appended to DOM
    ```
  - If missing, verify your app’s URL matches `http://localhost:3000/*` in `manifest.json`. Update `matches` if different (e.g., `http://localhost:8080/*`).

- **No Element Highlighting**:
  - Click **Add Action** and check the console for:
    ```
    Add Action button clicked
    Starting element selection
    Highlighting element: <tag> <id>
    ```
  - If logs stop at `Starting element selection`, ensure no page scripts block `mouseover` events.
  - Test on a simple page (e.g., `http://localhost:3000/login`) and inspect the DOM.

- **Plugin Not Loading**:
  - Ensure `icon.png` exists (16x16 PNG) in the directory.
  - Check `chrome://extensions/` > Errors for issues.

- **Test Fails After Adding**:
  - Verify `baseUrl` in `config.dev.properties` matches your app (e.g., `http://localhost:3000`).
  - Run `mvn test -X -e > output.log` and review logs.

## Development

### Prerequisites
- **Chrome**: For testing and loading the extension.

### Build Instructions
1. Edit files in `selenium-test-builder/`.
2. Reload the extension in `chrome://extensions/` after changes.

### Future Enhancements
- **Direct File Appending**: Integrate with a local server or File System Access API.
- **More Actions**: Add support for `kafkaProduce`, `restCall`, etc.
- **Validation**: Preview and validate snippets before saving.

## Contributing
- Report issues or suggest features via the repository’s issue tracker.
- Submit pull requests to enhance functionality or fix bugs.

## License
MIT License.