# Zendesk App for Promoter

[![Latest Version](https://img.shields.io/github/release/delivered/promoter-zendesk.svg?style=flat-square)](https://github.com/delivered/promoter-zendesk/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

Access your Promoter feedback and score data from within Zendesk.

## Installation

1. [Download the latest app package](https://github.com/delivered/promoter-zendesk/releases/latest) - File will be available in the "Downloads" section and look something like `app-YYYYMMDDHHMMSS.zip`.
2. Browse to your Zendesk Apps Management Screen (https://{your-subdomain}.zendesk.com/agent/admin/apps/manage)
3. Click "Upload private app"
4. Enter the name of the app - "Promoter" is recommended
5. Choose the zip file downloaded in step 1
6. Click "Upload"
7. Approve the terms and conditions by clicking a second "Upload"
8. Enter your Promoter API key
9. Click "Install"

## Usage

After the app has been successfully installed and enabled, it will show up in the right pane of the User and Ticket views within Zendesk.

Upon initial load of the User Profile or Ticket, the app will search for feedback records in your Promoter account associated with the User's primary email address or Ticket Requestors email address.

When feedback data is found a list of all the feedback events will be displayed. These list items will include the score and score level. Each list item can be expanded to reveal the details of the feedback.

Also presented will be an average score. The average score is computed client-side based on all the feedback data returned.

## Contributing

Please see [CONTRIBUTING](https://github.com/delivered/promoter-zendesk/blob/master/CONTRIBUTING.md) for details.

## Credits

- [Steven Maguire](https://github.com/stevenmaguire)
- [All Contributors](https://github.com/delivered/promoter-zendesk/contributors)

## License

The MIT License (MIT). Please see [License File](https://github.com/delivered/promoter-zendesk/blob/master/LICENSE) for more information.



