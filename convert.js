import fs from 'fs';

const filePath = 'c:\\Users\\ruthw\\OneDrive\\Desktop\\EZMoov-Webapp\\src\\components\\admin\\AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Extract the styles object
const stylesMatch = content.match(/const styles: \{ \[key: string\]: React\.CSSProperties \} = (\{[\s\S]*?\n\});/);
if (!stylesMatch) {
  console.log('Styles object not found');
  process.exit(1);
}

const stylesStr = stylesMatch[1];
const stylesObj = (new Function(`return ${stylesStr}`))();

// 2. Generate CSS
let css = '';
for (const [className, rules] of Object.entries(stylesObj)) {
  css += `.${className} {\n`;
  for (const [prop, value] of Object.entries(rules)) {
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `  ${cssProp}: ${value};\n`;
  }
  css += `}\n\n`;
}

// Add Mobile Media Queries to CSS
css += `
/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    bottom: 0;
    z-index: 50;
    transition: left 0.3s ease;
  }
  .sidebar.open {
    left: 0;
  }
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
  .mainContent {
    padding: 16px;
    width: 100vw;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .headerActions {
    width: 100%;
    justify-content: space-between;
  }
  .statsRow {
    grid-template-columns: 1fr;
  }
  .chartsRow {
    grid-template-columns: 1fr;
  }
  .table-responsive-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }
}
`;

fs.writeFileSync('c:\\Users\\ruthw\\OneDrive\\Desktop\\EZMoov-Webapp\\src\\components\\admin\\AdminDashboard.css', css);

// 3. Replace in TSX
// Remove the styles object definition entirely
content = content.replace(/\/\/ CSS-in-JS STYLES\nconst styles: \{ \[key: string\]: React\.CSSProperties \} = \{[\s\S]*?\n\};\n/g, '');

// Basic replacement style={styles.foo} -> className="foo"
content = content.replace(/style=\{styles\.([a-zA-Z0-9_]+)\}/g, 'className="$1"');

// Complex replacement style={{ ...styles.foo, ...styles.bar }} -> className="foo bar"
content = content.replace(/style=\{\{\s*\.\.\.styles\.([a-zA-Z0-9_]+),\s*\.\.\.styles\.([a-zA-Z0-9_]+)\s*\}\}/g, 'className="$1 $2"');

// Mixed replacement style={{ ...styles.foo, prop: 'val' }} -> className="foo" style={{ prop: 'val' }}
content = content.replace(/style=\{\{\s*\.\.\.styles\.([a-zA-Z0-9_]+),\s*(.*?)\s*\}\}/gs, (match, p1, p2) => {
    return `className="${p1}" style={{ ${p2} }}`;
});

// Import CSS
content = `import './AdminDashboard.css';\n` + content;

fs.writeFileSync(filePath, content);
console.log('Conversion completed.');
