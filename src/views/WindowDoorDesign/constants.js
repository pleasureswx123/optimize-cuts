// src/views/WindowDoorDesign/constants.js

export const TOOLS = [
  {
    id: 'select',
    name: '选择',
    icon: 'mdi:cursor-default-outline',
    type: 'tool'
  },
  {
    id: 'outer-frame',
    name: '外框',
    icon: 'mdi:border-all',
    type: 'frame'
  },
  {
    id: 'vertical-column',
    name: '竖中柱',
    icon: 'mdi:view-column',
    type: 'column'
  },
  {
    id: 'horizontal-column',
    name: '横中柱',
    icon: 'mdi:view-stream',
    type: 'column'
  },
  {
    id: 'equal-column',
    name: '等分柱',
    icon: 'mdi:view-grid',
    type: 'column'
  },
  {
    id: 'window-sash',
    name: '窗扇',
    icon: 'mdi:window-open',
    type: 'window'
  },
  {
    id: 'door-sash',
    name: '门扇',
    icon: 'mdi:door',
    type: 'door'
  },
  {
    id: 'double-window',
    name: '对开窗',
    icon: 'mdi:window-open-variant',
    type: 'window'
  },
  {
    id: 'double-door',
    name: '对开门',
    icon: 'mdi:door-sliding',
    type: 'door'
  },
  {
    id: 'door-panel',
    name: '门板',
    icon: 'mdi:door-closed',
    type: 'door'
  },
  {
    id: 'square-tube',
    name: '方管',
    icon: 'mdi:square-outline',
    type: 'component'
  },
  {
    id: 'wall',
    name: '墙',
    icon: 'mdi:wall',
    type: 'wall'
  }
];

export const CATEGORIES = [
  {
    id: 'default',
    name: '平开默认系列',
    items: [
      {
        id: 'standard-door',
        name: '标准门',
        thumbnail: '/categories/standard-door.png',
        dimensions: { width: 2000, height: 2000 }
      },
      {
        id: 'standard-window',
        name: '标准窗',
        thumbnail: '/categories/standard-window.png',
        dimensions: { width: 1500, height: 1500 }
      }
    ]
  },
  {
    id: 'custom',
    name: '自定义系列',
    items: []
  }
];

export const GRID_SETTINGS = {
  DEFAULT_SIZE: 50,
  COLOR: '#e0e0e0',
  SNAP_THRESHOLD: 10
};

export const CANVAS_SETTINGS = {
  DEFAULT_WIDTH: 2000,
  DEFAULT_HEIGHT: 2000,
  BACKGROUND_COLOR: '#ffffff'
};

export const SHAPE_DEFAULTS = {
  strokeWidth: 2,
  stroke: '#000000',
  fill: 'transparent',
  cornerStyle: 'circle',
  cornerSize: 8,
  transparentCorners: false,
  cornerColor: '#ffffff',
  cornerStrokeColor: '#000000',
  borderColor: '#2196f3',
  borderScaleFactor: 2,
  borderDashArray: [3, 3]
}; 