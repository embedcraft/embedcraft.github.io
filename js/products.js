/*
  Product catalog — display copy only.

  IMPORTANT: prices here are for showing the catalog in the browser. The
  amount actually charged comes from the authoritative copy of this list in
  functions/products.js, looked up server-side when an order is created.
  If you change a price or add a product, update BOTH files — see the
  "Shop & payments setup" section in README.md.

  icon: two-letter tag shown on the placeholder thumbnail (swap in real
  product photos later — see README).
*/
window.PRODUCTS = [
  {
    id: "esp32-devkit",
    name: "ESP32-WROOM Dev Board",
    category: "Dev Boards",
    price: 699,
    unit: "board",
    icon: "E32",
    physical: true,
    description: "Dual-core Wi-Fi + BLE dev board, breadboard-friendly. Our go-to for wireless sensor and IoT prototypes."
  },
  {
    id: "stm32-nucleo",
    name: "STM32 Nucleo-F401RE",
    category: "Dev Boards",
    price: 1099,
    unit: "board",
    icon: "F4",
    physical: true,
    description: "ARM Cortex-M4 board with on-board ST-LINK debugger. What we use for bare-metal / RTOS firmware bring-up."
  },
  {
    id: "nrf52-ble",
    name: "nRF52832 BLE Module",
    category: "Sensors & Modules",
    price: 449,
    unit: "module",
    icon: "BLE",
    physical: true,
    description: "Bluetooth Low Energy 5.x SoC module — the same family we use for BLE product firmware."
  },
  {
    id: "mpu6050-imu",
    name: "MPU6050 IMU Sensor",
    category: "Sensors & Modules",
    price: 199,
    unit: "unit",
    icon: "IMU",
    physical: true,
    description: "6-axis accelerometer + gyroscope over I2C — vibration monitoring, orientation sensing, motion detection."
  },
  {
    id: "lora-module",
    name: "LoRa SX1278 Module",
    category: "Sensors & Modules",
    price: 349,
    unit: "module",
    icon: "LoRa",
    physical: true,
    description: "Long-range, low-power radio module for battery-powered sensor networks with no gateway hardware needed."
  },
  {
    id: "vibration-kit",
    name: "Condition Monitoring Starter Kit",
    category: "Kits",
    price: 2499,
    unit: "kit",
    icon: "KIT",
    physical: true,
    description: "ESP32 + accelerometer/temp sensor pre-wired, matching our featured vibration-monitoring demo project."
  },
  {
    id: "consult-1hr",
    name: "1-Hour Technical Consult",
    category: "Consultation",
    price: 2500,
    unit: "session",
    icon: "1H",
    physical: false,
    description: "A focused call to review your design, debug a hard problem, or sanity-check an approach before you commit engineering time to it."
  },
  {
    id: "sprint-5hr",
    name: "5-Hour Prototype Sprint Block",
    category: "Consultation",
    price: 11000,
    unit: "block",
    icon: "5H",
    physical: false,
    description: "A block of hands-on engineering time to get a proof-of-concept running on real hardware — the riskiest assumption tested first."
  },
  {
    id: "retainer-weekly",
    name: "Weekly Firmware Retainer",
    category: "Consultation",
    price: 45000,
    unit: "week",
    icon: "WK",
    physical: false,
    description: "Ongoing embedded engineering capacity for teams mid-build — regular check-ins, direct access to the engineers doing the work."
  }
];

window.PRODUCT_CATEGORIES = ["Dev Boards", "Sensors & Modules", "Kits", "Consultation"];

window.getProduct = function(id){
  return window.PRODUCTS.find(function(p){ return p.id === id; });
};

var CATEGORY_GRADIENTS = {
  "Dev Boards": "linear-gradient(135deg,#2f5bff,#1e40d6)",
  "Sensors & Modules": "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "Kits": "linear-gradient(135deg,#2f5bff,#7c3aed)",
  "Consultation": "linear-gradient(135deg,#0f172a,#5b6474)"
};
window.categoryGradient = function(category){
  return CATEGORY_GRADIENTS[category] || "linear-gradient(135deg,#2f5bff,#7c3aed)";
};
