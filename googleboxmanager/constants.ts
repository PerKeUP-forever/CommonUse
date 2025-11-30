import { Box } from './types';

export const INITIAL_BOXES: Box[] = [
  {
    id: "box-001",
    name: "杂项电子",
    location: "A-2 货架",
    color: "bg-blue-100",
    items: [
      {
        id: "item-1",
        name: "罗技 MX Master 3",
        description: "无线鼠标，握把处有轻微磨损。",
        category: "电子产品",
        quantity: 1,
        addedAt: new Date().toISOString(),
        attributes: [
          { key: "类型", value: "鼠标" },
          { key: "连接方式", value: "蓝牙/USB-C" },
          { key: "电池", value: "可充电锂电池" }
        ]
      },
      {
        id: "item-2",
        name: "HDMI 线缆",
        description: "各种长度，主要是 1.8米。",
        category: "线缆",
        quantity: 3,
        addedAt: new Date().toISOString(),
        attributes: [
          { key: "长度", value: "1.8米" },
          { key: "类型", value: "HDMI 2.0" }
        ]
      }
    ]
  },
  {
    id: "box-002",
    name: "露营装备",
    location: "车库 1号架",
    color: "bg-green-100",
    items: [
      {
        id: "item-3",
        name: "头灯",
        description: "Black Diamond Storm 400",
        category: "户外",
        quantity: 2,
        addedAt: new Date().toISOString(),
        attributes: [
          { key: "流明", value: "400" },
          { key: "电池类型", value: "4节 AAA" },
          { key: "防水等级", value: "IP67" }
        ]
      }
    ]
  },
  {
    id: "box-003",
    name: "节日装饰",
    location: "阁楼",
    color: "bg-red-100",
    items: []
  }
];

export const BOX_COLORS = [
  "bg-slate-100",
  "bg-red-100",
  "bg-orange-100",
  "bg-amber-100",
  "bg-yellow-100",
  "bg-lime-100",
  "bg-green-100",
  "bg-emerald-100",
  "bg-teal-100",
  "bg-cyan-100",
  "bg-sky-100",
  "bg-blue-100",
  "bg-indigo-100",
  "bg-violet-100",
  "bg-purple-100",
  "bg-fuchsia-100",
  "bg-pink-100",
  "bg-rose-100",
];