/**
 * Feature flag for using the GREEN-only database view
 * When enabled, the API queries the green_chargers view instead of parts table
 */
export const useGreenView = (): boolean => {
  return (process.env.USE_GREEN_VIEW ?? '1') === '1';
};

/**
 * Get the appropriate table/view name based on the feature flag
 */
export const getChargerSource = (): string => {
  return useGreenView() ? 'green_chargers' : 'parts';
};

/**
 * Get the appropriate query filters based on the data source
 */
export const getChargerFilters = () => {
  if (useGreenView()) {
    // When using green_chargers view, no additional filtering needed
    return {};
  } else {
    // When using parts table, need to filter for GREEN chargers
    return {
      category_slug: 'battery-chargers',
      or: 'slug.ilike.green%,name.ilike.%green%'
    };
  }
};
