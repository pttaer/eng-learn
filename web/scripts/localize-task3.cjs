const fs = require('fs');
const path = require('path');

const studioPath = path.join(__dirname, '..', 'src', 'ielts', 'views', 'writing-studio.ts');
let studioCode = fs.readFileSync(studioPath, 'utf8');
studioCode = studioCode.replace("import { I18n, t } from '../../core/i18n';", "import { t } from '../../core/i18n';");
fs.writeFileSync(studioPath, studioCode, 'utf8');

console.log('Fixed writing-studio.ts');
