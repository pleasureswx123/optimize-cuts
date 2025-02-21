import { defineComponent, h } from 'vue'

// 外框图标
export const FrameIcon = defineComponent({
  name: 'FrameIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z'
      })
    ])
  }
})

// 竖中柱图标
export const VerticalColumnIcon = defineComponent({
  name: 'VerticalColumnIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12 2L12 22M4 3H20c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1z',
        stroke: 'currentColor',
        fill: 'none',
        'stroke-width': '2'
      })
    ])
  }
})

// 横中柱图标
export const HorizontalColumnIcon = defineComponent({
  name: 'HorizontalColumnIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M2 12L22 12M4 3H20c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1z',
        stroke: 'currentColor',
        fill: 'none',
        'stroke-width': '2'
      })
    ])
  }
})

// 等分柱图标
export const EqualColumnIcon = defineComponent({
  name: 'EqualColumnIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M8 2L8 22M16 2L16 22M4 3H20c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1z',
        stroke: 'currentColor',
        fill: 'none',
        'stroke-width': '2'
      })
    ])
  }
})

// 窗扇图标
export const WindowSashIcon = defineComponent({
  name: 'WindowSashIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M4 3h16c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1zm2 2v14h12V5H6z'
      })
    ])
  }
})

// 门扇图标
export const DoorSashIcon = defineComponent({
  name: 'DoorSashIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z'
      })
    ])
  }
})

// 对开窗图标
export const DoubleWindowIcon = defineComponent({
  name: 'DoubleWindowIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12 3v18M4 3h16c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1zm2 2v14h4V5H6zm6 0v14h4V5h-4z'
      })
    ])
  }
})

// 对开门图标
export const DoubleDoorIcon = defineComponent({
  name: 'DoubleDoorIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12 3v18M4 3h16c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1H4c-.5 0-1-.5-1-1V4c0-.5.5-1 1-1zm2 2v14h4V5H6zm6 0v14h4V5h-4z'
      }),
      h('circle', {
        cx: '9',
        cy: '12',
        r: '.5'
      }),
      h('circle', {
        cx: '15',
        cy: '12',
        r: '.5'
      })
    ])
  }
})

// 门板图标
export const DoorPanelIcon = defineComponent({
  name: 'DoorPanelIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 4H7v10h10V7z'
      })
    ])
  }
})

// 方管图标
export const SquareTubeIcon = defineComponent({
  name: 'SquareTubeIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M5 5h14v14H5z'
      }),
      h('path', {
        d: 'M8 8h8v8H8z',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2'
      })
    ])
  }
})

// 墙图标
export const WallIcon = defineComponent({
  name: 'WallIcon',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M3 3h18v18H3V3zm3 3h4v4H6V6zm8 0h4v4h-4V6zm-8 8h4v4H6v-4zm8 0h4v4h-4v-4z'
      })
    ])
  }
})

export default {
  frame: FrameIcon,
  'vertical-column': VerticalColumnIcon,
  'horizontal-column': HorizontalColumnIcon,
  'equal-column': EqualColumnIcon,
  'window-sash': WindowSashIcon,
  'door-sash': DoorSashIcon,
  'double-window': DoubleWindowIcon,
  'double-door': DoubleDoorIcon,
  'door-panel': DoorPanelIcon,
  'square-tube': SquareTubeIcon,
  'wall': WallIcon
} 