/*
  Authoritative price list — used server-side to compute what a customer is
  actually charged. Never trust prices sent from the browser.

  Keep this in sync with js/products.js (the display copy shown in the
  shop). There's no build step tying the two together on a static site, so
  if you change a price or add a product, update BOTH files.
*/
const PRODUCTS = {
  "esp32-devkit": { name: "ESP32-WROOM Dev Board", price: 699 },
  "stm32-nucleo": { name: "STM32 Nucleo-F401RE", price: 1099 },
  "nrf52-ble": { name: "nRF52832 BLE Module", price: 449 },
  "mpu6050-imu": { name: "MPU6050 IMU Sensor", price: 199 },
  "lora-module": { name: "LoRa SX1278 Module", price: 349 },
  "vibration-kit": { name: "Condition Monitoring Starter Kit", price: 2499 },
  "consult-1hr": { name: "1-Hour Technical Consult", price: 2500 },
  "sprint-5hr": { name: "5-Hour Prototype Sprint Block", price: 11000 },
  "retainer-weekly": { name: "Weekly Firmware Retainer", price: 45000 }
};

module.exports = { PRODUCTS };
