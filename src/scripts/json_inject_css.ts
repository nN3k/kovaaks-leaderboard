//colors
fetch('/colors.json')
  .then(response => response.json())
  .then(colors => {
    // Set CSS variables from JSON values
    document.documentElement.style.setProperty('--main-color', colors.main);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--contrast', colors.primaryContrast);
    document.documentElement.style.setProperty('--secondary-contrast', colors.secondaryContrast);
  })
  .catch(err => console.error('Error loading colors.json:', err));