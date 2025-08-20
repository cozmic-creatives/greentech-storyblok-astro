/**
 * Grid layout utilities for responsive grid configurations
 */

export interface GridConfig {
  usesGridTemplate: boolean;
  gridClassConfig: string;
  gridId: string;
  gridCSS: string;
}

export interface GridTemplates {
  lgTemplate: string;
  mdTemplate: string;
  smTemplate: string;
}

/**
 * Parse grid column configuration and determine if it uses custom templates
 * @param numberOfColumns - Column configuration string
 * @param gridClasses - Additional CSS classes
 */
export function parseGridConfig(numberOfColumns?: string, gridClasses: string = ''): GridConfig {
  const usesGridTemplate = numberOfColumns?.includes(';') || false;
  const gridId = `grid-${Math.random().toString(36).substring(2, 9)}`;
  
  let gridClassConfig = '';
  let gridCSS = '';

  if (usesGridTemplate && numberOfColumns) {
    const templates = parseGridTemplates(numberOfColumns);
    gridCSS = generateGridCSS(gridId, templates);
  } else {
    gridClassConfig = generateGridClasses(numberOfColumns, gridClasses);
  }

  return {
    usesGridTemplate,
    gridClassConfig,
    gridId,
    gridCSS,
  };
}

/**
 * Parse semicolon-separated grid template configuration
 * @param numberOfColumns - Format: "3fr,2fr,2fr,2fr; 3fr,2fr,2fr,2fr; 3fr,2fr,2fr,2fr"
 */
function parseGridTemplates(numberOfColumns: string): GridTemplates {
  const breakpoints = numberOfColumns.split(';').map(bp => bp.trim());

  const lgTemplate = breakpoints[0] ? breakpoints[0].replace(/,/g, ' ') : '';
  const mdTemplate = breakpoints[1] ? breakpoints[1].replace(/,/g, ' ') : lgTemplate;
  const smTemplate = breakpoints[2] ? breakpoints[2].replace(/,/g, ' ') : mdTemplate;

  return { lgTemplate, mdTemplate, smTemplate };
}

/**
 * Generate CSS for custom grid templates with responsive breakpoints
 * @param gridId - Unique ID for the grid element
 * @param templates - Grid template configuration for different breakpoints
 */
function generateGridCSS(gridId: string, templates: GridTemplates): string {
  return `
  #${gridId} {
    display: grid;
    grid-template-columns: ${templates.smTemplate};
  }
  
  @media (min-width: 48rem) {
    #${gridId} {
      grid-template-columns: ${templates.mdTemplate};
    }
  }
  
  @media (min-width: 64rem) {
    #${gridId} {
      grid-template-columns: ${templates.lgTemplate};
    }
  }
`;
}

/**
 * Generate Tailwind CSS grid classes for standard column configuration
 * @param numberOfColumns - Comma-separated column counts: "lg,md,sm"
 * @param gridClasses - Additional CSS classes
 */
function generateGridClasses(numberOfColumns?: string, gridClasses: string = ''): string {
  const columnConfig = numberOfColumns?.split(',') || ['1', '2', '3'];
  const [lgColumns, mdColumns, smColumns] = columnConfig;
  
  return `grid grid-cols-${smColumns || 1} md:grid-cols-${mdColumns || 2} lg:grid-cols-${lgColumns || 3} ${gridClasses}`;
}

/**
 * Generate a unique grid ID
 */
export function generateGridId(): string {
  return `grid-${Math.random().toString(36).substring(2, 9)}`;
}