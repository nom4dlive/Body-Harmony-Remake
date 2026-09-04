/**
 * Utility to safely retrieve content from siteConfig with a hardcoded fallback.
 * Essential for the transition from static to dynamic landing page.
 */
export const getSafeContent = (config, section, field, fallback) => {
    if (!config || !config[section]) return fallback;
    const value = config[section][field];

    // Return value if it exists and is not an empty string
    if (value !== undefined && value !== null && value !== '') {
        return value;
    }

    return fallback;
};

/**
 * Generates editor attributes for a field to enable click-to-edit in VisualEditor.
 */
export const editorAttr = (section, field) => ({
    'data-sb-section': section,
    'data-sb-field': field
});
